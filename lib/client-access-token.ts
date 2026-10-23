/**
 * Links públicos /acesso/[token]: payload assinado (HMAC-SHA256) sem estado.
 * Segredo: CLIENT_ACCESS_SECRET → CHEMVAULT_SESSION_SECRET → AUTH_MASTER_KEY → fallback dev.
 */

function secretKey(): string {
  return (
    process.env.CLIENT_ACCESS_SECRET?.trim() ||
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session"
  );
}

async function hmacSha256Hex(message: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(secretKey());
  const key = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", keyMaterial),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createClientAccessToken(formulaId: string, ttlSeconds = 60 * 60 * 24 * 30): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const canonical = `${formulaId}:${exp}`;
  const sig = await hmacSha256Hex(canonical);
  const payload = JSON.stringify({ fid: formulaId, exp });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  return `${payloadB64}.${sig}`;
}

export async function verifyClientAccessToken(token: string): Promise<{ formulaId: string } | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  let parsed: { fid?: string; exp?: number };
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    parsed = JSON.parse(json) as { fid?: string; exp?: number };
  } catch {
    return null;
  }
  if (!parsed.fid || typeof parsed.exp !== "number") return null;
  if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
  const expected = await hmacSha256Hex(`${parsed.fid}:${parsed.exp}`);
  if (!timingSafeEqualHex(sigHex, expected)) return null;
  return { formulaId: parsed.fid };
}
