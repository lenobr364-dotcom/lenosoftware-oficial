"use client";

const PARTICLE_SEED: { left: number; top: number; size: number; duration: number; delay: number }[] = [
  { left: 6, top: 18, size: 2, duration: 32, delay: 0 },
  { left: 14, top: 72, size: 1.5, duration: 26, delay: 1.2 },
  { left: 22, top: 38, size: 2.5, duration: 38, delay: 0.4 },
  { left: 31, top: 12, size: 1, duration: 24, delay: 2.1 },
  { left: 38, top: 84, size: 2, duration: 30, delay: 0.8 },
  { left: 45, top: 55, size: 1.5, duration: 28, delay: 1.6 },
  { left: 52, top: 22, size: 2, duration: 34, delay: 0.2 },
  { left: 58, top: 68, size: 1, duration: 22, delay: 2.4 },
  { left: 64, top: 41, size: 2.5, duration: 36, delay: 0.6 },
  { left: 71, top: 88, size: 1.5, duration: 27, delay: 1.1 },
  { left: 78, top: 15, size: 2, duration: 33, delay: 1.8 },
  { left: 85, top: 48, size: 1, duration: 25, delay: 0.3 },
  { left: 92, top: 76, size: 2, duration: 31, delay: 2 },
  { left: 11, top: 91, size: 1.5, duration: 29, delay: 0.9 },
  { left: 27, top: 61, size: 2, duration: 35, delay: 1.4 },
  { left: 41, top: 8, size: 1, duration: 23, delay: 2.2 },
  { left: 55, top: 94, size: 2.5, duration: 37, delay: 0.5 },
  { left: 69, top: 33, size: 1.5, duration: 26, delay: 1.7 },
  { left: 83, top: 58, size: 2, duration: 32, delay: 0.1 },
  { left: 95, top: 28, size: 1, duration: 24, delay: 1.9 },
  { left: 18, top: 45, size: 1.5, duration: 28, delay: 0.7 },
  { left: 34, top: 79, size: 2, duration: 34, delay: 1.3 },
  { left: 48, top: 19, size: 1, duration: 21, delay: 2.3 },
  { left: 61, top: 52, size: 2.5, duration: 39, delay: 0.45 },
  { left: 74, top: 7, size: 1.5, duration: 27, delay: 1.55 },
  { left: 88, top: 63, size: 2, duration: 30, delay: 0.25 },
  { left: 4, top: 52, size: 1, duration: 26, delay: 1.25 },
  { left: 97, top: 44, size: 1.5, duration: 29, delay: 0.95 },
  { left: 53, top: 3, size: 2, duration: 33, delay: 1.65 },
  { left: 39, top: 96, size: 1, duration: 22, delay: 2.05 },
];

export function BijuLandingAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020308]" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,8,0.2)_0%,rgba(2,3,12,0.92)_100%)]" />

      <div
        className="absolute -left-[18%] -top-[12%] h-[min(85vw,52rem)] w-[min(85vw,52rem)] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(34,211,238,0.28),transparent_68%)] blur-3xl"
        style={{ animation: "biju-orb-shift 24s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-[8%] -right-[12%] h-[min(80vw,48rem)] w-[min(80vw,48rem)] rounded-full bg-[radial-gradient(circle_at_60%_45%,rgba(139,92,246,0.26),transparent_70%)] blur-3xl"
        style={{ animation: "biju-orb-shift 30s ease-in-out infinite", animationDelay: "-10s" }}
      />
      <div
        className="absolute left-1/2 top-[42%] h-[min(95vw,56rem)] w-[min(95vw,56rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.14),transparent_58%)] blur-3xl"
        style={{ animation: "biju-orb-shift 36s ease-in-out infinite", animationDelay: "-5s" }}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-[140vmax] w-[140vmax] opacity-[0.055]"
          style={{
            animation: "biju-mesh-rotate 140s linear infinite",
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(34,211,238,0.4), transparent 16%, rgba(139,92,246,0.35), transparent 38%, rgba(34,211,238,0.25), transparent 55%, rgba(6,182,212,0.3), transparent 72%, rgba(34,211,238,0.35))",
          }}
        />
      </div>

      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="biju-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(167,139,250)" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <g
          fill="none"
          stroke="url(#biju-edge)"
          strokeWidth="0.08"
          style={{ animation: "biju-line-pulse 14s ease-in-out infinite" }}
        >
          <path d="M12 78 L38 42 L62 58 L88 22" vectorEffect="non-scaling-stroke" />
          <path d="M8 32 L28 18 L55 35 L72 12" vectorEffect="non-scaling-stroke" />
          <path d="M18 88 L44 68 L68 82 L92 62" vectorEffect="non-scaling-stroke" />
          <path d="M25 52 L48 28 L78 48" vectorEffect="non-scaling-stroke" />
          <path d="M5 55 L32 72 L58 48 L95 38" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>

      {PARTICLE_SEED.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-cyan-200/35 shadow-[0_0_10px_rgba(34,211,238,0.35)]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animation: `biju-particle-drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(0,0,0,0.55),transparent_72%)]" />
    </div>
  );
}
