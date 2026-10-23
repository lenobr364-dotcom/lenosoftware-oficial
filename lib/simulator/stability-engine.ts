import { checkCompliance } from "@/lib/chemistry/compliance";
import { ChemicalSimulator } from "@/lib/gemini-lab-thermal";
import { FORMULAS } from "@/lib/formulas";
import { deriveFormulaParams } from "@/lib/simulator/formula-params";
import { evaluateRegionalCompliance, resolveRegionFromGeo } from "@/lib/simulator/regional-compliance";
import type {
  FormulaSimulatorReport,
  RunSimulatorInput,
  SimulatorLogEntry,
  StabilityStatus,
} from "@/lib/simulator/types";

function log(
  phase: SimulatorLogEntry["phase"],
  level: SimulatorLogEntry["level"],
  messageKey: string,
  messageParams?: Record<string, string | number>,
): SimulatorLogEntry {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    level,
    phase,
    messageKey,
    messageParams,
  };
}

function stabilityFromThermal(
  safetyIndexStr: string,
  thermalStatus: string,
): { index: number; status: StabilityStatus } {
  const idx = parseFloat(safetyIndexStr.replace("%", "")) || 0;
  if (thermalStatus === "RISCO_DE_FULGOR" || idx < 35) {
    return { index: Math.round(idx), status: "critical" };
  }
  if (thermalStatus === "ALERTA_CRÍTICO" || idx < 65) {
    return { index: Math.round(idx), status: "caution" };
  }
  return { index: Math.round(Math.min(idx, 100)), status: "stable" };
}

function evaluateLicense(license: string): FormulaSimulatorReport["license"] {
  switch (license) {
    case "active":
      return { licenseStatus: license, passed: true, verdictKey: "licenseActive" };
    case "renewal":
      return { licenseStatus: license, passed: true, verdictKey: "licenseRenewal" };
    case "pending":
      return { licenseStatus: license, passed: false, verdictKey: "licensePending" };
    default:
      return { licenseStatus: license, passed: false, verdictKey: "licenseUnknown" };
  }
}

export function runFormulaSimulation(input: RunSimulatorInput): FormulaSimulatorReport {
  const logs: SimulatorLogEntry[] = [];
  const formula = FORMULAS.find((f) => f.id === input.formulaId);
  if (!formula) {
    logs.push(log("init", "error", "logFormulaNotFound", { formulaId: input.formulaId }));
    throw new Error("formula_not_found");
  }

  logs.push(log("init", "info", "logInit", { formula: formula.name }));
  logs.push(log("parse", "info", "logParseStart"));

  const params = deriveFormulaParams(formula);
  logs.push(log("parse", "success", "logParseDone", { count: params.ingredients.length }));

  logs.push(log("thermal", "info", "logThermalStart"));
  const thermal = ChemicalSimulator.executeThermalAnalysis({
    formulaName: formula.name,
    density: params.density,
    currentTempCelsius: params.currentTempCelsius,
    flashPointCelsius: params.flashPointCelsius,
  });
  const thermalLevel =
    thermal.status === "ESTÁVEL" ? "success" : thermal.status === "ALERTA_CRÍTICO" ? "warn" : "error";
  logs.push(
    log("thermal", thermalLevel, "logThermalDone", {
      margin: thermal.thermalMarginCelsius,
      index: thermal.safetyIndex,
    }),
  );

  logs.push(log("rheology", "info", "logRheology"));
  const phMid = (params.targetPhMin + params.targetPhMax) / 2;
  logs.push(
    log("rheology", "success", "logRheologyDone", {
      phMin: params.targetPhMin,
      phMax: params.targetPhMax,
      ph: phMid.toFixed(1),
    }),
  );

  logs.push(log("stability", "info", "logStabilityMatrix"));
  let { index: stabilityIndex, status: stabilityStatus } = stabilityFromThermal(
    thermal.safetyIndex,
    thermal.status,
  );

  logs.push(log("substance", "info", "logSubstanceScan"));
  const compliance = checkCompliance(params.ingredients);
  if (!compliance.isCompliant) {
    stabilityStatus = stabilityStatus === "stable" ? "caution" : stabilityStatus;
    stabilityIndex = Math.min(stabilityIndex, 55);
    logs.push(log("substance", "warn", "logSubstanceViolation", { count: compliance.violations.length }));
  } else {
    logs.push(log("substance", "success", "logSubstanceOk"));
  }

  const region = resolveRegionFromGeo({
    lat: input.coordinates?.lat,
    lng: input.coordinates?.lng,
    regionCode: input.regionCode,
  });
  logs.push(
    log("regional", "info", "logRegionalStart", {
      region: region.regionCode,
    }),
  );
  const regionalEval = evaluateRegionalCompliance(region, formula.composition.toLowerCase());
  const regional = {
    regionCode: region.regionCode,
    countryLabelKey: region.countryLabelKey,
    coordinates:
      input.coordinates?.lat != null && input.coordinates?.lng != null
        ? { lat: input.coordinates.lat, lng: input.coordinates.lng }
        : null,
    verdict: regionalEval.verdict,
    frameworkKeys: regionalEval.frameworkKeys,
    notesKey: regionalEval.notesKey,
  };
  const regionalLevel =
    regional.verdict === "approved" ? "success" : regional.verdict === "conditional" ? "warn" : "error";
  logs.push(log("regional", regionalLevel, "logRegionalDone", { verdict: regional.verdict }));

  logs.push(log("license", "info", "logLicenseCheck"));
  const license = evaluateLicense(formula.license);
  logs.push(
    log("license", license.passed ? "success" : "error", "logLicenseDone", {
      status: formula.license,
    }),
  );

  if (!license.passed) {
    stabilityStatus = "critical";
    stabilityIndex = Math.min(stabilityIndex, 40);
  }
  if (regional.verdict === "blocked") {
    stabilityStatus = "critical";
    stabilityIndex = Math.min(stabilityIndex, 30);
  }

  const overallPassed =
    license.passed && compliance.isCompliant && regional.verdict !== "blocked" && stabilityStatus !== "critical";

  logs.push(
    log("complete", overallPassed ? "success" : "warn", "logComplete", {
      index: stabilityIndex,
    }),
  );

  return {
    formulaId: formula.id,
    formulaName: formula.name,
    formulaCode: formula.code,
    stabilityIndex,
    stabilityStatus,
    thermal,
    compliance,
    regional,
    license,
    logs,
    overallPassed,
  };
}
