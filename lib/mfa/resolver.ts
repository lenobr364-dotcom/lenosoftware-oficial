import { prisma } from "@/lib/prisma";

import type { AdminMfaFactor } from "./policy";
import { parseMfaRaw, pickActiveFactorFromFactors } from "./policy";

const SINGLETON = "default";

export async function resolvedTotpSecret(): Promise<string | null> {
  const row = await prisma.executiveSettings.findUnique({ where: { id: SINGLETON } });
  const fromDb = row?.totpSecretBase32?.trim();
  if (fromDb && fromDb.length >= 8) return fromDb;
  const fromEnv = process.env.CHEMVAULT_ADMIN_TOTP_SECRET?.trim();
  return fromEnv && fromEnv.length >= 8 ? fromEnv : null;
}

/** MFA efetivo (override na BD ou variáveis de ambiente). */
export async function activeAdminMfaFactorAsync(): Promise<AdminMfaFactor | null> {
  const row = await prisma.executiveSettings.findUnique({ where: { id: SINGLETON } });
  const raw =
    row?.adminMfaModeOverride?.trim().toLowerCase() ||
    process.env.CHEMVAULT_ADMIN_MFA?.trim().toLowerCase() ||
    "off";
  const factors = parseMfaRaw(raw);
  const totpSecret = await resolvedTotpSecret();
  return pickActiveFactorFromFactors(factors, totpSecret);
}
