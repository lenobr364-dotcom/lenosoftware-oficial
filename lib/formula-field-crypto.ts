import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "cv1:";

/** Linha ou projeção com campos sensíveis persistidos (podem estar cifrados). */
export type FormulaSensitiveFields = {
  instrucoes: string;
  descricao?: string | null;
  ativo_principal?: string | null;
};

/** Deriva chave AES-256 (32 bytes) a partir de segredo dedicado ou material de sessão. */
function formulaEncryptionKey(): Buffer {
  const dedicated = process.env.CHEMVAULT_FORMULA_ENCRYPTION_KEY?.trim();
  if (dedicated) {
    if (/^[0-9a-fA-F]{64}$/.test(dedicated)) {
      return Buffer.from(dedicated, "hex");
    }
    return createHash("sha256").update(dedicated, "utf8").digest();
  }
  const fallback =
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session";
  return createHash("sha256").update(`chemvault-formula-fields-v1|${fallback}`, "utf8").digest();
}

export function encryptFormulaSensitiveFields(plain: string | null | undefined): string | null {
  if (plain == null) return null;
  if (plain === "") return "";
  if (plain.startsWith(PREFIX)) return plain;
  const key = formulaEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, enc, tag]);
  return `${PREFIX}${combined.toString("base64url")}`;
}

export function decryptFormulaSensitiveFields(stored: string | null | undefined): string | null {
  if (stored == null) return null;
  if (stored === "") return "";
  if (!stored.startsWith(PREFIX)) return stored;
  const raw = stored.slice(PREFIX.length);
  const buf = Buffer.from(raw, "base64url");
  if (buf.length < 12 + 16 + 1) return stored;
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(12, buf.length - 16);
  const key = formulaEncryptionKey();
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return stored;
  }
}

export function decryptFormulaRow<T extends FormulaSensitiveFields>(row: T): T {
  const out = { ...row } as T & Record<string, unknown>;
  out.instrucoes = decryptFormulaSensitiveFields(row.instrucoes) ?? row.instrucoes;
  if ("descricao" in row) {
    out.descricao = decryptFormulaSensitiveFields(row.descricao ?? null);
  }
  if ("ativo_principal" in row) {
    out.ativo_principal = decryptFormulaSensitiveFields(row.ativo_principal ?? null);
  }
  return out as T;
}

export function encryptFormulaCreateData<
  T extends Record<string, unknown> & {
    instrucoes: string;
    descricao?: string | null;
    ativo_principal?: string | null;
  },
>(data: T): T {
  return {
    ...data,
    instrucoes: encryptFormulaSensitiveFields(data.instrucoes) ?? data.instrucoes,
    descricao: encryptFormulaSensitiveFields(data.descricao ?? null),
    ativo_principal: encryptFormulaSensitiveFields(data.ativo_principal ?? null),
  };
}

export function encryptFormulaPatchData<T extends Record<string, unknown>>(patch: T): T {
  const out: Record<string, unknown> = { ...patch };
  if ("instrucoes" in patch && patch.instrucoes !== undefined) {
    out.instrucoes = encryptFormulaSensitiveFields(patch.instrucoes as string) ?? (patch.instrucoes as string);
  }
  if ("descricao" in patch && patch.descricao !== undefined) {
    out.descricao = encryptFormulaSensitiveFields(patch.descricao as string | null);
  }
  if ("ativo_principal" in patch && patch.ativo_principal !== undefined) {
    out.ativo_principal = encryptFormulaSensitiveFields(patch.ativo_principal as string | null);
  }
  return out as T;
}
