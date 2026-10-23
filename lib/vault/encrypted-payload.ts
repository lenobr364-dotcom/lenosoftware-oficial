import { createCipheriv, createHash, randomBytes } from "node:crypto";

import { buildFormulaDownloadPackage } from "@/lib/vault/download-package";
import { FORMULAS } from "@/lib/formulas";

export type VaultEncryptedPayload = {
  schema: "chemvault-vault-encrypted/v1";
  formulaId: string;
  formulaCode: string;
  licenseId: string;
  algorithm: "AES-256-GCM";
  iv: string;
  authTag: string;
  ciphertext: string;
  keyHint: string;
  sealedAt: string;
};

/** Simula payload AES-256-GCM do Secure Vault (chave derivada do grant industrial). */
export function buildVaultEncryptedPayload(
  formulaId: string,
  licenseId: string,
  grantHash: string,
  locale = "en",
): VaultEncryptedPayload | null {
  const formula = FORMULAS.find((f) => f.id === formulaId);
  if (!formula) return null;

  const dossier = buildFormulaDownloadPackage(formulaId, locale);
  if (!dossier) return null;

  const key = createHash("sha256").update(`CV-VAULT-SEAL|${grantHash}|${formulaId}`, "utf8").digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(dossier.body, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    schema: "chemvault-vault-encrypted/v1",
    formulaId,
    formulaCode: formula.code,
    licenseId,
    algorithm: "AES-256-GCM",
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: encrypted.toString("base64"),
    keyHint: `derived:grant:${grantHash.slice(0, 12)}`,
    sealedAt: new Date().toISOString(),
  };
}
