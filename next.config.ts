import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const STATIC_IMMUTABLE = "public, max-age=31536000, immutable";

const assetPrefix = process.env.CHEMVAULT_ASSET_PREFIX?.trim().replace(/\/$/, "") || undefined;

const enableHsts =
  process.env.CHEMVAULT_ENABLE_HSTS === "1" || process.env.VERCEL === "1" || process.env.CHEMVAULT_HSTS === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typedRoutes: true,
  poweredByHeader: false,
  compress: true,
  ...(assetPrefix ? { assetPrefix } : {}),
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  /**
   * Ícones e SVG em `public` + `/icon.svg`: cache longo na borda.
   * JS/CSS/fontes (`next/font`) vivem em `/_next/static` com hash — o Next já envia cache imutável em produção; não sobrescrever evita avisos e regressões no `next dev`.
   */
  async headers() {
    const publicSvg = ["/next.svg", "/vercel.svg", "/globe.svg", "/file.svg", "/window.svg", "/icon.svg"];
    const svgHeaders = publicSvg.map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: STATIC_IMMUTABLE }],
    }));
    const glassHeaders = [
      {
        source: "/glass/:path*",
        headers: [{ key: "Cache-Control", value: STATIC_IMMUTABLE }],
      },
    ];
    const securityBaseline = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
    const globalSecurity = [
      {
        source: "/:path*",
        headers: securityBaseline,
      },
    ];
    const labPageCache = [
      {
        source: "/:locale/dashboard/nexus-lab",
        headers: [{ key: "Cache-Control", value: "private, no-cache, must-revalidate" }],
      },
      {
        source: "/:locale/dashboard/laboratorio",
        headers: [{ key: "Cache-Control", value: "private, no-cache, must-revalidate" }],
      },
      {
        source: "/:locale/dashboard/gemini-lab/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-cache, must-revalidate" }],
      },
      {
        source: "/:locale/dashboard/live-operations-map",
        headers: [{ key: "Cache-Control", value: "private, no-cache, must-revalidate" }],
      },
    ];
    const hstsHeaders = enableHsts
      ? [
          {
            source: "/:path*",
            headers: [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ],
          },
        ]
      : [];
    return [...svgHeaders, ...glassHeaders, ...globalSecurity, ...labPageCache, ...hstsHeaders];
  },
  /** Menos bytes em redes lentas quando passarem a existir `next/image` ou assets otimizados. */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 24, 32, 48, 64, 96],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  /** Tree-shake por ícone — reduz JS inicial (útil em 3G/4G). */
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
    },
  },
};

export default withNextIntl(nextConfig);
