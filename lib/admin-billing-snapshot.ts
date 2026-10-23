import { prisma } from "@/lib/prisma";
import { APPROVED_LEAD_STATUSES } from "@/lib/technical-library-access";

function numEnv(name: string, fallback: number): number {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Preço anual de referência por licença aprovada (ajustável por moeda, sem redeploy de copy). */
function annualUnitForCurrency(code: string): number {
  switch (code) {
    case "USD":
      return numEnv("CHEMVAULT_LICENSE_UNIT_USD_ANNUAL", 2_500);
    case "EUR":
      return numEnv("CHEMVAULT_LICENSE_UNIT_EUR_ANNUAL", 2_300);
    case "BRL":
    default:
      return numEnv("CHEMVAULT_LICENSE_UNIT_BRL_ANNUAL", 12_000);
  }
}

export type AdminBillingSnapshot = {
  /** Subjects distintos com atividade de licença nos últimos 30 dias (proxy de “tokens” ativos). */
  activeLicenseTokens30d: number;
  /** Contagem de leads aprovados por moeda (catálogo comercial). */
  approvedDealsByCurrency: { currencyCode: string; count: number }[];
  /** Receita anual projetada = count × unidade anual por moeda. */
  projectedAnnualRevenueByCurrency: { currencyCode: string; amount: number }[];
};

export async function computeAdminBillingSnapshot(): Promise<AdminBillingSnapshot> {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const distinctSubjects = await prisma.licenseActivity.findMany({
    where: { createdAt: { gte: since30 } },
    select: { subject: true },
    distinct: ["subject"],
  });

  const approvedGroups = await prisma.licenseRequest.groupBy({
    by: ["currencyCode"],
    where: { status: { in: [...APPROVED_LEAD_STATUSES] } },
    _count: { _all: true },
  });

  const approvedDealsByCurrency = approvedGroups.map((g) => ({
    currencyCode: g.currencyCode,
    count: g._count._all,
  }));

  const projectedAnnualRevenueByCurrency = approvedDealsByCurrency.map((row) => ({
    currencyCode: row.currencyCode,
    amount: row.count * annualUnitForCurrency(row.currencyCode),
  }));

  return {
    activeLicenseTokens30d: distinctSubjects.length,
    approvedDealsByCurrency,
    projectedAnnualRevenueByCurrency,
  };
}
