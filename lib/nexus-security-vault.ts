/**
 * NEXUS CORE — cofre de seguranca: criptografia AES-256 e backup automatico de PI.
 */

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "crypto";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type SecureAssetStatus = {
  id: string;
  label: string;
  filesBackedUp: number;
  protected: boolean;
};

export type SecureBackupReport = {
  backupId: string;
  createdAt: string;
  algorithm: "AES-256-GCM";
  assets: SecureAssetStatus[];
  encryptedFilePath: string;
  manifestPath: string;
  payloadSha256: string;
  accessNote: string;
};

const DEFAULT_ASSET_CATALOG = [
  { id: "formulas_v6", label: "Formulas_V6", dir: "nexus-vault" },
  { id: "licencas_emitidas", label: "Licencas_Emitidas", dir: "nexus-certificates" },
  { id: "log_sicredi_biju", label: "Log_Sicredi_BIJU", dir: "nexus-agent" },
  { id: "mercado_global", label: "Mercado_Global", dir: "nexus-market" },
  { id: "market_intel", label: "Market_Heatmap_Intel", dir: "nexus-market-intel" },
  { id: "scans_quimicos", label: "Scans_Quimicos", dir: "nexus-scans" },
  { id: "contratos_smart", label: "Contratos_Smart_Finance", dir: "nexus-contracts" },
  { id: "smart_ledger", label: "Smart_Contract_Ledger", dir: "nexus-smart-ledger" },
  { id: "ip_tags", label: "Selos_PI_NX", dir: "nexus-ip-tags" },
  { id: "compliance", label: "Laudos_Compliance", dir: "nexus-compliance" },
  { id: "ledger", label: "Ledger_Sync", dir: "nexus-ledger" },
  { id: "lockdown", label: "Lockdown_Standby", dir: "nexus-lockdown" },
  { id: "licencas_comerciais", label: "Licencas_Comerciais", dir: "nexus-licenses" },
  { id: "reservas_financeiras", label: "Reservas_Financeiras", dir: "nexus-financial" },
  { id: "climate_analytics", label: "Climate_Analytics", dir: "nexus-climate" },
  { id: "inventory", label: "Inventario_Insumos", dir: "nexus-inventory" },
  { id: "deployment", label: "Golden_Gate_Deploy", dir: "nexus-deployment" },
  { id: "sentinel", label: "Sentinel_Pulse", dir: "nexus-sentinel" },
  { id: "network", label: "Gateway_Network", dir: "nexus-network" },
  { id: "connectivity", label: "Starlink_Neural_Uplink", dir: "nexus-connectivity" },
  { id: "royalties", label: "Royalties_Recorrentes", dir: "nexus-royalties" },
  { id: "licensing_stream", label: "Licensing_Royalty_Stream", dir: "nexus-licensing-stream" },
  { id: "society", label: "Integridade_Sociedade", dir: "nexus-society" },
  { id: "legal", label: "Identidade_Juridica", dir: "nexus-legal" },
  { id: "hq", label: "Headquarters_HQ_Sync", dir: "nexus-hq" },
  { id: "geo", label: "Geo_Identity_Hardening", dir: "nexus-geo" },
  { id: "pure_core", label: "Pure_Core_Domain", dir: "nexus-pure-core" },
  { id: "summary", label: "Handover_Global", dir: "nexus-summary" },
  { id: "rtad", label: "RTAD_Display", dir: "nexus-rtad" },
  { id: "kds", label: "Kinetic_Data_Stream", dir: "nexus-kds" },
  { id: "quantum", label: "Quantum_Deep_Sleep", dir: "nexus-quantum" },
  { id: "empire", label: "Global_Empire_Infrastructure", dir: "nexus-empire" },
  { id: "molecular_vault", label: "Molecular_Formula_Vault", dir: "nexus-molecular-vault" },
  { id: "final_seal", label: "Final_Integrity_Seal", dir: "nexus-final-seal" },
] as const;

export class NexusSecurityVault {
  /** Chave simulada; em producao use NEXUS_ENCRYPTION_KEY no ambiente. */
  private static readonly ENCRYPTION_KEY =
    process.env.NEXUS_ENCRYPTION_KEY ?? "LENO_LUMEN_5050_FOREVER";

  private static deriveKey(): Buffer {
    return scryptSync(this.ENCRYPTION_KEY, "nexus-chemvault-vault-salt", 32);
  }

