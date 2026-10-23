type BlockKey = "RAW" | "PREP" | "DIL" | "EQUIV" | "DOSSIER" | "HW" | "TAGS";

const BLOCK_KEYS = new Set<string>(["RAW", "PREP", "DIL", "EQUIV", "DOSSIER", "HW", "TAGS"]);

const BLOCK_OPEN = /__BLOCK:(\w+)__\s*\n/g;

/** Monta `instrucoes` persistido com marcadores para o dashboard reconstruir secções. */
export function buildFormulaInstrucoes(parts: Partial<Record<BlockKey, string>>): string {
  const order: BlockKey[] = ["RAW", "PREP", "DIL", "EQUIV", "DOSSIER", "HW", "TAGS"];
  return order
    .map((k) => {
      const body = (parts[k] ?? "").trim();
      return body ? `__BLOCK:${k}__\n${body}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function parseFormulaInstrucoesBlocks(text: string): Record<BlockKey, string> {
  const out: Partial<Record<BlockKey, string>> = {};
  let lastKey: BlockKey | null = null;
  let lastEnd = 0;
  for (const m of text.matchAll(BLOCK_OPEN)) {
    const keyStr = m[1];
    if (!BLOCK_KEYS.has(keyStr)) continue;
    const key = keyStr as BlockKey;
    if (lastKey !== null) {
      out[lastKey] = text.slice(lastEnd, m.index).trim();
    }
    lastEnd = m.index + m[0].length;
    lastKey = key;
  }
  if (lastKey !== null) {
    out[lastKey] = text.slice(lastEnd).trim();
  }
  if (Object.keys(out).length === 0 && text.trim()) {
    out.PREP = text.trim();
  }
  return out as Record<BlockKey, string>;
}
