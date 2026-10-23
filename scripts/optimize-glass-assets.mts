/**
 * Comprime imagens raster em `public/glass/` para WebP (qualidade ~82) no mesmo diretório,
 * com sufixo `.webp` junto ao original. Correr após adicionar PNG/JPEG de fundo glass.
 *
 *   npm run assets:optimize-glass
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const GLASS_DIR = path.join(ROOT, "public", "glass");

const EXT = /\.(png|jpe?g)$/i;

async function main(): Promise<void> {

  if (!fs.existsSync(GLASS_DIR)) {
    console.log("[optimize-glass] Pasta public/glass inexistente — nada a fazer.");
    return;
  }

  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (EXT.test(name)) files.push(p);
    }
  };
  walk(GLASS_DIR);

  if (files.length === 0) {
    console.log("[optimize-glass] Sem PNG/JPEG em public/glass — nada a fazer.");
    return;
  }

  for (const input of files) {
    const out = input.replace(EXT, ".webp");
    const inStat = fs.statSync(input);
    await sharp(input).webp({ quality: 82, effort: 6 }).toFile(out);
    const outStat = fs.statSync(out);
    const ratio = ((1 - outStat.size / inStat.size) * 100).toFixed(1);
    console.log(`[optimize-glass] ${path.relative(ROOT, input)} → ${path.relative(ROOT, out)} (−${ratio}% bytes)`);
  }
}

main().catch((e) => {
  console.error("[optimize-glass]", e);
  process.exit(1);
});
