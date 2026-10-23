import { PrismaClient } from "@prisma/client";

import { encryptFormulaCreateData } from "../lib/formula-field-crypto";
import { buildFormulaInstrucoes } from "../lib/formula-instrucoes-blocks";
import { upsertIndustrialFormula } from "../lib/industrial-formula-persistence";
import { SOLUPAN_INDUSTRIAL_FORMULA } from "../lib/industrial-formula-seed-data";
import {
  categorySeedToProductLine,
  categoryToCategoria,
  licenciadaForTitle,
  type ProductLine,
} from "../lib/product-line";

const prisma = new PrismaClient();

type SeedRow = {
  title: string;
  category: string;
  materials: string;
  preparation: string;
  dilution: string;
  technicalDossier?: string;
  hardwareIntegrationProfile?: string;
  licensingTags?: string;
};

const formulasData: SeedRow[] = [
  {
    title: "Sabão em Barra com Óleo Reciclado",
    category: "Sabão em Barra",
    materials:
      "26L óleo reciclado, 4.6kg soda escama 99%, 10L água, 10kg dolomita, 100ml corante, 140ml essência.",
    preparation:
      "Aquecer óleo a 50°C. Misturar água e soda à parte e deixar baixar para 50°C. Juntar tudo com motor ligado em jato contínuo. Bater 5-10 min, adicionar dolomita e bater até ficar cremoso (20-30 min).",
    dilution: "Pronto para uso após corte e secagem.",
  },
  {
    title: "Solupan Alcalino Forte",
    category: "Linha Automotiva",
    materials:
      "80L água, 5kg amido/fécula, 1kg soda a 50% (1ª parte), 1L ácido sulfônico, 19kg soda a 50% (2ª parte), 100ml isotialozinona, corante q.s.p.",
    preparation:
      "Água no recipiente. Adicionar amido lentamente. Adicionar 1ª soda e homogeneizar. Colocar ácido sulfônico e homogeneizar. Adicionar 2ª soda lentamente. Adicionar conservante e corante.",
    dilution: "5 litros para 200 litros de água.",
    technicalDossier:
      "Linha de alta margem para lavagem pesada e pré-lavagem industrial. Dossiê internacional: classificar SDS por país de destino, limites de pH em efluentes e compatibilidade com metais ferrosos e ligas leves.",
    hardwareIntegrationProfile:
      '{"ecoBocal":{"compatible":true,"notes":"Telemetria de dosagem por bico Eco-Bocal — mapas de vazão por pressão e registro de lotes para auditoria de licenciamento."}}',
    licensingTags: "HIGH_YIELD_INDUSTRIAL,ECO_BOCAL",
  },
  {
    title: "Intercap (Decapante c/ Ácido Fluorídrico)",
    category: "Linha Automotiva",
    materials:
      "41.5L água, 2L ácido sulfônico, 2L ácido fluorídrico, 4L ácido muriático, 500g sal, corante amarelo metanil q.s.p.",
    preparation:
      "Misturar água, ácido sulfônico e ácido fluorídrico. Depois adicionar ácido muriático, sal e corante.",
    dilution: "Não especificado (uso concentrado ou diluição padrão).",
    technicalDossier:
      "Produto de alto valor agregado para tratamento de superfícies; exige rotulagem de perigo, EPI e transporte ADR conforme jurisdição. Licenciamento internacional: anexar matriz de substâncias restritas (REACH, TSCA, Anvisa).",
    hardwareIntegrationProfile:
      '{"ecoBocal":{"compatible":false,"notes":"Somente áreas ventiladas com sensores de HF; integração limitada a registro de lote sem dosagem automática em linha aberta."}}',
    licensingTags: "HIGH_YIELD_INDUSTRIAL,CONTROLLED_ACID",
  },
  {
    title: "Intercap (Decapante c/ Ácido Fosfórico)",
    category: "Linha Automotiva",
    materials:
      "32.5L água, 5L ácido muriático, 5L ácido fosfórico 85%, 7.5L ácido sulfônico, corante amarelo metanil q.s.p.",
    preparation:
      "Água no recipiente. Adicionar ácido sulfônico, depois muriático, depois fosfórico (sempre mexendo). Adicionar corante diluído.",
    dilution: "1 para 20 de água, ou 5 litros para 100 litros de água.",
    technicalDossier:
      "Alternativa com perfil de manuseio mais previsível que HF; adequada a cadeias de licenciamento com exigência de fichas de emergência harmonizadas (GHS).",
    hardwareIntegrationProfile:
      '{"ecoBocal":{"compatible":true,"notes":"Dosagem monitorada em circuito fechado; Eco-Bocal pode registrar curvas de neutralização pós-uso."}}',
    licensingTags: "HIGH_YIELD_INDUSTRIAL,ECO_BOCAL",
  },
  {
    title: "ARLA 32 (Solução aquosa de ureia 32,5%)",
    category: "Linha Automotiva",
    materials:
      "Água desmineralizada, ureia automotiva grau A (conformidade ISO 22241 / DIN 70070), estabilizantes aprovados para SCR.",
    preparation:
      "Dissolução controlada de ureia com monitorização de condutividade e temperatura; filtração e análise de alcalinidade residual antes do envase.",
    dilution: "Produto pronto — não diluir fora das especificações do fabricante do sistema SCR.",
    technicalDossier:
      "Foco em conformidade ambiental internacional para motores diesel com SCR: rastreabilidade de lote, pureza de ureia e limites de metais e biureto. Adequado a dossiers de exportação UE, Mercosul e mercados MENA.",
    hardwareIntegrationProfile:
      '{"ecoBocal":{"compatible":true,"notes":"Integração com sensores de nível e temperatura em tanques de armazenagem; alertas de cristalização."},"telemetry":{"iso22241":true}}',
    licensingTags: "ARLA32_ENV,INTERNATIONAL_COMPLIANCE",
  },
  {
    title: "Módulo Nutrientes & Carbonatos (baixa periculosidade)",
    category: "Limpeza Geral",
    materials:
      "Carbonato de cálcio precipitado (fino), carbonato de magnésio leve, sulfato de magnésio heptahidratado, zeólita suave como suporte, água para pasta úmida opcional.",
    preparation:
      "Mistura seca homogênea em misturador de baixa velocidade; embalagem em sacos anti-umidade. Opcional: granulação com ligante alimentar para aplicações agrícolas controladas.",
    dilution: "Aplicação como condicionador de solo ou correção de pH conforme laudo agronômico — não usar como formulado doméstico sem reclassificação.",
    technicalDossier:
      "Resíduos e subprodutos de baixa periculosidade quando segregados de fluxos ácidos ou orgânicos halogenados. Pacote de licenciamento: ficha de destinação agrícola/industrial, limites de metais pesados e traçabilidade de origem.",
    hardwareIntegrationProfile:
      '{"ecoBocal":{"compatible":true,"notes":"Dosagem gravimétrica e registro de umidade de armazenagem; integração com balanças de campo."}}',
    licensingTags: "LOW_HAZARD_RESIDUALS,NUTRIENT_CARBONATE_MODULE",
  },
  {
    title: "Xampu para Veículos",
    category: "Linha Automotiva",
    materials:
      "Ácido sulfônico, metassilicato de sódio, tripolifosfato, amida, lauril, isotiasolinona, corante, essência.",
    preparation:
      "Água, metassilicato e tripolifosfato até dissolver. Adicionar sulfônico, amida, lauril, conservante, corante e essência. Regular pH entre 8 e 9 com soda líquida.",
    dilution: "1 para 30 litros de água.",
  },
  {
    title: "Limpa Pneu (Pretinho)",
    category: "Linha Automotiva",
    materials: "6.5L água comum, 2L glicerina, 1.5L álcool comum, 30ml corante, 50ml essência.",
    preparation:
      "Água no reator. Glicerina em jato contínuo. Álcool em jato contínuo. Corante diluído e essência.",
    dilution: "Pronto para uso.",
  },
  {
    title: "Sabão Transparente de Álcool",
    category: "Sabão em Barra",
    materials: "Sebo, soda 99%, álcool de posto (sem aditivo), corante, essência.",
    preparation:
      "Derreter gorduras a 60°C. Misturar água e soda (baixar para 60°C). Juntar em jato contínuo. Bater até ficar firme. Álcool em jato contínuo (bater 2 min).",
    dilution: "Pronto para uso após esfriar.",
  },
  {
    title: "Desinfetante Pinho Sol",
    category: "Limpeza Geral",
    materials:
      "17.2L água, 1.6L ricinoleato de sódio, 700ml óleo de pinho 65%, 500ml hipoclorito 12%, corante amarelo metanil.",
    preparation:
      "Misturar ricinoleato e óleo de pinho até formar gel. Colocar na água. Adicionar hipoclorito até sumir opalescência. Colocar corante.",
    dilution: "Pronto para uso (base de 20L).",
  },
  {
    title: "Desinfetante de Boa Qualidade",
    category: "Limpeza Geral",
    materials: "Água, lauril, isotiazolinona, essência, corante.",
    preparation: "Dissolver isotiazolinona no lauril, misturar na água. Adicionar essência e corante.",
    dilution: "Pronto para uso.",
  },
  {
    title: "Amaciante para Roupas",
    category: "Limpeza Geral",
    materials: "97.5L água, 1kg base líquida (quaternário de amônio), 100ml corante, 400ml essência.",
    preparation:
      "Metade da água. Adicionar base e dissolver bem. Restante da água homogeneizando. Corante e essência.",
    dilution: "Pronto para uso (base 100L).",
  },
  {
    title: "Detergente Neutro para Louça",
    category: "Limpeza Geral",
    materials:
      "44L água, 500g metassilicato, 3kg ácido sulfônico, 500ml brasamida, 600ml soda líquida, 1L lauril, isotiazolinona, corante, essência.",
    preparation:
      "Água. Metassilicato (dissolver). Sulfônico (dissolver). Brasamida. Soda aos poucos até pH 7-8. Lauril, conservante, corante e essência.",
    dilution: "Pronto para uso.",
  },
];

