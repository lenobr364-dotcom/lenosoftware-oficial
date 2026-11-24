import { EXPECTED_LENO_CNPJ, LENO_OPERATOR } from "@/lib/anti-disintermediation/exclusivity-terms";

/**
 * Planos comerciais Leno.Software — cobrança Pix Santander PJ.
 * Valores oficiais em BRL; CNPJ recebedor: 36.962.878/0001-55.
 */

export const BRITAGRID_COMMERCIAL_BRAND = "Leno.Software";

export type ComercialPlanId = "operador_locador" | "frota_enterprise";

export type ComercialPlan = {
  id: ComercialPlanId;
  name: string;
  priceMonthlyBrl: number;
  maxMobileSets: number | null;
  features: string[];
  unlimitedCalculators: boolean;
  proposalPdf: boolean;
  multiSite: boolean;
  customLithologyWear: boolean;
};

export const COMERCIAL_PLANS: readonly ComercialPlan[] = [
  {
    id: "operador_locador",
    name: "Plano Operação",
    priceMonthlyBrl: 497,
    maxMobileSets: 5,
    unlimitedCalculators: true,
    proposalPdf: true,
    multiSite: false,
    customLithologyWear: false,
    features: [
      "Fluxo comercial intermediado",
      "Proposta em PDF",
      "Até 5 operações ativas",
      "Anti-desintermediação de contatos",
    ],
  },
  {
    id: "frota_enterprise",
    name: "Plano Enterprise",
    priceMonthlyBrl: 1490,
    maxMobileSets: null,
    unlimitedCalculators: true,
    proposalPdf: true,
    multiSite: true,
    customLithologyWear: true,
    features: [
      "Operações ilimitadas",
      "Gestão multiunidade",
      "Parâmetros comerciais próprios",
      "PDF de proposta",
      "Prioridade no Pix Santander PJ",
    ],
  },
] as const;

/** Taxa de intermediação/comissão no marketplace (vinculada ao termo de exclusividade). */
export const MARKETPLACE_COMMISSION = {
  subscriberRate: 0.025,
  adHocRate: 0.04,
  subscriberLabel: "2,5% (assinantes)",
  adHocLabel: "4,0% (locações avulsas)",
} as const;

export type CommissionKind = "subscriber" | "adhoc";

export function getCommissionRate(kind: CommissionKind): number {
  return kind === "subscriber" ? MARKETPLACE_COMMISSION.subscriberRate : MARKETPLACE_COMMISSION.adHocRate;
}

export function calculateCommissionBrl(baseAmountBrl: number, kind: CommissionKind): number {
  const base = Number(baseAmountBrl);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return Math.round(base * getCommissionRate(kind) * 100) / 100;
}

export function getComercialPlan(id: ComercialPlanId): ComercialPlan {
  const plan = COMERCIAL_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`unknown_plan:${id}`);
  return plan;
}

export function getPixBillingConfig() {
  return {
    brand: BRITAGRID_COMMERCIAL_BRAND,
    operator: LENO_OPERATOR.holding,
    legalName: LENO_OPERATOR.legalName,
    cnpj: EXPECTED_LENO_CNPJ,
    channel: "Santander PJ · Pix",
    plans: COMERCIAL_PLANS,
    commission: MARKETPLACE_COMMISSION,
  };
}
