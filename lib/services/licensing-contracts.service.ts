import { cachedQuery } from "@/lib/db/performance";
import { buildLicensingContractsPayload } from "@/lib/contracts/licensing-contracts.builder";
import { buildContractTermsPayload } from "@/lib/contracts/terms";
import {
  advanceSignatureStep,
  getSignatureWorkflow,
} from "@/lib/contracts/signature-workflow-store";
import type { LicensingContractsPayload } from "@/lib/contracts/types";

function workflowKey(kind: "industrial_grant" | "license_request", id: string): string {
  return kind === "industrial_grant" ? `grant:${id}` : `request:${id}`;
}

export async function getLicensingContracts(
  locale?: string | null,
): Promise<LicensingContractsPayload> {
  const key = `licensing-contracts-v1:${locale ?? "en"}`;
  const { data } = await cachedQuery(key, 12_000, () => buildLicensingContractsPayload(locale));
  return data;
}

export async function getContractTerms(contractId: string, kind: string, locale: string) {
  return buildContractTermsPayload(`${kind}:${contractId}`, locale);
}

export async function runContractSignatureAction(input: {
  contractId: string;
  kind: "industrial_grant" | "license_request";
  action: "generate_terms" | "send_for_signature" | "mark_signed" | "anchor_chain";
  signerEmail?: string;
  hasChainAnchor?: boolean;
}) {
  const key = workflowKey(input.kind, input.contractId);
  if (input.action === "generate_terms") {
    await advanceSignatureStep(key, "generate_terms");
  }
  return advanceSignatureStep(key, input.action, {
    signerEmail: input.signerEmail,
    hasChainAnchor: input.hasChainAnchor,
  });
}

export async function getContractWorkflow(
  contractId: string,
  kind: "industrial_grant" | "license_request",
  hasChainAnchor: boolean,
) {
  return getSignatureWorkflow(workflowKey(kind, contractId), hasChainAnchor);
}
