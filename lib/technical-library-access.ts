import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "@/lib/ceo-session";
import { prisma } from "@/lib/prisma";

/**
 * Estados de lead considerados "aprovados" para futuro acesso a downloads
 * (alinhado com ExecutiveLicensePanel / operações comerciais).
 */
export const APPROVED_LEAD_STATUSES = ["Aprovado", "Approved", "APPROVED", "ACTIVE", "Ativa"] as const;

export function isApprovedLeadStatus(status: string): boolean {
  const s = status.trim();
  return (APPROVED_LEAD_STATUSES as readonly string[]).includes(s);
}

/** Cookie reservado para sessão futura de licenciado (portal / magic link). */
export const LICENSEE_SESSION_COOKIE = "chemvault_licensee";

type LicenseePayload = {
  /** e-mail normalizado associado a LicenseRequest.corporateEmail */
  emailNorm: string;
  /** assinatura / exp — placeholder até existir JWT ou sessão firmada */
  expUnix?: number;
};

/**
 * Futuro: validar cookie/assinatura e devolver payload.
 * Hoje devolve null (nenhuma sessão de licenciado implementada).
 */
export function parseLicenseeSessionToken(_raw: string | undefined): LicenseePayload | null {
  void _raw;
  return null;
}

/** Leitura mínima de cookies (RSC `cookies()` ou `NextRequest.cookies`). */
export type TechnicalLibraryCookieJar = {
  get(name: string): { value: string } | undefined;
};

/**
 * Quando existir sessão de licenciado: verificar na base se o e-mail tem lead aprovado.
 */
export async function hasApprovedLeadForEmail(emailNorm: string): Promise<boolean> {
  const target = emailNorm.trim().toLowerCase();
  const candidates = await prisma.licenseRequest.findMany({
    where: { status: { in: [...APPROVED_LEAD_STATUSES] } },
    select: { corporateEmail: true },
  });
  return candidates.some((c) => c.corporateEmail.trim().toLowerCase() === target);
}

/**
 * Autorização para GET /api/technical-library/[documentId].
 *
 * Política:
 * - Produção: licenciado com lead aprovado (quando `parseLicenseeSessionToken` estiver implementado), ou CEO se `TECHNICAL_LIBRARY_CEO_DOWNLOAD=1`.
 * - Desenvolvimento: CEO autenticado permite download (exceto se `TECHNICAL_LIBRARY_CEO_DOWNLOAD=0`).
 */
/**
 * Parceiro licenciado com lead comercialmente aprovado (sessão futura + base).
 * Não inclui bypass CEO — usar para ícone de cadeado na UI.
 */
export async function isPartnerApprovedForTechnicalLibrary(jar: TechnicalLibraryCookieJar): Promise<boolean> {
  const payload = parseLicenseeSessionToken(jar.get(LICENSEE_SESSION_COOKIE)?.value);
  if (!payload?.emailNorm) return false;
  try {
    return await hasApprovedLeadForEmail(payload.emailNorm);
  } catch {
    return false;
  }
}

export async function canDownloadTechnicalLibrary(jar: TechnicalLibraryCookieJar): Promise<boolean> {
  const licenseeRaw = jar.get(LICENSEE_SESSION_COOKIE)?.value;
  const payload = parseLicenseeSessionToken(licenseeRaw);
  if (payload?.emailNorm) {
    try {
      if (await hasApprovedLeadForEmail(payload.emailNorm)) return true;
    } catch {
      /* DB indisponível — nega download */
    }
  }

  const ceoOk = await verifyCeoSessionToken(jar.get(CEO_SESSION_COOKIE)?.value);
  if (!ceoOk) return false;

  if (process.env.TECHNICAL_LIBRARY_CEO_DOWNLOAD === "0") return false;
  if (process.env.TECHNICAL_LIBRARY_CEO_DOWNLOAD === "1") return true;
  return process.env.NODE_ENV !== "production";
}
