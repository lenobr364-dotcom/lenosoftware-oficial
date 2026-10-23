/**
 * Textos legais do motor de licenciamento internacional (PT / EN / ES).
 * Versão documental — revisão jurídica recomendada antes de produção.
 */
export const INTERNATIONAL_TERMS_VERSION = "2026-05-intl-v1";

export type IntlLegalLang = "pt" | "en" | "es";

export type IntlTermsBlock = {
  title: string;
  ipLine: string;
  sections: { heading: string; body: string }[];
};

const PT: IntlTermsBlock = {
  title: "Contrato-cadre de licenciamento internacional",
  ipLine:
    "Leno César é o titular da propriedade intelectual e do know-how técnico das formulações de alto valor agregado licenciadas através do ChemVault Global (incluindo famílias Solupan e ARLA 32), salvo acordo escrito em contrário.",
  sections: [
    {
      heading: "1. Objeto",
      body: "O presente instrumento rege o acesso a informações confidenciais sobre formulações químicas industriais destinadas a licenciamento transfronteiriço, incluindo dossiers técnicos resumidos e parâmetros comerciais não vinculativos.",
    },
    {
      heading: "2. Confidencialidade",
      body: "O licenciado compromete-se a não reproduzir, divulgar ou sublicenciar composições, métodos de preparação ou equivalências químicas sem instrumento assinado por canal seguro. Violações podem implicar rescisão imediata e medidas cautelares.",
    },
    {
      heading: "3. Conformidade e ambiente",
      body: "O uso de formulações com perfil ambiental (ex.: ARLA 32 / SCR) deve observar normas locais de transporte, armazenagem e descarte, bem como fichas de segurança vigentes em cada jurisdição.",
    },
    {
      heading: "4. Hardware e telemetria",
      body: "Quando aplicável, integrações Eco-Bocal e Omega Sentinel tratam-se de camadas operacionais opcionais, sujeitas a contratos técnicos separados e à legislação de proteção de dados aplicável.",
    },
    {
      heading: "5. Lei aplicável",
      body: "Para fins de MVP digital, litígios serão apresentados preferencialmente a arbitragem amigável; a lei material pode ser ajustada por anexo territorial por licença.",
    },
  ],
};

const EN: IntlTermsBlock = {
  title: "International licensing framework agreement",
  ipLine:
    "Leno César holds the intellectual property and technical know-how for the high-value formulations licensed through ChemVault Global (including Solupan and ARLA 32 families), unless expressly agreed otherwise in writing.",
  sections: [
    {
      heading: "1. Purpose",
      body: "This framework governs access to confidential information on industrial chemical formulations for cross-border licensing, including summarized technical dossiers and non-binding commercial parameters.",
    },
    {
      heading: "2. Confidentiality",
      body: "The licensee undertakes not to reproduce, disclose, or sublicense compositions, preparation methods, or chemical equivalences without a countersigned instrument through secure channels. Breaches may trigger immediate termination and injunctive relief.",
    },
    {
      heading: "3. Compliance & environment",
      body: "Use of formulations with environmental profiles (e.g., ARLA 32 / SCR) must follow local rules for transport, storage, and disposal, as well as jurisdiction-specific safety data sheets.",
    },
    {
      heading: "4. Hardware & telemetry",
      body: "Where applicable, Eco-Bocal and Omega Sentinel integrations are optional operational layers, subject to separate technical agreements and applicable data-protection law.",
    },
    {
      heading: "5. Governing approach",
      body: "For this digital MVP, disputes should first be escalated to good-faith negotiation; governing law may be refined per-territory in executed license schedules.",
    },
  ],
};

const ES: IntlTermsBlock = {
  title: "Marco contractual de licencia internacional",
  ipLine:
    "Leno César es titular de la propiedad intelectual y del know-how técnico de las formulaciones de alto valor licenciadas a través de ChemVault Global (incluidas las familias Solupan y ARLA 32), salvo pacto escrito distinto.",
  sections: [
    {
      heading: "1. Objeto",
      body: "Este instrumento regula el acceso a información confidencial sobre formulaciones químicas industriales destinadas a licenciamiento transfronterizo, incluidos dossiers técnicos resumidos y parámetros comerciales no vinculantes.",
    },
    {
      heading: "2. Confidencialidad",
      body: "El licenciatario se compromete a no reproducir, divulgar ni sublicenciar composiciones, métodos de preparación o equivalencias químicas sin instrumento firmado por canal seguro. El incumplimiento puede implicar resolución inmediata y medidas cautelares.",
    },
    {
      heading: "3. Cumplimiento y medio ambiente",
      body: "El uso de formulaciones con perfil ambiental (p. ej., ARLA 32 / SCR) debe observar la normativa local de transporte, almacenamiento y eliminación, así como las fichas de seguridad vigentes en cada jurisdicción.",
    },
    {
      heading: "4. Hardware y telemetría",
      body: "Cuando corresponda, las integraciones Eco-Bocal y Omega Sentinel son capas operativas opcionales, sujetas a contratos técnicos separados y a la legislación de protección de datos aplicable.",
    },
    {
      heading: "5. Ley aplicable",
      body: "Para este MVP digital, las controversias deberán plantearse primero en negociación de buena fe; la ley sustantiva podrá ajustarse por anexo territorial en cada licencia ejecutada.",
    },
  ],
};

export function getInternationalTermsBlock(lang: IntlLegalLang): IntlTermsBlock {
  switch (lang) {
    case "pt":
      return PT;
    case "es":
      return ES;
    default:
      return EN;
  }
}

export function defaultLegalLangFromUiLocale(uiLocale: string): IntlLegalLang {
  if (uiLocale === "pt") return "pt";
  if (uiLocale === "es") return "es";
  return "en";
}
