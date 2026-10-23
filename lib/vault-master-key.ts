/**
 * @deprecated A chave mestra não deve ser verificada no cliente.
 * O fluxo seguro é: `POST /api/vault/unlock` + cookie httpOnly + `GET /api/vault/formulas`.
 * Valor legado documental (MVP parceria 50/50): corresponde ao default de `getVaultAccessKey()` no servidor.
 */
export const LANDING_VAULT_MASTER_KEY = "CHEM5050";
