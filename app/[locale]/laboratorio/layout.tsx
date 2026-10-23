import type { ReactNode } from "react";

/**
 * Layout do ecossistema /[locale]/laboratorio.
 *
 * Não exporta metadata estático de propósito — a page.tsx do laboratório já
 * declara `generateMetadata` i18n-aware (5 locales). Adicionar metadata aqui
 * com strings fixas em EN regrediria o SEO multilíngue.
 */
export default function LaboratorioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full animate-fade-in overflow-x-hidden bg-[#0a0f0d] antialiased">
      <div
        className="h-1 w-full bg-gradient-to-r from-[#10b981]/20 via-[#10b981] to-[#14291f]/20"
        aria-hidden
      />
      {children}
    </div>
  );
}
