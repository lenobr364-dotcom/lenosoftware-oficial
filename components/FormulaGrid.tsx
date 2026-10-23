"use client";

import { FormulaDetailViewModal } from "@/components/FormulaDetailViewModal";
import type { Formula } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { glassButton, glassInput, glassPanelDense } from "@/lib/ui-glass";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Quando true, carrega o catálogo em páginas via `/api/catalog/formulas-dashboard` (CEO + licença core). */
  lazy?: boolean;
  initialFormulas?: Formula[];
};

function blindagemNivel(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 62 + (h % 34);
}

/** Fórmula em destaque: ARLA 32 (nome vindo da base pode variar em maiúsculas/espaços). */
function isArla32Premium(nome: string) {
  return /\barla\s*32\b/i.test(nome.trim());
}

export default function FormulaGrid({ lazy = false, initialFormulas = [] }: Props) {
  const t = useTranslations("Dashboard.formulaGrid");
  const [search, setSearch] = useState("");
  const [detailFormula, setDetailFormula] = useState<Formula | null>(null);

  const [items, setItems] = useState<Formula[]>(() => (lazy ? [] : initialFormulas));
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(lazy);
  const [loading, setLoading] = useState(lazy);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (nextCursor: string | null, append: boolean) => {
    const isFirst = !append;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    setLoadError(null);
    try {
      const qs = new URLSearchParams({ limit: "24" });
      if (nextCursor) qs.set("cursor", nextCursor);
      const r = await fetch(`/api/catalog/formulas-dashboard?${qs.toString()}`, { credentials: "include" });
      const j = (await r.json()) as { ok?: boolean; formulas?: Formula[]; nextCursor?: string | null; error?: string };
      if (!r.ok || !j.ok || !Array.isArray(j.formulas)) {
        setLoadError(j.error ?? "fetch_failed");
        return;
      }
      setItems((prev) => (append ? [...prev, ...j.formulas!] : j.formulas!));
      setCursor(j.nextCursor ?? null);
      setHasMore(Boolean(j.nextCursor));
    } catch {
      setLoadError("fetch_failed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!lazy) return;
    void fetchPage(null, false);
  }, [lazy, fetchPage]);

  useEffect(() => {
    if (!lazy || !hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && hasMore && !loadingMore && cursor) {
            void fetchPage(cursor, true);
            break;
          }
        }
      },
      { rootMargin: "120px", threshold: 0 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [lazy, hasMore, loading, loadingMore, cursor, fetchPage]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((f) => f.nome.toLowerCase().includes(q) || f.categoria.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div id="cv-tour-formula-catalog" className="scroll-mt-28">
      {lazy && loadError && (
        <p className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{t("loadError")}</p>
      )}
      {lazy && loading && items.length === 0 && (
        <div className="mb-10 grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div key={k} className={`h-48 rounded-2xl ${glassPanelDense}`} />
          ))}
        </div>
      )}

      <div className="mb-10">
        <input
          id="cv-tour-formula-search"
          type="search"
          placeholder={t("searchPlaceholder")}
          className={`w-full p-4 text-sm text-white md:w-96 ${glassInput}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t("searchAriaLabel")}
          disabled={lazy && loading && items.length === 0}
        />
        {lazy && items.length > 0 && <p className="mt-2 text-xs text-neutral-500">{t("lazySearchHint")}</p>}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((formula, idx) => {
          const nivel = blindagemNivel(formula.id);
          const premiumArla = isArla32Premium(formula.nome);
          return (
            <div
              key={formula.id}
              style={{ animationDelay: `${Math.min(idx, 14) * 120}ms` }}
              className={[
                premiumArla
                  ? "cv-formula-blindagem group relative overflow-hidden px-8 pb-8 pt-24 transition-all duration-500 hover:bg-white/[0.08]"
                  : "cv-formula-blindagem group relative overflow-hidden p-8 transition-all duration-500 hover:bg-white/[0.08]",
                glassPanelDense,
                premiumArla
                  ? "border-[#D4AF37]/55 shadow-[0_0_52px_-8px_rgba(212,175,55,0.55),inset_0_0_0_1px_rgba(212,175,55,0.18)] ring-2 ring-[#D4AF37]/40 ring-offset-2 ring-offset-black"
                  : "",
              ].join(" ")}
            >
              {premiumArla ? (
                <div
                  className="pointer-events-none absolute left-4 top-4 z-[2] max-w-[11.5rem] rounded-md border border-[#D4AF37]/70 bg-[linear-gradient(135deg,rgba(212,175,55,0.22)_0%,rgba(212,175,55,0.08)_48%,rgba(20,18,12,0.82)_100%)] px-2.5 py-1.5 text-center shadow-[0_8px_24px_-4px_rgba(212,175,55,0.45),inset_0_1px_0_rgba(255,248,220,0.35)] backdrop-blur-sm [-webkit-backdrop-filter:blur(10px)] [transform:rotate(-7deg)]"
                  aria-hidden
                >
                  <p className="text-[9px] font-black uppercase leading-tight tracking-[0.12em] text-[#fcefb7]">{t("arlaPremiumSeal")}</p>
                </div>
              ) : null}

              <div
                className={[
                  "pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500",
                  premiumArla
                    ? "opacity-100 shadow-[inset_0_0_40px_-8px_rgba(212,175,55,0.12)]"
                    : "opacity-0 shadow-[inset_0_0_0_1px_rgba(212,175,55,0)] group-hover:opacity-100 group-hover:shadow-[inset_0_0_28px_rgba(212,175,55,0.06),inset_0_0_0_1px_rgba(212,175,55,0.22)]",
                ].join(" ")}
                aria-hidden
              />

              <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-500">
                  {formula.categoria}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/80">
                  <Lock className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                  {t("blindagemLabel")} · {nivel}%
                </span>
              </div>

              <div className="relative mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9a7822] via-[#D4AF37] to-yellow-100/85 shadow-[0_0_12px_rgba(212,175,55,0.35)] transition-[width] duration-1000 ease-out"
                  style={{ width: `${nivel}%` }}
                  role="progressbar"
                  aria-valuenow={nivel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t("blindagemLabel")}
                />
              </div>

              <div className="relative mb-4 flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/35 bg-[#D4AF37]/12 text-[#D4AF37] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-[#D4AF37]">
                  {formula.nome}
                </h3>
              </div>

              <div className="relative mb-8 text-sm leading-relaxed text-gray-500">
                {formula.descricao ? <p>{formula.descricao}</p> : <p>{t("descFallback")}</p>}
                {premiumArla ? (
                  <p className="mt-3 border-l-2 border-[#D4AF37]/55 pl-3 text-[13px] font-medium italic leading-snug text-[#D4AF37]/90">
                    {t("arlaPremiumFootnote")}
                  </p>
                ) : null}
              </div>

              <div className="relative flex flex-col gap-3">
                <button
                  type="button"
                  id={idx === 0 ? "cv-tour-datasheet-btn" : undefined}
                  onClick={() => setDetailFormula(formula)}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-widest ${glassButton} border-[#D4AF37]/25 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/10 hover:text-white`}
                >
                  {t("viewDetail")}
                </button>
                <Link
                  href={`/dashboard/certifications?formula=${encodeURIComponent(formula.id)}`}
                  className={`flex w-full items-center justify-center py-4 text-center text-xs font-bold uppercase tracking-widest ${glassButton} border-amber-400/30 bg-[#D4AF37]/10 text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/18`}
                >
                  {t("generateLicensePdf")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {lazy && hasMore && (
        <div ref={sentinelRef} className="flex h-16 items-center justify-center py-6 text-xs text-neutral-500">
          {loadingMore ? t("loadingMore") : "\u00a0"}
        </div>
      )}

      <FormulaDetailViewModal formula={detailFormula} onClose={() => setDetailFormula(null)} />
    </div>
  );
}
