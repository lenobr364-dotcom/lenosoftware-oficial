import type { CreateIndustrialFormulaBody } from "@/lib/validation/industrial-formula-schemas";

/** Solupan — base desengraxante alcalina (CHM-IND-001). Percentuais em massa. */
export const SOLUPAN_INDUSTRIAL_FORMULA: CreateIndustrialFormulaBody = {
  id_formula: "CHM-IND-001",
  nome_comercial: "Base Desengraxante Alcalina",
  aplicacao: "Limpeza de Chassi e Linha Pesada",
  ph_ideal: 13.5,
  margem_lucro_estimada_percentual: 350.0,
  instrucoes_seguranca: "Uso estrito de EPIs. Risco de queimadura química.",
  licenciada: true,
  ingredientes: [
    {
      nome_tecnico: "Água desmineralizada",
      concentracao_percentual: 75.0,
      custo_por_kg_dolar: 0.001,
      funcao_quimica: "Solvente",
    },
    {
      nome_tecnico: "Amido/fécula de mandioca",
      concentracao_percentual: 4.7,
      custo_por_kg_dolar: 0.45,
      funcao_quimica: "Espessante",
    },
    {
      nome_tecnico: "Hidróxido de sódio 50% (1ª dose)",
      concentracao_percentual: 1.0,
      custo_por_kg_dolar: 0.35,
      funcao_quimica: "Alcalinizante",
    },
    {
      nome_tecnico: "Ácido sulfônico linear (LABSA 96%)",
      concentracao_percentual: 1.0,
      custo_por_kg_dolar: 1.85,
      funcao_quimica: "Tensoativo",
    },
    {
      nome_tecnico: "Hidróxido de sódio 50% (2ª dose)",
      concentracao_percentual: 18.0,
      custo_por_kg_dolar: 0.35,
      funcao_quimica: "Alcalinizante",
    },
    {
      nome_tecnico: "Isotiazolinona (MIT/BIT)",
      concentracao_percentual: 0.15,
      custo_por_kg_dolar: 12.5,
      funcao_quimica: "Conservante",
    },
    {
      nome_tecnico: "Corante alimentício q.s.p.",
      concentracao_percentual: 0.05,
      custo_por_kg_dolar: 8.0,
      funcao_quimica: "Corante",
    },
  ],
};
