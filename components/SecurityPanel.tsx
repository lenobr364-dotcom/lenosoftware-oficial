const R = 52;
const C = 2 * Math.PI * R;

type RingProps = {
  pct: number;
  centerPrimary: string;
  centerSecondary?: string;
  gradientId: string;
};

function CircularRing({ pct, centerPrimary, centerSecondary, gradientId }: RingProps) {
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = C * (1 - clamped / 100);
  const size = 132;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9a7822" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#f5e6a8" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" className="stroke-white/[0.08]" strokeWidth="9" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className="drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <p className="text-base font-black leading-tight tracking-tight text-white sm:text-lg">{centerPrimary}</p>
          {centerSecondary ? (
            <p className="mt-1 max-w-[7.25rem] text-[9px] font-semibold normal-case leading-tight tracking-wide text-emerald-300/95">
              {centerSecondary}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LinearBar({ pct }: { pct: number }) {
  return (
    <div className="mt-4 h-1.5 w-full max-w-[200px] rounded-full bg-white/[0.08] ring-1 ring-white/[0.05]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#9a7822] via-[#D4AF37] to-yellow-100/85 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SecurityPanel() {
  return (
    <section
      className="relative isolate w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(12,12,16,0.92)_0%,rgba(5,5,8,0.9)_38%,rgba(22,18,12,0.78)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-8 md:p-10"
      aria-labelledby="security-panel-title"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(212,175,55,0.1),transparent_58%)]"
        aria-hidden
      />

      <div className="relative">
        <h2 id="security-panel-title" className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
          Status da Blindagem de Dados
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-400">
          Indicadores operacionais do cofre — integridade, criptografia e vigilância de acesso.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          <article className="flex flex-col items-center text-center">
            <CircularRing pct={99.9} centerPrimary="99.9%" gradientId="cv-security-grad-integridade" />
            <p className="mt-5 max-w-[15rem] text-sm font-semibold leading-snug text-gray-200">Integridade das Fórmulas</p>
            <LinearBar pct={99.9} />
          </article>

          <article className="flex flex-col items-center text-center">
            <CircularRing pct={100} centerPrimary="Ativa" gradientId="cv-security-grad-crypto" />
            <p className="mt-5 max-w-[15rem] text-sm font-semibold leading-snug text-gray-200">
              Criptografia de Ponta-a-Ponta
            </p>
            <LinearBar pct={100} />
          </article>

          <article className="flex flex-col items-center text-center">
            <CircularRing
              pct={100}
              centerPrimary="100%"
              centerSecondary="Zero Vulnerabilidades"
              gradientId="cv-security-grad-monitor"
            />
            <p className="mt-5 max-w-[15rem] text-sm font-semibold leading-snug text-gray-200">Monitoramento de Acesso</p>
            <div className="mt-4 h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-emerald-500/20">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-700/90 via-emerald-500 to-emerald-300/85 shadow-[0_0_14px_rgba(52,211,153,0.28)]" />
            </div>
          </article>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#D4AF37]/85">
            Selo de Segurança Garantido por Leno César &amp; Lumen Onel
          </p>
        </footer>
      </div>
    </section>
  );
}
