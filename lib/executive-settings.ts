import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";

function timingSafeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

const SINGLETON_ID = "default";
const SCRYPT_PREFIX = "cv-scrypt1:";

export async function getExecutiveSettings() {
  return prisma.executiveSettings.findUnique({ where: { id: SINGLETON_ID } });
}

function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${SCRYPT_PREFIX}${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyStoredPassword(plain: string, stored: string): boolean {
  if (!stored.startsWith(SCRYPT_PREFIX)) return false;
  const rest = stored.slice(SCRYPT_PREFIX.length);
  const [saltHex, hashHex] = rest.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(plain, salt, 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function hasExecutivePasswordOverride(): Promise<boolean> {
  const row = await getExecutiveSettings();
  return Boolean(row?.passwordHash);
}

export async function verifyExecutivePassword(plain: string): Promise<boolean> {
  const row = await getExecutiveSettings();
  if (row?.passwordHash) return verifyStoredPassword(plain, row.passwordHash);
  return false;
}

/** Senha atual do CEO: hash na BD ou `ADMIN_PASSWORD` no ambiente. */
export async function verifyCeoLoginPassword(plain: string): Promise<boolean> {
  if (await hasExecutivePasswordOverride()) return verifyExecutivePassword(plain);
  const envPw = process.env.ADMIN_PASSWORD ?? "";
  return timingSafeEqualString(plain, envPw);
}

export async function setExecutivePassword(plain: string): Promise<void> {
  const passwordHash = hashPassword(plain);
  await prisma.executiveSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, passwordHash },
    update: { passwordHash },
  });
}

export async function setExecutiveMfaOverride(input: {
  mode: string | null;
  totpSecretBase32?: string | null;
}): Promise<void> {
  await prisma.executiveSettings.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      adminMfaModeOverride: input.mode,
      totpSecretBase32: input.totpSecretBase32 ?? null,
    },
    update: {
      adminMfaModeOverride: input.mode,
      ...(input.totpSecretBase32 !== undefined ? { totpSecretBase32: input.totpSecretBase32 } : {}),
    },
  });
}

/** Atualiza só o secret TOTP na BD (enrollment); não altera o modo MFA. */
export async function setExecutiveTotpSecretOnly(secretBase32: string | null): Promise<void> {
  await prisma.executiveSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, totpSecretBase32: secretBase32 },
    update: { totpSecretBase32: secretBase32 },
  });
}
