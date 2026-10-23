import { createHash, randomBytes } from "crypto";

import { evaluateLicenseValidity } from "@/lib/formula-license-smart-contract";
import { FORMULAS } from "@/lib/formulas";
import type { ComplianceCertificatePayload } from "@/lib/compliance/types";

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function newDocumentId(prefix: string): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = randomBytes(4).toString("hex");
  return `${prefix}_${stamp}_${rand}`;
}

export function buildComplianceCertificate(input: {
  license: {
    id: string;
    clientSubject: string;
    formulaCode: string;
    status: string;
    grantHash: string;
    chainAnchor: string | null;
    validFrom: Date;
    validUntil: Date;
  };
  actorSubject: string;
}): ComplianceCertificatePayload {
  const formula = FORMULAS.find((f) => f.code === input.license.formulaCode.trim());
  const validity = evaluateLicenseValidity({
    status: input.license.status,
    validFrom: input.license.validFrom,
    validUntil: input.license.validUntil,
  });

  const documentId = newDocumentId("CCR");
  const issuedAt = new Date().toISOString();

  const licenseBlock = {
    id: input.license.id,
    formulaCode: input.license.formulaCode,
    formulaName: formula?.name ?? input.license.formulaCode,
    clientSubject: input.license.clientSubject,
    status: input.license.status,
    validity,
    grantHash: input.license.grantHash,
    chainAnchor: input.license.chainAnchor,
    validFrom: input.license.validFrom.toISOString(),
    validUntil: input.license.validUntil.toISOString(),
  };

  const bodyForDigest = {
    documentId,
    type: "COMPLIANCE_CERTIFICATE_V1" as const,
    issuedAt,
    license: licenseBlock,
    issuer: { platform: "ChemVault Global" as const, actorSubject: input.actorSubject },
  };

  const documentDigest = sha256Hex(stableJson(bodyForDigest));
  const verificationKey = sha256Hex(`${documentId}|${documentDigest}|${input.actorSubject}`);

  return {
    ...bodyForDigest,
    regulatory: {
      signatureAlgorithm: "SHA-256",
      documentDigest,
      verificationKey,
    },
  };
}
