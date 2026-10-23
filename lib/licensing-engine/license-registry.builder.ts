import {
  evaluateLicenseValidity,
  listAllFormulaIndustrialLicensesForEngine,
} from "@/lib/formula-license-smart-contract";
import { FORMULAS } from "@/lib/formulas";
import type {
  FormulaLicenseRow,
  LicenseEngineStatus,
  LicenseValidity,
  LicensingEnginePage,
  LicensingEngineQuery,
} from "@/lib/licensing-engine/types";

let cache: FormulaLicenseRow[] | null = null;
let cacheAt = 0;
const CACHE_MS = 2_500;

function resolveFormula(code: string) {
  return FORMULAS.find((f) => f.code === code);
}

function mapValidity(
  status: string,
  row: { validFrom: Date; validUntil: Date },
): LicenseValidity {
  if (status === "PENDING") return "PENDING";
  const v = evaluateLicenseValidity({ status, validFrom: row.validFrom, validUntil: row.validUntil });
  return v;
}

async function loadRows(): Promise<FormulaLicenseRow[]> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_MS) return cache;

  const rows = await listAllFormulaIndustrialLicensesForEngine();
  cache = rows.map((r) => {
    const formula = resolveFormula(r.formulaCode);
    return {
    id: r.id,
    formulaId: formula?.id ?? r.formulaCode,
    clientSubject: r.clientSubject,
    formulaCode: r.formulaCode,
    formulaName: formula?.name ?? r.formulaCode,
    status: r.status as LicenseEngineStatus,
    validity: mapValidity(r.status, r),
    validFrom: r.validFrom.toISOString(),
    validUntil: r.validUntil.toISOString(),
    grantHash: r.grantHash,
    chainAnchor: r.chainAnchor,
    createdAt: r.createdAt.toISOString(),
  };
  });
  cacheAt = now;
  return cache;
}

export function invalidateLicenseEngineCache(): void {
  cache = null;
  cacheAt = 0;
}

export async function buildComplianceLicensePage(query: LicensingEngineQuery): Promise<LicensingEnginePage> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, query.pageSize ?? 20));

  const all = (await loadRows()).filter((r) => r.status !== "PENDING");

  const metrics = {
    pending: 0,
    active: all.filter((r) => r.status === "ACTIVE").length,
    revoked: all.filter((r) => r.status === "REVOKED").length,
  };

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: all.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    metrics,
  };
}

export async function buildLicensingEnginePage(query: LicensingEngineQuery): Promise<LicensingEnginePage> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, query.pageSize ?? 20));

  let all = await loadRows();

  const metrics = {
    pending: all.filter((r) => r.status === "PENDING").length,
    active: all.filter((r) => r.status === "ACTIVE").length,
    revoked: all.filter((r) => r.status === "REVOKED").length,
  };

  if (query.status && query.status !== "all") {
    all = all.filter((r) => r.status === query.status);
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: all.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    metrics,
  };
}
