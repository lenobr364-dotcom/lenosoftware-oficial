import { prisma } from "@/lib/prisma";
import { evaluateLicenseValidity } from "@/lib/formula-license-smart-contract";
import { getSignatureWorkflow } from "@/lib/contracts/signature-workflow-store";
import type {
  ContractDisplayStatus,
  LicensingContractRow,
  LicensingContractsPayload,
} from "@/lib/contracts/types";

function mapValidityToDisplay(
  validity: ReturnType<typeof evaluateLicenseValidity>,
  dbStatus: string,
): { displayStatus: ContractDisplayStatus; validityKey: string } {
  if (dbStatus !== "ACTIVE") {
    return { displayStatus: "revoked", validityKey: "revoked" };
  }
  switch (validity) {
    case "VALID":
      return { displayStatus: "active", validityKey: "valid" };
    case "EXPIRED":
      return { displayStatus: "expired", validityKey: "expired" };
    case "NOT_YET_VALID":
      return { displayStatus: "pending", validityKey: "not_yet_valid" };
    default:
      return { displayStatus: "revoked", validityKey: "revoked" };
  }
}

export async function buildLicensingContractsPayload(
  localeInput?: string | null,
): Promise<LicensingContractsPayload> {
  const locale = localeInput ?? "en";

  const [grants, requests] = await Promise.all([
    prisma.formulaIndustrialLicense.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    prisma.licenseRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  ]);

  const contracts: LicensingContractRow[] = [];

  for (const g of grants) {
    const validity = evaluateLicenseValidity(g);
    const { displayStatus, validityKey } = mapValidityToDisplay(validity, g.status);
    const signature = await getSignatureWorkflow(`grant:${g.id}`, Boolean(g.chainAnchor));

    contracts.push({
      id: g.id,
      kind: "industrial_grant",
      clientLabel: g.clientSubject,
      subjectCode: g.formulaCode,
      formulaOrCompany: g.formulaCode,
      displayStatus,
      validityKey,
      validFrom: g.validFrom.toISOString(),
      validUntil: g.validUntil.toISOString(),
      grantHash: g.grantHash,
      chainAnchor: g.chainAnchor,
      signature,
      createdAt: g.createdAt.toISOString(),
    });
  }

  for (const r of requests) {
    const isPending = r.status === "Pendente" || r.status === "Pending";
    const signature = await getSignatureWorkflow(`request:${r.id}`, false);

    contracts.push({
      id: r.id,
      kind: "license_request",
      clientLabel: r.company,
      subjectCode: r.corporateEmail,
      formulaOrCompany: r.company,
      displayStatus: isPending ? "pending" : "active",
      validityKey: isPending ? "pending_review" : "approved",
      validFrom: null,
      validUntil: null,
      grantHash: null,
      chainAnchor: null,
      signature,
      createdAt: r.createdAt.toISOString(),
      country: r.country,
    });
  }

  contracts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const counts = {
    active: contracts.filter((c) => c.displayStatus === "active").length,
    pending: contracts.filter((c) => c.displayStatus === "pending").length,
    expired: contracts.filter((c) => c.displayStatus === "expired").length,
    total: contracts.length,
  };

  return {
    locale,
    updatedAt: new Date().toISOString(),
    contracts,
    counts,
  };
}
