/**
 * Dados de entrada para processamento em lote (NEXUS Global).
 */

export interface FormulaData {
  id: string;
  substance: string;
  /** Densidade / viscosidade equivalente (g/cm³) para o motor térmico. */
  viscosity_g_cm3: number;
  /** Ponto de fulgor crítico (°C). */
  criticalFlashPointC: number;
  /** Temperatura ambiente da proveta (°C); default 25. */
  ambientTempC?: number;
  /** Valor de licenciamento se aprovada (R$); default 5000. */
  licenseFeeBRL?: number;
  /** Componentes moleculares para scan de pureza. */
  components?: string[];
}
