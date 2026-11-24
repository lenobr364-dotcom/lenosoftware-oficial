/** Nome fora do catálogo industrial do ChemVault. */
export function isArla32CatalogName(value: string | null | undefined): boolean {
  return /\barla\s*-?\s*32\b/i.test(value ?? "");
}
