/**
 * BritaGrid — anti-desintermediação: detecção, mascaramento e bloqueio
 * de telefones, WhatsApp, e-mails, redes sociais e links externos.
 */

export const CONTACT_MASK = "[contato oculto pela BritaGrid]";
export const LINK_MASK = "[link externo bloqueado]";
export const HANDLE_MASK = "[perfil social oculto]";

/** Telefone BR / internacional (com ou sem +55, espaços, hífens, parênteses). */
export const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}\b|(?:\+?\d{1,3}[\s.-]?)?\d{8,15}\b/g;

/** WhatsApp explícito ou wa.me / api.whatsapp.com */
export const WHATSAPP_PATTERN =
  /(?:whats?\s*app|zap|wpp|wa\.me|api\.whatsapp\.com)[\s:/]*(?:\+?\d[\d\s().-]{7,}\d)?/gi;

/** E-mail */
export const EMAIL_PATTERN =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Handles @usuario (não e-mails — aplicados após e-mail) */
export const SOCIAL_HANDLE_PATTERN =
  /(^|[\s(,;:])@([a-zA-Z0-9._]{2,30})\b/g;

/** URLs http(s), www., e esquemas comuns */
export const EXTERNAL_LINK_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"']+/gi;

/** Menções a Instagram, Telegram, Facebook, LinkedIn, TikTok com caminho */
export const SOCIAL_URL_HINT_PATTERN =
  /(?:instagram|telegram|facebook|fb\.com|linkedin|tiktok|t\.me)[\s.:/]+[^\s<>"']+/gi;

export type ContactHitKind =
  | "phone"
  | "whatsapp"
  | "email"
  | "social_handle"
  | "external_link"
  | "social_url";

export type ContactHit = {
  kind: ContactHitKind;
  match: string;
};

export type SanitizeResult = {
  original: string;
  sanitized: string;
  blocked: boolean;
  hits: ContactHit[];
  changed: boolean;
};

function collectHits(text: string): ContactHit[] {
  const hits: ContactHit[] = [];
  const push = (kind: ContactHitKind, re: RegExp) => {
    const copy = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
    for (const m of text.matchAll(copy)) {
      if (m[0]?.trim()) hits.push({ kind, match: m[0] });
    }
  };
  push("whatsapp", WHATSAPP_PATTERN);
  push("email", EMAIL_PATTERN);
  push("external_link", EXTERNAL_LINK_PATTERN);
  push("social_url", SOCIAL_URL_HINT_PATTERN);
  push("phone", PHONE_PATTERN);
  push("social_handle", SOCIAL_HANDLE_PATTERN);
  return hits;
}

/**
 * Mascara contatos em texto público (listagens, fichas, chat pré-liberação).
 */
export function maskContactText(input: string): SanitizeResult {
  const original = input ?? "";
  let sanitized = original;
  const hits = collectHits(original);

  sanitized = sanitized.replace(WHATSAPP_PATTERN, CONTACT_MASK);
  sanitized = sanitized.replace(EMAIL_PATTERN, CONTACT_MASK);
  sanitized = sanitized.replace(EXTERNAL_LINK_PATTERN, LINK_MASK);
  sanitized = sanitized.replace(SOCIAL_URL_HINT_PATTERN, LINK_MASK);
  sanitized = sanitized.replace(PHONE_PATTERN, CONTACT_MASK);
  sanitized = sanitized.replace(SOCIAL_HANDLE_PATTERN, (_m, prefix: string) => `${prefix}${HANDLE_MASK}`);

  return {
    original,
    sanitized,
    blocked: hits.length > 0,
    hits,
    changed: sanitized !== original,
  };
}

/**
 * Valida entrada do usuário. Em modo `reject`, recusa texto com contatos;
 * em `mask`, devolve versão sanitizada (padrão para API).
 */
export function sanitizeUserInput(
  input: string,
  mode: "mask" | "reject" = "mask",
): SanitizeResult {
  const result = maskContactText(input);
  if (mode === "reject" && result.blocked) {
    return { ...result, sanitized: "", blocked: true };
  }
  return result;
}

export function containsBlockedContact(input: string): boolean {
  return collectHits(input ?? "").length > 0;
}

export type PublicContactFields = {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  social?: string | null;
  website?: string | null;
};

/**
 * Remove campos de contato estruturados até liberação autorizada.
 */
export function maskPublicContactFields<T extends PublicContactFields>(
  fields: T,
  released: boolean,
): T & { contactReleased: boolean } {
  if (released) {
    return { ...fields, contactReleased: true };
  }
  return {
    ...fields,
    phone: null,
    whatsapp: null,
    email: null,
    social: null,
    website: null,
    contactReleased: false,
  };
}

/**
 * Aplica mascaramento a campos de texto livre de um objeto público.
 */
export function maskTextFields<T extends Record<string, unknown>>(
  row: T,
  textKeys: (keyof T)[],
): T {
  const out = { ...row };
  for (const key of textKeys) {
    const val = out[key];
    if (typeof val === "string") {
      out[key] = maskContactText(val).sanitized as T[keyof T];
    }
  }
  return out;
}
