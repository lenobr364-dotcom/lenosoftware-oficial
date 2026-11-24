/**
 * Calculadoras do fluxo comercial de equipamentos —
 * custo por tonelada e hora-máquina.
 * Isoladas da calculadora química ChemVault (`lib/calculator.ts`).
 */

export type CostPerTonInput = {
  /** Custo total da operação no período (BRL) */
  totalCostBrl: number;
  /** Produção em toneladas métricas */
  tons: number;
};

export type CostPerTonResult = {
  costPerTonBrl: number | null;
  totalCostBrl: number;
  tons: number;
};

export function calculateCostPerTon(input: CostPerTonInput): CostPerTonResult {
  const totalCostBrl = Number(input.totalCostBrl);
  const tons = Number(input.tons);
  if (!Number.isFinite(totalCostBrl) || !Number.isFinite(tons) || tons <= 0) {
    return { costPerTonBrl: null, totalCostBrl, tons };
  }
  return {
    costPerTonBrl: Math.round((totalCostBrl / tons) * 100) / 100,
    totalCostBrl,
    tons,
  };
}

export type MachineHourInput = {
  /** Valor da locação / operação (BRL) */
  rentalCostBrl: number;
  /** Horas de máquina efetivas */
  machineHours: number;
  /** Custos adicionais (diesel, operador, frete) em BRL */
  extrasBrl?: number;
};

export type MachineHourResult = {
  costPerMachineHourBrl: number | null;
  rentalCostBrl: number;
  machineHours: number;
  extrasBrl: number;
  totalBrl: number;
};

export function calculateMachineHourCost(input: MachineHourInput): MachineHourResult {
  const rentalCostBrl = Number(input.rentalCostBrl);
  const machineHours = Number(input.machineHours);
  const extrasBrl = Number(input.extrasBrl ?? 0);
  const totalBrl =
    (Number.isFinite(rentalCostBrl) ? rentalCostBrl : 0) +
    (Number.isFinite(extrasBrl) ? extrasBrl : 0);

  if (!Number.isFinite(machineHours) || machineHours <= 0) {
    return {
      costPerMachineHourBrl: null,
      rentalCostBrl,
      machineHours,
      extrasBrl,
      totalBrl,
    };
  }

  return {
    costPerMachineHourBrl: Math.round((totalBrl / machineHours) * 100) / 100,
    rentalCostBrl,
    machineHours,
    extrasBrl,
    totalBrl,
  };
}

/** Litologias com fator de desgaste relativo à referência (1.0 = basalto médio). */
export const LITHOLOGY_WEAR_FACTORS = {
  arenito: 0.85,
  calcário: 0.95,
  basalto: 1.0,
  granito: 1.25,
  quartzito: 1.4,
} as const;

export type LithologyId = keyof typeof LITHOLOGY_WEAR_FACTORS;

export type DetailedProposalCostInput = {
  /** Hora-máquina seca (sem diesel/desgaste) BRL/h */
  dryMachineHourBrl: number;
  machineHours: number;
  /** Produção estimada (t) */
  tons: number;
  lithology: LithologyId;
  /** Custo base de desgaste por hora na litologia de referência (BRL/h) */
  wearBasePerHourBrl?: number;
  /** Consumo de diesel (L/h) */
  dieselLitersPerHour?: number;
  /** Preço do diesel (BRL/L) */
  dieselPricePerLiterBrl?: number;
  /** Mobilização (BRL) */
  mobilizationBrl?: number;
  /** Desmobilização (BRL) */
  demobilizationBrl?: number;
};

export type DetailedProposalCostResult = {
  dryMachineHourBrl: number;
  machineHours: number;
  tons: number;
  lithology: LithologyId;
  wearFactor: number;
  wearPerHourBrl: number;
  wearTotalBrl: number;
  dieselLitersPerHour: number;
  dieselPricePerLiterBrl: number;
  dieselTotalBrl: number;
  dryMachineTotalBrl: number;
  mobilizationBrl: number;
  demobilizationBrl: number;
  subtotalOperationBrl: number;
  totalBrl: number;
  costPerTonBrl: number | null;
  costPerMachineHourLoadedBrl: number | null;
};

export function calculateDetailedProposalCost(
  input: DetailedProposalCostInput,
): DetailedProposalCostResult {
  const dryMachineHourBrl = Number(input.dryMachineHourBrl) || 0;
  const machineHours = Number(input.machineHours) || 0;
  const tons = Number(input.tons) || 0;
  const lithology = input.lithology;
  const wearFactor = LITHOLOGY_WEAR_FACTORS[lithology] ?? 1;
  const wearBasePerHourBrl = Number(input.wearBasePerHourBrl ?? 45);
  const dieselLitersPerHour = Number(input.dieselLitersPerHour ?? 18);
  const dieselPricePerLiterBrl = Number(input.dieselPricePerLiterBrl ?? 6.2);
  const mobilizationBrl = Number(input.mobilizationBrl ?? 0);
  const demobilizationBrl = Number(input.demobilizationBrl ?? 0);

  const wearPerHourBrl = Math.round(wearBasePerHourBrl * wearFactor * 100) / 100;
  const wearTotalBrl = Math.round(wearPerHourBrl * Math.max(0, machineHours) * 100) / 100;
  const dieselTotalBrl =
    Math.round(dieselLitersPerHour * dieselPricePerLiterBrl * Math.max(0, machineHours) * 100) / 100;
  const dryMachineTotalBrl = Math.round(dryMachineHourBrl * Math.max(0, machineHours) * 100) / 100;
  const subtotalOperationBrl =
    Math.round((dryMachineTotalBrl + wearTotalBrl + dieselTotalBrl) * 100) / 100;
  const totalBrl =
    Math.round((subtotalOperationBrl + mobilizationBrl + demobilizationBrl) * 100) / 100;

  const costPerTon =
    tons > 0 ? Math.round((totalBrl / tons) * 100) / 100 : null;
  const costPerHourLoaded =
    machineHours > 0 ? Math.round((totalBrl / machineHours) * 100) / 100 : null;

  return {
    dryMachineHourBrl,
    machineHours,
    tons,
    lithology,
    wearFactor,
    wearPerHourBrl,
    wearTotalBrl,
    dieselLitersPerHour,
    dieselPricePerLiterBrl,
    dieselTotalBrl,
    dryMachineTotalBrl,
    mobilizationBrl,
    demobilizationBrl,
    subtotalOperationBrl,
    totalBrl,
    costPerTonBrl: costPerTon,
    costPerMachineHourLoadedBrl: costPerHourLoaded,
  };
}
