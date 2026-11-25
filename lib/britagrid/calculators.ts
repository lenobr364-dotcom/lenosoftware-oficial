/**
 * Calculadoras BritaGrid — custo por tonelada e hora-máquina.
 * Isoladas do módulo ChemVault; não alterar a calculadora química.
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