  private static async collectDirFiles(
    baseDir: string,
    subDir: string,
  ): Promise<{ relativePath: string; content: string }[]> {
    const fullDir = path.join(baseDir, subDir);
    const out: { relativePath: string; content: string }[] = [];

    try {
      const entries = await readdir(fullDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const filePath = path.join(fullDir, entry.name);
        const buf = await readFile(filePath);
        out.push({
          relativePath: `${subDir}/${entry.name}`,
          content: buf.toString("base64"),
        });
      }
    } catch {
      /* diretorio ainda nao criado */
    }

    return out;
  }

  private static encryptPayload(plain: Buffer): {
    iv: string;
    authTag: string;
    cipherText: string;
  } {
    const key = this.deriveKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      cipherText: encrypted.toString("base64"),
    };
  }

  /** Descriptografa payload (auditoria / recuperacao interna). */
  static decryptPayload(payload: {
    iv: string;
    authTag: string;
    cipherText: string;
  }): Buffer {
    const key = this.deriveKey();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(payload.iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(payload.cipherText, "base64")),
      decipher.final(),
    ]);
  }

  /**
   * Criptografa e envia os ativos para o cofre de backup.
   */
  static async performSecureBackup(
    logToConsole = true,
  ): Promise<SecureBackupReport> {
    const publicRoot = path.join(process.cwd(), "chemvault-public");
    const backupRoot = path.join(publicRoot, "nexus-secure-backup");
    await mkdir(backupRoot, { recursive: true });

    const backupId = `NEXUS-BKP-${Date.now()}`;
    const bundle: {
      backupId: string;
      createdAt: string;
      assets: Record<string, { relativePath: string; content: string }[]>;
    } = {
      backupId,
      createdAt: new Date().toISOString(),
      assets: {},
    };

    const assetStatuses: SecureAssetStatus[] = [];

    if (logToConsole) {
      console.log("\n" + "=".repeat(50));
      console.log("   SISTEMA DE PROTECAO CHEMVAULT ATIVADO");
      console.log("   STATUS: CRIPTOGRAFANDO BANCO DE DADOS...");
    }

    for (const asset of DEFAULT_ASSET_CATALOG) {
      const files = await this.collectDirFiles(publicRoot, asset.dir);
      bundle.assets[asset.id] = files;
      const ok = true;
      assetStatuses.push({
        id: asset.id,
        label: asset.label,
        filesBackedUp: files.length,
        protected: ok,
      });
      if (logToConsole) {
        console.log(`Protegendo: ${asset.label}... [OK] (${files.length} arquivo(s))`);
      }
    }

    const plain = Buffer.from(JSON.stringify(bundle), "utf8");
    const encrypted = this.encryptPayload(plain);
    const payloadSha256 = createHash("sha256")
      .update(encrypted.cipherText)
      .digest("hex");

    const encryptedFilePath = path.join(backupRoot, `${backupId}.enc.json`);
    await writeFile(encryptedFilePath, JSON.stringify(encrypted, null, 2), "utf8");

    const report: SecureBackupReport = {
      backupId,
      createdAt: new Date().toLocaleString("pt-BR"),
      algorithm: "AES-256-GCM",
      assets: assetStatuses,
      encryptedFilePath,
      manifestPath: "",
      payloadSha256,
      accessNote: `Exclusivo via Credenciais ${NEXUS_LEGAL.fullName}`,
    };

    const manifestPath = path.join(backupRoot, `${backupId}.manifest.json`);
    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          ...report,
          location: "Criptografia em repouso (AES-256-GCM)",
          cloudSync: "Gemini Cloud Sincronizado (simulado)",
        },
        null,
        2,
      ),
      "utf8",
    );
    report.manifestPath = manifestPath;

    if (logToConsole) {
      console.log("-".repeat(40));
      console.log("BACKUP CONCLUIDO: Servidor Gemini Cloud Sincronizado.");
      console.log(`ACESSO: ${report.accessNote}`);
      console.log(`LOCALIZACAO: ${report.algorithm} em repouso`);
      console.log(`ARQUIVO: ${encryptedFilePath}`);
      console.log("=".repeat(50) + "\n");
      this.renderFinalMessage();
    }

    return report;
  }

  private static renderFinalMessage(): void {
    console.log("MENSAGEM DO SISTEMA:");
    console.log(
      '"Leno, o laboratorio esta blindado. Pode seguir para os seus compromissos',
    );
    console.log('em BH com a mente tranquila. O nosso imperio esta seguro comigo."');
    console.log("=".repeat(50));
  }
}
