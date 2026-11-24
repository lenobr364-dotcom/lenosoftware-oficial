/**
 * Fichas públicas das formulações industriais do escopo ChemVault.
 * Nomes, segmento, diluição de uso já publicada e ativos principais.
 * Quantidades, ordem de preparo e proporções de fabricação ficam no cofre.
 */

export type CatalogSegment = "automotive" | "general" | "soap" | "industrial";

export type YieldMode = "diluted" | "ready" | "as-supplied" | "sealed";

export type PublicFormulation = {
  id: string;
  name: string;
  segment: CatalogSegment;
  actives: string[];
  /** pH do produto acabado somente quando já consta na ficha interna. */
  ph: string | null;
  /** Diluição de uso. Null quando ainda não foi publicada. */
  usage: string | null;
  /** Litros de água por litro de concentrado, na diluição de uso. */
  waterPerLiter: number | null;
  yieldMode: YieldMode;
};

export const PUBLIC_FORMULATIONS: readonly PublicFormulation[] = [
  {
    id: "sabao-oleo-reciclado",
    name: "Sabão em Barra com Óleo Reciclado",
    segment: "soap",
    actives: ["Óleo vegetal reciclado", "Soda cáustica", "Dolomita"],
    ph: null,
    usage: "Pronto após cura e corte. Sem diluição em água.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "solupan-alcalino",
    name: "Solupan Alcalino Forte",
    segment: "automotive",
    actives: ["Amido", "Soda cáustica", "Ácido sulfônico"],
    ph: null,
    usage: "5 L de concentrado para 200 L de água.",
    waterPerLiter: 40,
    yieldMode: "diluted",
  },
  {
    id: "intercap-fluoridrico",
    name: "Intercap (Decapante c/ Ácido Fluorídrico)",
    segment: "automotive",
    actives: ["Ácido fluorídrico", "Ácido sulfônico", "Ácido muriático"],
    ph: null,
    usage: null,
    waterPerLiter: null,
    yieldMode: "sealed",
  },
  {
    id: "intercap-fosforico",
    name: "Intercap (Decapante c/ Ácido Fosfórico)",
    segment: "automotive",
    actives: ["Ácido fosfórico", "Ácido sulfônico", "Ácido muriático"],
    ph: null,
    usage: "1 para 20 de água.",
    waterPerLiter: 20,
    yieldMode: "diluted",
  },
  {
    id: "nutrientes-carbonatos",
    name: "Módulo Nutrientes & Carbonatos (baixa periculosidade)",
    segment: "general",
    actives: ["Carbonato de cálcio", "Carbonato de magnésio", "Sulfato de magnésio"],
    ph: null,
    usage: null,
    waterPerLiter: null,
    yieldMode: "sealed",
  },
  {
    id: "xampu-veiculos",
    name: "Xampu para Veículos",
    segment: "automotive",
    actives: ["Ácido sulfônico", "Metassilicato de sódio", "Tripolifosfato"],
    ph: "8–9",
    usage: "1 para 30 litros de água.",
    waterPerLiter: 30,
    yieldMode: "diluted",
  },
  {
    id: "limpa-pneu",
    name: "Limpa Pneu (Pretinho)",
    segment: "automotive",
    actives: ["Glicerina", "Álcool"],
    ph: null,
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "sabao-alcool",
    name: "Sabão Transparente de Álcool",
    segment: "soap",
    actives: ["Sebo", "Soda cáustica", "Álcool"],
    ph: null,
    usage: "Pronto após resfriamento. Sem diluição em água.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "desinfetante-pinho",
    name: "Desinfetante Pinho Sol",
    segment: "general",
    actives: ["Óleo de pinho", "Ricinoleato de sódio", "Hipoclorito"],
    ph: null,
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "desinfetante-qualidade",
    name: "Desinfetante de Boa Qualidade",
    segment: "general",
    actives: ["Lauril", "Isotiazolinona"],
    ph: null,
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "amaciante-roupas",
    name: "Amaciante para Roupas",
    segment: "general",
    actives: ["Quaternário de amônio"],
    ph: null,
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "detergente-louca",
    name: "Detergente Neutro para Louça",
    segment: "general",
    actives: ["Ácido sulfônico", "Metassilicato", "Lauril"],
    ph: "7–8",
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "sabao-glicerinado",
    name: "Sabão em Barras Glicerinado",
    segment: "soap",
    actives: ["Glicerina"],
    ph: null,
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
  {
    id: "detergente-industrial-gold",
    name: "Detergente Industrial Gold",
    segment: "industrial",
    actives: ["Tensoativos aniônicos"],
    ph: null,
    usage: "Diluição de uso 1:40.",
    waterPerLiter: 40,
    yieldMode: "diluted",
  },
  {
    id: "amaciante-soft-luxo",
    name: "Amaciante Soft Luxo",
    segment: "general",
    actives: ["Quaternário de amônio"],
    ph: null,
    usage: "Pronto para uso.",
    waterPerLiter: null,
    yieldMode: "ready",
  },
] as const;

export const CATALOG_SEGMENTS: readonly CatalogSegment[] = ["automotive", "industrial", "general", "soap"];
