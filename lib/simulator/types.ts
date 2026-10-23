import type { ComplianceResult } from "@/lib/chemistry/compliance";
import type { SimulationResult } from "@/lib/gemini-lab-thermal";

export type SimulatorLogLevel = "info" | "warn" | "success" | "error";

export type SimulatorPhase =
  | "init"
  | "parse"
  | "thermal"
  | "rheology"
  | "stability"
  | "substance"
  | "regional"
  | "license"
  | "complete";

export type SimulatorLogEntry = {
  id: string;
  at: string;
  level: SimulatorLogLevel;
  phase: SimulatorPhase;
  messageKey: string;
  messageParams?: Record<string, string | number>;
};

export type StabilityStatus = "stable" | "caution" | "critical";

export type RegionalComplianceVerdict = "approved" | "conditional" | "blocked";

export type RegionalComplianceReport = {
  regionCode: string;
  countryLabelKey: string;
  coordinates: { lat: number; lng: number } | null;
  verdict: RegionalComplianceVerdict;
  frameworkKeys: string[];
  notesKey: string;
};

export type LicenseComplianceReport = {
  licenseStatus: string;
  passed: boolean;
  verdictKey: string;
};

export type FormulaSimulatorReport = {
  formulaId: string;
  formulaName: string;
  formulaCode: string;
  stabilityIndex: number;
  stabilityStatus: StabilityStatus;
  thermal: SimulationResult;
  compliance: ComplianceResult;
  regional: RegionalComplianceReport;
  license: LicenseComplianceReport;
  logs: SimulatorLogEntry[];
  overallPassed: boolean;
};

export type RunSimulatorInput = {
  formulaId: string;
  locale?: string;
  coordinates?: { lat: number; lng: number } | null;
  regionCode?: string | null;
  actorSubject: string;
};
