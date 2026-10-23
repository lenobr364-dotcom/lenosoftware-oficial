import { createHash } from "crypto";

import type { FormulaRecord } from "@/lib/formulas";

/** Versão do payload canónico (incrementar se mudar o algoritmo de serialização). */
export const FORMULA_FINGERPRINT_VERSION = 1;

export type FormulaFingerprintPayload = {
  v: number;
  formulaId: string;
  code: string;
  name: string;
  composition: string;
  mixingInstructions: string;
  safetyPrecautions: string;
  lastUpdated: string;
};

/** Serialização estável (chaves ordenadas) para hash determinístico. */
export function canonicalFingerprintPayload(record: FormulaRecord): FormulaFingerprintPayload {
  return {
    v: FORMULA_FINGERPRINT_VERSION,
    formulaId: record.id,
    code: record.code,
    name: record.name,
    composition: record.composition,
    mixingInstructions: record.mixingInstructions,
    safetyPrecautions: record.safetyPrecautions,
    lastUpdated: record.lastUpdated,
  };
}

export function stableStringifyFingerprintPayload(p: FormulaFingerprintPayload): string {
  const keys = Object.keys(p).sort() as (keyof FormulaFingerprintPayload)[];
  const ordered: Record<string, unknown> = {};
  for (const k of keys) {
    ordered[k as string] = p[k];
  }
  return JSON.stringify(ordered);
}

/** Hash único SHA-256 (hex) da fórmula industrial para licenciamento e auditoria. */
export function computeFormulaIndustrialFingerprintHex(record: FormulaRecord): {
  hashHex: string;
  payload: FormulaFingerprintPayload;
  canonicalJson: string;
} {
  const payload = canonicalFingerprintPayload(record);
  const canonicalJson = stableStringifyFingerprintPayload(payload);
  const hashHex = createHash("sha256").update(canonicalJson, "utf8").digest("hex");
  return { hashHex, payload, canonicalJson };
}