/** Catálogo extra (demos executivas) — inserido junto ao seed principal. */
const catalogExtras: {
  nome: string;
  categoria: string;
  descricao: string;
  ativo_principal: string;
  instrucoes: string;
  licenciada: boolean;
}[] = [
  {
    nome: "Sabão em Barras Glicerinado",
    categoria: "Limpeza",
    descricao: "Fórmula premium com alto poder de limpeza e acabamento translúcido.",
    ativo_principal: "Glicerina Bi-destilada",
    instrucoes: "Misturar fase A a 80°C…",
    licenciada: true,
  },
  {
    nome: "Detergente Industrial Gold",
    categoria: "Industrial",
    descricao: "Desengraxante de alta performance para superfícies metálicas.",
    ativo_principal: "Tensoativos Aniônicos",
    instrucoes: "Diluição recomendada 1:40…",
    licenciada: true,
  },
  {
    nome: "Amaciante Soft Luxo",
    categoria: "Limpeza",
    descricao: "Fragrância prolongada com tecnologia de microcápsulas.",
    ativo_principal: "Quaternário de Amônio",
    instrucoes: "Adicionar essência na fase fria…",
    licenciada: true,
  },
];

function chemicalEquivalenceFor(line: ProductLine, title: string): string {
  const head =
    line === "AUTOMOTIVE"
      ? "Europa: tensoativos sulfonados lineares C12–C14 (INCI); LATAM: LABSA 96% com curva alcalina equivalente. Conservantes MIT/BIT (EU) vs. blends CMIT/MIT aprovados localmente."
      : line === "BAR_SOAP"
        ? "Europa: soda cáustica escamas com limite de metais (REACH); LATAM: soda comercial 99% escamas — ajustar água livre e índice de saponificação. Álcool anidro (EU) vs. álcool hidratado de cereal (LATAM)."
        : "Europa: hipoclorito estabilizado 15% ou DCCNa; LATAM: hipoclorito 12% industrial — revalidar viscosidade com ricinoleato e lauril conforme dureza da água.";

  return `${head} · Ficha: ${title}`;
}

async function main() {
  await prisma.formula.deleteMany();
  await prisma.industrialFormula.deleteMany();

  const mainRows = formulasData.map((row) => {
    const line = categorySeedToProductLine(row.category);
    const instrucoes = buildFormulaInstrucoes({
      RAW: row.materials,
      PREP: row.preparation,
      DIL: row.dilution,
      EQUIV: chemicalEquivalenceFor(line, row.title),
      DOSSIER: row.technicalDossier ?? "",
      HW: row.hardwareIntegrationProfile ?? "",
      TAGS: row.licensingTags ?? "",
    });
    const headMaterial = row.materials.split(",")[0]?.trim() ?? row.title;
    return {
      nome: row.title,
      categoria: categoryToCategoria(row.category),
      descricao: row.dilution,
      ativo_principal: headMaterial.slice(0, 160),
      instrucoes,
      licenciada: licenciadaForTitle(row.title),
    };
  });

  const encrypted = [...mainRows, ...catalogExtras].map((row) => encryptFormulaCreateData(row));

  await prisma.formula.createMany({
    data: encrypted,
  });

  await upsertIndustrialFormula(SOLUPAN_INDUSTRIAL_FORMULA);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
