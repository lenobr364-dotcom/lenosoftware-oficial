import { FormulaLicensingGlassClient } from "@/components/formula-licensing/FormulaLicensingGlassClient";
import { Link } from "@/i18n/navigation";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { computeFormulaIndustrialFingerprintHex } from "@/lib/formula-industrial-fingerprint";
import { listFormulaIndustrialLicenses, evaluateLicenseValidity } from "@/lib/formula-license-smart-contract";
import { FORMULAS } from "@/lib/formulas";
import { redirect } from "next/navigation";

export default async function FormulaLicensingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  const fingerprints = FORMULAS.map((f) => {
    const { hashHex } = computeFormulaIndustrialFingerprintHex(f);
    return {
      formulaId: f.id,
      code: f.code,
      name: f.name,
      licenseStatus: f.license,
      lastUpdated: f.lastUpdated,
      securityFingerprintSha256: hashHex,
    };
  });

  let rawGrants: Awaited<ReturnType<typeof listFormulaIndustrialLicenses>> = [];
  try {
    rawGrants = await listFormulaIndustrialLicenses();
  } catch {
    rawGrants = [];
  }

  const grants = rawGrants.map((r) => ({
    id: r.id,
    clientSubject: r.clientSubject,
    formulaCode: r.formulaCode,
    validFrom: r.validFrom.toISOString(),
    validUntil: r.validUntil.toISOString(),
    status: r.status,
    validity: evaluateLicenseValidity(r),
    grantHash: r.grantHash,
    chainAnchor: r.chainAnchor,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="relative min-h-screen bg-[#03050a] px-5 py-10 text-white sm:px-6 md:px-10 md:py-14">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-32 h-[480px] w-[480px] rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
              ChemVault Global · Leno.Software
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Intelligent industrial formula licensing
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Cryptographic fingerprints and a simulated smart-contract layer for per-client validity. Autonomous
              agents audit via{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-cyan-100">
                GET /api/agents/formula-licenses/audit
              </code>
              .
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:border-cyan-400/30"
          >
            ← Dashboard
          </Link>
        </div>

        <FormulaLicensingGlassClient fingerprints={fingerprints} initialGrants={grants} />
      </main>
    </div>
  );
}
