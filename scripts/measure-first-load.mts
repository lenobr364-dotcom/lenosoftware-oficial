/**
 * Simulação de primeira carga: remove `.next`, faz `npm run build`, sobe `next start` numa porta
 * temporária e mede o tempo até ao primeiro byte (TTFB) de GET /{locale}/pricing.
 *
 * Nota: FCP/LCP requerem browser (ex. Lighthouse). Este script mede apenas TTFB de rede + SSR.
 *
 *   npm run perf:first-load
 *   npm run perf:first-load -- --no-clean --locale=ar
 */
import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = 4011;
const GOAL_MS = 1500;

const args = new Set(process.argv.slice(2));
const noClean = args.has("--no-clean");
const localeArg = process.argv.find((a) => a.startsWith("--locale="));
const locale = localeArg?.split("=", 2)[1] ?? "en";

function npmCmd(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function waitForHealth(base: string, maxSec: number): Promise<void> {
  const deadline = Date.now() + maxSec * 1000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/api/health`, { cache: "no-store" });
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Health check timeout (${maxSec}s)`);
}

async function measureTtfb(url: string): Promise<number> {
  const t0 = performance.now();
  const res = await fetch(url, { cache: "no-store" });
  await res.arrayBuffer();
  return Math.round(performance.now() - t0);
}

async function main(): Promise<void> {
  if (!noClean && fs.existsSync(path.join(ROOT, ".next"))) {
    fs.rmSync(path.join(ROOT, ".next"), { recursive: true, force: true });
    console.log("[perf:first-load] Removido .next");
  } else if (!noClean) {
    console.log("[perf:first-load] .next já ausente");
  }

  if (!noClean) {
    console.log("[perf:first-load] npm run build …");
    execSync(`${npmCmd()} run build`, { cwd: ROOT, stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
  }

  const base = `http://127.0.0.1:${PORT}`;
  const standaloneDir = path.join(ROOT, ".next", "standalone");
  const standaloneServer = path.join(standaloneDir, "server.js");
  const child = fs.existsSync(standaloneServer)
    ? spawn(process.execPath, ["server.js"], {
        cwd: standaloneDir,
        stdio: "inherit",
        shell: true,
        env: {
          ...process.env,
          PORT: String(PORT),
          HOSTNAME: "127.0.0.1",
        },
      })
    : spawn(npmCmd(), ["run", "start", "--", "-p", String(PORT)], {
        cwd: ROOT,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, PORT: String(PORT) },
      });

  try {
    await waitForHealth(base, 90);
    const pathPricing = `/${locale}/pricing`;
    const url = `${base}${pathPricing}`;
    const runs: number[] = [];
    for (let i = 0; i < 5; i++) runs.push(await measureTtfb(url));
    runs.sort((a, b) => a - b);
    const median = runs[2]!;
    const min = runs[0]!;
    console.log("\n[perf:first-load] GET", pathPricing, "(cache: no-store, n=5)");
    console.log("[perf:first-load] ms:", runs.join(", "));
    console.log("[perf:first-load] min / median:", min, "/", median);
    console.log(
      median <= GOAL_MS
        ? `[perf:first-load] Mediana ≤ ${GOAL_MS} ms (objectivo TTFB indicativo).`
        : `[perf:first-load] Mediana > ${GOAL_MS} ms — optimizar SSR/payload ou usar CDN; FCP pode diferir.`,
    );
    console.log("[perf:first-load] Para FCP real, use Lighthouse ou WebPageTest contra o URL de produção.\n");
  } finally {
    child.kill("SIGTERM");
    if (process.platform === "win32") {
      try {
        execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" });
      } catch {
        /* ignore */
      }
    }
  }
}

main().catch((e) => {
  console.error("[perf:first-load]", e);
  process.exit(1);
});
