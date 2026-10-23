/**
 * Estrutura de restrições baseada em padrões internacionais (ex.: REACH, ANVISA).
 * Alinhado ao projeto de licenciamento global da ChemVault — valores ilustrativos para decisão interna.
 */
export const RESTRICTED_SUBSTANCES = [
  {
    name: "Fosfatos",
    limit: 0.05,
    unit: "%",
    msg: "Restrição ambiental em detergentes para exportação.",
  },
  { name: "Formol", limit: 0.1, unit: "%", msg: "Uso restrito devido ao potencial carcinogênico." },
  {
    name: "Nonilfenol",
    limit: 0,
    unit: "%",
    msg: "Proibido em diversas jurisdições por toxicidade aquática.",
  },
] as const;

export type RestrictedSubstance = (typeof RESTRICTED_SUBSTANCES)[number];

export interface Ingredient {
  name: string;
  /** Concentração em % (m/m ou m/v conforme contexto do dossiê). */
  concentration: number;
}

export type ComplianceViolation = {
  ingredient: string;
  limit: number;
  current: number;
  message: string;
};

export type ComplianceResult = {
  isCompliant: boolean;
  violations: ComplianceViolation[];
};

export function checkCompliance(ingredients: Ingredient[]): ComplianceResult {
  const violations: ComplianceViolation[] = [];

  for (const ingredient of ingredients) {
    const restriction = RESTRICTED_SUBSTANCES.find(
      (r) => r.name.toLowerCase() === ingredient.name.toLowerCase(),
    );

    if (restriction && ingredient.concentration > restriction.limit) {
      violations.push({
        ingredient: ingredient.name,
        limit: restriction.limit,
        current: ingredient.concentration,
        message: restriction.msg,
      });
    }
  }

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}
