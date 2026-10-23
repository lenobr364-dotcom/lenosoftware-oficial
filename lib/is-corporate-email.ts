const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "yahoo.fr",
  "yahoo.de",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "outlook.fr",
  "live.com",
  "live.fr",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "aol.com",
  "mail.com",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "web.de",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "inbox.com",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "rediffmail.com",
  "fastmail.com",
  "hey.com",
  "tutanota.com",
  "tutanota.de",
  "mailbox.org",
]);

/** Pragmatic shape check — not a full RFC parser; blocks obvious garbage. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function isWellFormedEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_SHAPE.test(trimmed);
}

export type CorporateEmailReject = "invalid_email" | "consumer_email";

export function getCorporateEmailReject(value: string): CorporateEmailReject | null {
  const trimmed = value.trim().toLowerCase();
  if (!isWellFormedEmail(trimmed)) return "invalid_email";
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return "invalid_email";
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".")) return "invalid_email";
  if (CONSUMER_EMAIL_DOMAINS.has(domain)) return "consumer_email";
  return null;
}

export function isCorporateEmail(value: string): boolean {
  return getCorporateEmailReject(value) === null;
}
