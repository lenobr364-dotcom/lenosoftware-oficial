import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { SignatureStepId, SignatureWorkflow } from "@/lib/contracts/types";
import { INTERNATIONAL_TERMS_VERSION } from "@/lib/international-licensing-terms";

const STEP_ORDER: SignatureStepId[] = [
  "draft",
  "terms_generated",
  "awaiting_signature",
  "signed",
  "anchored",
];

function storePath(): string {
  return path.join(process.cwd(), "chemvault-public", "licensing-contracts", "workflows.json");
}

function defaultWorkflow(hasChainAnchor: boolean): SignatureWorkflow {
  if (hasChainAnchor) {
    return {
      currentStep: "anchored",
      termsVersion: INTERNATIONAL_TERMS_VERSION,
      termsGeneratedAt: null,
      sentForSignatureAt: null,
      signedAt: null,
      anchoredAt: null,
    };
  }
  return {
    currentStep: "draft",
    termsVersion: null,
    termsGeneratedAt: null,
    sentForSignatureAt: null,
    signedAt: null,
    anchoredAt: null,
  };
}

type StoreFile = Record<string, SignatureWorkflow>;

let cache: StoreFile | null = null;

async function loadStore(): Promise<StoreFile> {
  if (cache) return cache;
  try {
    const raw = await readFile(storePath(), "utf8");
    cache = JSON.parse(raw) as StoreFile;
  } catch {
    cache = {};
  }
  return cache!;
}

async function saveStore(data: StoreFile): Promise<void> {
  cache = data;
  const dir = path.dirname(storePath());
  await mkdir(dir, { recursive: true });
  await writeFile(storePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function getSignatureWorkflow(
  contractId: string,
  hasChainAnchor: boolean,
): Promise<SignatureWorkflow> {
  const store = await loadStore();
  return store[contractId] ?? defaultWorkflow(hasChainAnchor);
}

export async function saveSignatureWorkflow(
  contractId: string,
  workflow: SignatureWorkflow,
): Promise<SignatureWorkflow> {
  const store = await loadStore();
  store[contractId] = workflow;
  await saveStore(store);
  return workflow;
}

export function nextSignatureStep(current: SignatureStepId): SignatureStepId | null {
  const idx = STEP_ORDER.indexOf(current);
  if (idx < 0 || idx >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[idx + 1]!;
}

export async function advanceSignatureStep(
  contractId: string,
  action: "generate_terms" | "send_for_signature" | "mark_signed" | "anchor_chain",
  opts?: { signerEmail?: string; hasChainAnchor?: boolean },
): Promise<SignatureWorkflow> {
  let wf = await getSignatureWorkflow(contractId, Boolean(opts?.hasChainAnchor));
  const now = new Date().toISOString();

  switch (action) {
    case "generate_terms":
      wf = {
        ...wf,
        currentStep: "terms_generated",
        termsVersion: INTERNATIONAL_TERMS_VERSION,
        termsGeneratedAt: now,
      };
      break;
    case "send_for_signature":
      wf = {
        ...wf,
        currentStep: "awaiting_signature",
        sentForSignatureAt: now,
      };
      break;
    case "mark_signed":
      wf = {
        ...wf,
        currentStep: "signed",
        signedAt: now,
        signerEmail: opts?.signerEmail?.trim() || wf.signerEmail,
      };
      break;
    case "anchor_chain":
      wf = {
        ...wf,
        currentStep: "anchored",
        anchoredAt: now,
      };
      break;
  }

  return saveSignatureWorkflow(contractId, wf);
}
