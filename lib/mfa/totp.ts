import { createHmac, randomBytes } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Gera secret Base32 (RFC 4648) para provisionamento TOTP. */
export function generateTotpSecretBase32(byteLength = 20): string {
  const buf = randomBytes(byteLength);
  let bits = "";
  for (const b of buf) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += BASE32[Number.parseInt(bits.slice(i, i + 5), 2)]!;
  }
  return out;
}

/** Decodifica secret TOTP em Base32 (RFC 4648, padding opcional). */
export function base32ToBuffer(input: string): Buffer {
  const s = input.replace(/\s/g, "").toUpperCase().replace(/=+$/g, "");
  let bits = "";
  for (const ch of s) {
    const v = BASE32.indexOf(ch);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function counterBuf(counter: number): Buffer {
  const b = Buffer.allocUnsafe(8);
  b.writeBigUInt64BE(BigInt(counter), 0);
  return b;
}

function hotpDigits(key: Buffer, counter: number, digits = 6): string {
  const mac = createHmac("sha1", key).update(counterBuf(counter)).digest();
  const off = mac[mac.length - 1]! & 0x0f;
  const code =
    ((mac[off]! & 0x7f) << 24) |
    ((mac[off + 1]! & 0xff) << 16) |
    ((mac[off + 2]! & 0xff) << 8) |
    (mac[off + 3]! & 0xff);
  const mod = 10 ** digits;
  return String(code % mod).padStart(digits, "0");
}

/** Valida código TOTP (RFC 6238, SHA-1, 30s, 6 dígitos). */
export function verifyTotp(secretBase32: string, code: string, window = 1): boolean {
  const trimmed = code.replace(/\s/g, "");
  if (!/^\d{6,8}$/.test(trimmed)) return false;
  const key = base32ToBuffer(secretBase32);
  if (key.length < 1) return false;
  const digits = trimmed.length;
  const t = Math.floor(Date.now() / 1000 / 30);
  for (let w = -window; w <= window; w++) {
    if (hotpDigits(key, t + w, digits) === trimmed) return true;
  }
  return false;
}
