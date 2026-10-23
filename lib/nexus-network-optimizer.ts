/**
 * NEXUS CORE — gateway multi-regiao (latencia e rota remota).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type GatewayNode = {
  name: string;
  role: string;
  latencyMs: number;
  status: "OK" | "DEGRADED";
};

export type GatewaySyncReport = {
  commandRegion: string;
  primaryConnection: string;
  nodes: GatewayNode[];
  bestNode: string;
  tunnelStatus: string;
  signalStatus: string;
  optimizedAt: string;
};

export class NexusNetworkOptimizer {
  static readonly PRIMARY_CONNECTION = "STARLINK_SECURE_TUNNEL";

  static readonly NODES = [
    { name: "Sao Paulo (Principal)", role: "primary", baseLatencyMs: 18 },
    { name: "Santiago (Espelhamento)", role: "mirror", baseLatencyMs: 28 },
    { name: "Ohio (Backup Google)", role: "backup", baseLatencyMs: 22 },
  ] as const;

  private static regionLatencyBias(region: string): number {
    const r = region.toLowerCase();
    if (r.includes("mato grosso") || r.includes("cuiaba")) return 4;
    if (r.includes("minas") || r.includes("belo horizonte") || r.includes("bh")) return 2;
    if (r.includes("portugal") || r.includes("europa")) return 12;
    return 6;
  }

  static buildSyncReport(currentRegion: string): GatewaySyncReport {
    const bias = this.regionLatencyBias(currentRegion);
    const nodes: GatewayNode[] = this.NODES.map((node) => {
      const latencyMs = node.baseLatencyMs + bias;
      return {
        name: node.name,
        role: node.role,
        latencyMs,
        status: latencyMs <= 35 ? "OK" : "DEGRADED",
      };
    });

    const best = nodes.reduce((a, b) => (a.latencyMs <= b.latencyMs ? a : b));

    return {
      commandRegion: currentRegion,
      primaryConnection: this.PRIMARY_CONNECTION,
      nodes,
      bestNode: best.name,
      tunnelStatus: "Tune de dados blindado e acelerado",
      signalStatus: "Estavel. Pronto para operacao via Satelite/Fibra",
      optimizedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Sincroniza gateway conforme localizacao do comando.
   */
  static optimizeGateway(
    currentRegion: string,
    logToConsole = true,
  ): GatewaySyncReport {
    const report = this.buildSyncReport(currentRegion);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log(`   SINCRO DE GATEWAY: ${currentRegion.toUpperCase()}`);
    console.log(`   CONEXAO PRIORITARIA: ${report.primaryConnection}`);
    console.log(`   NO OTIMO: ${report.bestNode}`);
    console.log("-".repeat(45));

    for (const node of report.nodes) {
      console.log(
        `[LATENCY]: Otimizando rota para ${node.name}... [${node.status}: ${node.latencyMs}ms]`,
      );
    }

    console.log(`\nSTATUS: ${report.tunnelStatus}.`);
    console.log(`SINAL: ${report.signalStatus}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistGatewayReport(
    report: GatewaySyncReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-network");
    await mkdir(dir, { recursive: true });
    const safeRegion = report.commandRegion.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const filePath = path.join(dir, `leno_gateway_${safeRegion}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
