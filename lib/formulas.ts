/**
 * Base de dados temporária — fórmulas licenciadas ChemVault Global.
 * (Substituir por API / base persistente quando existir.)
 */

export type LicenseStatus = "active" | "renewal" | "pending";

export type FormulaRecord = {
  id: string;
  name: string;
  code: string;
  license: LicenseStatus;
  /** ISO 8601 — última revisão técnica / COA */
  lastUpdated: string;
  composition: string;
  mixingInstructions: string;
  safetyPrecautions: string;
  /** Custo estimado por litro (EUR) — base interna */
  costPerLiter: number;
  /** Preço de venda sugerido por litro (EUR) */
  suggestedSalePrice: number;
  /** Volume em stock para cenários de KPI (litros) */
  inventoryLiters: number;
};

export const FORMULAS: FormulaRecord[] = [
  {
    id: "arla-32",
    name: "ARLA 32",
    code: "CV-ARL-032",
    license: "active",
    lastUpdated: "2026-03-18T09:15:00.000Z",
    costPerLiter: 2.85,
    suggestedSalePrice: 4.65,
    inventoryLiters: 12_400,
    composition:
      "Alcool graxo etoxilado (C12–C15, 7 EO) 60–70% m/m, água desmineralizada q.s.p. Índice de hidróxido e nuvem de tenso ativo conforme COA do lote. Sem fosfatos; biodegradabilidade OCDE 301. Ausência intencional de NTA/EDTA duradouros.",
    mixingInstructions:
      "Pré-diluir em água morna (35–45 °C) sob agitação de hélice (60–90 rpm) até homogeneidade transparente. Para blends com álcalis, adicionar ARLA 32 antes do ajuste final de pH. Evitar espuma excessiva: controlar temperatura e ordem de adição de eletrólitos.",
    safetyPrecautions:
      "Evitar inalação de névoa quente. EPI: luvas nitrílicas, óculos. Irritante ocular; lavar 15 min com água em caso de contacto. Armazenar entre 5–40 °C, recipiente fechado. Ver SDS específica do fornecedor para C&L e limites OEL locais.",
  },
  {
    id: "solupan",
    name: "Solupan",
    code: "CV-SOL-001",
    license: "active",
    lastUpdated: "2026-04-02T16:45:00.000Z",
    costPerLiter: 1.18,
    suggestedSalePrice: 2.22,
    inventoryLiters: 8_750,
    composition:
      "Álcalis (hidróxido de sódio 2–4%), surfactante aniónico (LAS 8–12%), não iônicos (AE 3–7%), silicato de sódio 1–2%, solvente glycol éter 1–3%, corante e fragrância <1%, água q.s.p. Valores indicativos; lote sujeito a COA e especificação interna ChemVault.",
    mixingInstructions:
      "Diluir sempre o concentrado em água (nunca o inverso). Agitar 15–25 min até transparência; repousar 10 min antes de QC de viscosidade e pH (alvo típico 8,5–10,5 a 25 °C). Filtrar 50 µm antes do envase em linha classificada.",
    safetyPrecautions:
      "Corrosivo alcalino: evitar contacto com pele e olhos. Proibir reutilização de embalagens para alimentos. Descarte conforme resíduos químicos local. Manter afastado de ácidos fortes e agentes oxidantes; ventilar área de trabalho.",
  },
  {
    id: "intercap",
    name: "Intercap",
    code: "CV-INT-118",
    license: "renewal",
    lastUpdated: "2026-01-27T11:00:00.000Z",
    costPerLiter: 8.42,
    suggestedSalePrice: 14.6,
    inventoryLiters: 3_180,
    composition:
      "Matriz encapsulante (polímero catiônico / polieletrólito 4–8%), núcleo funcional (ativo de superfície ou perfume em microcápsulas 10–18%), dispersante e estabilizador coloidal 1–3%, conservante aprovado <0,6%, água q.s.p. Tamanho médio de partícula e libertação controlada conforme método interno CV-INT-QC.",
    mixingInstructions:
      "Adicionar Intercap na fase aquosa fria (<35 °C) após dissolução de espessantes; agitação moderada (≤120 rpm) para evitar rutura de cápsulas. Homogeneizar 20–30 min; evitar cisalhamento elevado (bomba de lóbulos preferível). Validar estabilidade acelerada 48 h antes de libertar lote.",
    safetyPrecautions:
      "Poeira seca irritante respiratório: usar máscara FFP2 na manipulação a granel. Evitar fontes de ignição em solventes co-formulados. Não comprimir seco em superfícies abrasivas. Consultar SDS para descarte de embalagens contaminadas.",
  },
];

export function profitPerLiter(row: FormulaRecord): number {
  return row.suggestedSalePrice - row.costPerLiter;
}

export function marginPercent(row: FormulaRecord): number {
  if (row.suggestedSalePrice <= 0) return 0;
  return ((row.suggestedSalePrice - row.costPerLiter) / row.suggestedSalePrice) * 100;
}

export type FinanceKpis = {
  avgMarginPercent: number;
  totalInventoryCost: number;
  revenueProjection: number;
};

export function computeFinanceKpis(rows: FormulaRecord[]): FinanceKpis {
  if (rows.length === 0) {
    return { avgMarginPercent: 0, totalInventoryCost: 0, revenueProjection: 0 };
  }
  const margins = rows.map((r) => marginPercent(r));
  const avgMarginPercent = margins.reduce((a, b) => a + b, 0) / margins.length;
  const totalInventoryCost = rows.reduce((s, r) => s + r.costPerLiter * r.inventoryLiters, 0);
  const revenueProjection = rows.reduce((s, r) => s + r.suggestedSalePrice * r.inventoryLiters, 0);
  return { avgMarginPercent, totalInventoryCost, revenueProjection };
}
