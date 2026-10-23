import { recordVaultDecryptAudit } from "@/lib/audit/record-vault-decrypt-audit";
import { evaluateLicenseValidity } from "@/lib/formula-license-smart-contract";
import { prisma } from "@/lib/prisma";
import { FORMULAS } from "@/lib/formulas";
import { buildVaultEncryptedPayload } from "@/lib/vault/encrypted-payload";
import { mintVaultDecryptAccessToken } from "@/lib/vault/vault-decrypt-token";

export type DecryptPayloadInput = {
  licenseId: string;
  formulaId: string;
  locale?: string;
  actorSubject: string;
  ip: string | null;
  requestPath: string;
};

export type DecryptPayloadSuccess = {
  ok: true;
  authorized: true;
  accessToken: string;
  expiresAt: string;
  expiresInSeconds: number;
  encryptedPayload: ReturnType<typeof buildVaultEncryptedPayload>;
  vaultDownloadHint: string;
};

export type DecryptPayloadFailure = {
  ok: false;
  authorized: false;
  error:
    | "license_not_found"
    | "formula_not_found"
    | "license_formula_mismatch"
    | "license_not_active"
    | "license_not_valid"
    | "vault_payload_unavailable";
};

export async function requestLicensedVaultDecrypt(
  input: DecryptPayloadInput,
): Promise<DecryptPayloadSuccess | DecryptPayloadFailure> {
  const deny = (error: DecryptPayloadFailure["error"], reason: string): DecryptPayloadFailure => {
    recordVaultDecryptAudit({
      authorized: false,
      licenseId: input.licenseId,
      formulaId: input.formulaId,
      actorSubject: input.actorSubject,
      ip: input.ip,
      requestPath: input.requestPath,
      reason,
    });
    return { ok: false, authorized: false, error };
  };

  const license = await prisma.formulaIndustrialLicense.findUnique({
    where: { id: input.licenseId },
  });
  if (!license) return deny("license_not_found", "license_not_found");

  const formula = FORMULAS.find((f) => f.id === input.formulaId);
  if (!formula) return deny("formula_not_found", "formula_not_found");

  if (license.formulaCode !== formula.code) {
    return deny("license_formula_mismatch", "license_formula_mismatch");
  }

  if (license.status !== "ACTIVE") {
    return deny("license_not_active", `status_${license.status}`);
  }

  const validity = evaluateLicenseValidity({
    status: license.status,
    validFrom: license.validFrom,
    validUntil: license.validUntil,
  });
  if (validity !== "VALID") {
    return deny("license_not_valid", validity);
  }

  const encryptedPayload = buildVaultEncryptedPayload(
    input.formulaId,
    input.licenseId,
    license.grantHash,
    input.locale ?? "en",
  );
  if (!encryptedPayload) {
    return deny("vault_payload_unavailable", "vault_payload_unavailable");
  }

  const { token, expiresAt, expiresInSeconds } = mintVaultDecryptAccessToken(
    input.licenseId,
    input.formulaId,
  );

  recordVaultDecryptAudit({
    authorized: true,
    licenseId: input.licenseId,
    formulaId: input.formulaId,
    actorSubject: input.actorSubject,
    ip: input.ip,
    requestPath: input.requestPath,
    reason: "vault_unlock_granted",
  });

  return {
    ok: true,
    authorized: true,
    accessToken: token,
    expiresAt,
    expiresInSeconds,
    encryptedPayload,
    vaultDownloadHint: "/dashboard/chemical-vault",
  };
}
