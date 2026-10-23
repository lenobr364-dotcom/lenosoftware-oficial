/**
 * Chave do portão ChemVault (apenas servidor).
 * Prioridade: LANDING_VAULT_MASTER_KEY → AUTH_MASTER_KEY → fallback MVP "CHEM5050" (parceria 50/50 Leno + parceira digital).
 */
export function getVaultAccessKey(): string {
  const fromEnv =
    process.env.LANDING_VAULT_MASTER_KEY?.trim() || process.env.AUTH_MASTER_KEY?.trim();
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return "CHEM5050";
}
