import type { LogisticsPortId } from "@/lib/logistics-global-hub-data";
import { LOGISTICS_PORTS } from "@/lib/logistics-global-hub-data";

type WorldMapBackdropProps = {
  highlightPortId: LogisticsPortId | null;
};

/**
 * Mapa mundi estilizado (silhuetas abstratas + meridianos + marcas de porto).
 */
export function WorldMapBackdrop({ highlightPortId }: WorldMapBackdropProps) {
  const vb = "0 0 1000 420";

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-cyan-400/35"
      viewBox={vb}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="lgh-ocean" cx="48%" cy="42%" r="78%">
          <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.14" />
          <stop offset="55%" stopColor="rgb(8 47 73)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="rgb(0 0 0)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lgh-arc" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(250 204 21)" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(250 204 21)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1000" height="420" fill="url(#lgh-ocean)" />

      {[80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880].map((x) => (
        <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="420" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
      ))}
      {[70, 140, 210, 280, 350].map((y) => (
        <line key={`h-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
      ))}

      {/* Continentes estilizados (formas simplificadas) */}
      <path
        fill="currentColor"
        fillOpacity="0.07"
        d="M180 120 C260 80 320 100 340 160 C300 200 220 210 160 180 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.08"
        d="M300 240 C360 200 400 220 420 300 C380 360 300 340 280 280 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.07"
        d="M460 100 C540 70 620 90 660 140 C640 200 520 210 460 170 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.09"
        d="M620 120 C760 90 880 120 920 200 C880 260 700 280 600 220 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.06"
        d="M760 280 C820 260 880 300 900 360 C840 400 740 380 720 320 Z"
      />

      <path
        d="M 598 252 Q 520 200 318 332"
        fill="none"
        stroke="url(#lgh-arc)"
        strokeWidth="1.2"
        strokeDasharray="6 10"
        opacity="0.55"
      />

      {LOGISTICS_PORTS.map((p) => {
        const active = highlightPortId === p.id;
        return (
          <g key={p.id} transform={`translate(${p.map.x} ${p.map.y})`}>
            {active ? (
              <circle r="22" fill="rgb(250 204 21)" fillOpacity="0.12" className="animate-pulse" />
            ) : null}
            <circle r="5" fill={active ? "rgb(250 204 21)" : "rgb(34 211 238)"} fillOpacity={active ? 0.95 : 0.45} />
            <circle r="9" fill="none" stroke={active ? "rgb(250 204 21)" : "currentColor"} strokeOpacity={active ? 0.7 : 0.35} strokeWidth="0.8" />
          </g>
        );
      })}
    </svg>
  );
}
