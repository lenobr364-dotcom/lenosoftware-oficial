/**
 * Backup diário para nuvem: encripta o SQLite local (AES-256-GCM) e envia para o Google Cloud Storage.
 *
 * Modos (por ordem):
 * 1) SDK — definir `CHEMVAULT_GCS_BACKUP_BUCKET` e credenciais:
 *    - `GOOGLE_APPLICATION_CREDENTIALS` (caminho para JSON da conta de serviço), ou
 *    - `GCS_CREDENTIALS_JSON` (JSON inline), ou
 *    - `GCS_CREDENTIALS_JSON_B64` (JSON em Base64)
 *    Opcional: `CHEMVAULT_GCS_BACKUP_OBJECT_PREFIX` (default `backups/`)
 * 2) URL PUT pré-assinada — `CHEMVAULT_GCS_BACKUP_SIGNED_PUT_URL` (comportamento legado)
 *
 *   CHEMVAULT_BACKUP_ENCRYPTION_KEY=64_hex_chars  (recomendado em produção)
 *   npx tsx scripts/backup-gcs-daily.mts
 */
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dbPath = resolve(root, "prisma", "dev.db");

const MAGIC = Buffer.from("cvbak1", "utf8");

function backupKey(): Buffer {
  const hex = process.env.CHEMVAULT_BACKUP_ENCRYPTION_KEY?.trim();
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex)) return Buffer.from(hex, "hex");
  const mat = (process.env.CHEMVAULT_SESSION_SECRET ?? "chemvault-dev").trim();
  return createHash("sha256").update(`chemvault-backup-v1|${mat}`, "utf8").digest();
}

function encryptBuffer(plain: Buffer): Buffer {
  const key = backupKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, iv, enc, tag]);
}

function objectNameForUpload(): string {
  const prefix = (process.env.CHEMVAULT_GCS_BACKUP_OBJECT_PREFIX ?? "backups/").replace(/\/?$/, "/");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}chemvault-${stamp}.db.enc`;
}

async function uploadWithSignedUrl(url: string, blob: Buffer, objectHint: string): Promise<void> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 120_000);
  try {
    const r = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-goog-meta-filename": objectHint,
      },
      body: new Uint8Array(blob),
      signal: ac.signal,
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      throw new Error(`signed_put_failed ${r.status} ${errText.slice(0, 300)}`);
    }
  } finally {
    clearTimeout(t);
  }
}

async function uploadWithGcsSdk(bucketName: string, objectPath: string, blob: Buffer): Promise<void> {
  const { Storage } = await import("@google-cloud/storage");
  let credentials: Record<string, unknown> | undefined;
  const inline = process.env.GCS_CREDENTIALS_JSON?.trim();
  const b64 = process.env.GCS_CREDENTIALS_JSON_B64?.trim();
  if (b64) {
    credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as Record<string, unknown>;
  } else if (inline) {
    credentials = JSON.parse(inline) as Record<string, unknown>;
  }
  const storage = credentials ? new Storage({ credentials }) : new Storage();
  const file = storage.bucket(bucketName).file(objectPath);
  await file.save(blob, {
    contentType: "application/octet-stream",
    resumable: false,
    metadata: { cacheControl: "no-store" },
  });
}

async function main() {
  const bucket = process.env.CHEMVAULT_GCS_BACKUP_BUCKET?.trim();
  const signedUrl = process.env.CHEMVAULT_GCS_BACKUP_SIGNED_PUT_URL?.trim();

  if (!bucket && !signedUrl) {
    console.log(JSON.stringify({ ok: false, skipped: "no_gcs_bucket_or_signed_url" }, null, 2));
    return;
  }
  if (!existsSync(dbPath)) {
    console.log(JSON.stringify({ ok: false, skipped: "no_database_file", path: dbPath }, null, 2));
    return;
  }

  const plain = readFileSync(dbPath);
  const blob = encryptBuffer(plain);
  const objectPath = objectNameForUpload();
  const objectHint = objectPath.split("/").pop() ?? objectPath;

  try {
    if (bucket) {
      await uploadWithGcsSdk(bucket, objectPath, blob);
      console.log(
        JSON.stringify(
          {
            ok: true,
            mode: "gcs_sdk",
            bucket,
            object: objectPath,
            encryptedBytes: blob.length,
            plaintextBytes: plain.length,
          },
          null,
          2,
        ),
      );
      return;
    }
    if (signedUrl) {
      await uploadWithSignedUrl(signedUrl, blob, objectHint);
      console.log(
        JSON.stringify(
          {
            ok: true,
            mode: "signed_put_url",
            encryptedBytes: blob.length,
            plaintextBytes: plain.length,
            objectHint,
          },
          null,
          2,
        ),
      );
    }
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: String(e) }, null, 2));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
