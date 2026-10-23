/**
 * Ferramentas i18n:
 *   npx tsx scripts/i18n-utils.mts check  — chaves idênticas a en.json em todos os locales
 *   npx tsx scripts/i18n-utils.mts scan   — candidatos a texto fixo (placeholder longo, etc.)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MESSAGES = path.join(ROOT, "messages");

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, p));
    } else {
      keys.push(p);
    }
  }
  return keys;
}

function loadJson(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(MESSAGES, file), "utf8")) as Record<string, unknown>;
}

function check(): void {
  const files = fs.readdirSync(MESSAGES).filter((f) => f.endsWith(".json")).sort();
  if (!files.includes("en.json")) {
    console.error("[i18n] messages/en.json missing");
    process.exit(1);
  }
  const baseKeys = new Set(flattenKeys(loadJson("en.json")));
  let exit = 0;
  for (const f of files) {
    if (f === "en.json") continue;
    const keys = new Set(flattenKeys(loadJson(f)));
    for (const k of baseKeys) {
      if (!keys.has(k)) {
        console.error(`[i18n] missing in ${f}: ${k}`);
        exit = 1;
      }
    }
    for (const k of keys) {
      if (!baseKeys.has(k)) {
        console.error(`[i18n] extra in ${f}: ${k}`);
        exit = 1;
      }
    }
  }
  if (exit === 0) console.log("[i18n] OK — all locale JSON files match en.json key tree.");
  process.exit(exit);
}

function walk(dir: string, cb: (file: string) => void): void {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
      walk(p, cb);
    } else cb(p);
  }
}

function scan(): void {
  const placeholderRe = /placeholder=\{?["']([^"'{}]{16,})["']\}?/g;
  const dirs = ["app", "components"].map((d) => path.join(ROOT, d));
  let found = 0;
  for (const dir of dirs) {
    walk(dir, (file) => {
      if (!file.endsWith(".tsx")) return;
      const rel = path.relative(ROOT, file);
      const txt = fs.readFileSync(file, "utf8");
      if (txt.includes("useTranslations(") || txt.includes("getTranslations")) {
        return;
      }
      let m: RegExpExecArray | null;
      placeholderRe.lastIndex = 0;
      while ((m = placeholderRe.exec(txt))) {
        found++;
        console.log(`[scan] ${rel}: long placeholder → ${m[1]!.slice(0, 72)}`);
      }
    });
  }
  if (found === 0) {
    console.log("[scan] No obvious long placeholders in files without next-intl (heuristic).");
  }
}

const cmd = process.argv[2] ?? "check";
if (cmd === "check") check();
else if (cmd === "scan") scan();
else {
  console.error("Usage: npx tsx scripts/i18n-utils.mts [check|scan]");
  process.exit(1);
}
