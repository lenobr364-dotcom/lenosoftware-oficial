import {
  approveLicense,
  decryptVaultPayload,
  issueLicense,
} from "@/lib/licensing-engine/api-client";
import { FORMULAS } from "@/lib/formulas";
import type { ScenarioId, ScenarioRunResult } from "@/lib/simulation-hub/types";

const DEFAULT_FORMULA = FORMULAS[0];

function dateRange(): { validFrom: string; validUntil: string } {
  const from = new Date();
  const until = new Date(from);
  until.setUTCFullYear(until.getUTCFullYear() + 1);
  return {
    validFrom: from.toISOString(),
    validUntil: until.toISOString(),
  };
}

export async function runScenarioIssueApprove(locale: string): Promise<ScenarioRunResult> {
  const formula = DEFAULT_FORMULA;
  if (!formula) {
    return { ok: false, scenario: "issue_approve", steps: [], error: "no_formula_catalog" };
  }

  const steps: string[] = [];
  const dates = dateRange();
  const clientSubject = `e2e-hub-${Date.now()}@chemvault.internal`;

  steps.push("POST /api/licensing/issue");
  const issued = await issueLicense({
    clientSubject,
    formulaCode: formula.code,
    validFrom: dates.validFrom,
    validUntil: dates.validUntil,
  });
  if (!issued.ok) {
    return { ok: false, scenario: "issue_approve", steps, error: issued.error };
  }

  steps.push("POST /api/licensing/approve");
  const approved = await approveLicense({ licenseId: issued.license.id });
  if (!approved.ok) {
    return {
      ok: false,
      scenario: "issue_approve",
      steps,
      error: approved.error,
      licenseId: issued.license.id,
      formulaId: formula.id,
    };
  }

  steps.push("ledger: license_issue + license_approved");
  return {
    ok: true,
    scenario: "issue_approve",
    steps,
    licenseId: issued.license.id,
    formulaId: formula.id,
  };
}

export async function runScenarioVaultUnlock(
  locale: string,
  ctx?: { licenseId?: string; formulaId?: string },
): Promise<ScenarioRunResult> {
  const formula = DEFAULT_FORMULA;
  if (!formula) {
    return { ok: false, scenario: "vault_unlock", steps: [], error: "no_formula_catalog" };
  }

  const steps: string[] = [];
  let licenseId = ctx?.licenseId;
  let formulaId = ctx?.formulaId ?? formula.id;

  if (!licenseId) {
    const bootstrap = await runScenarioIssueApprove(locale);
    if (!bootstrap.ok || !bootstrap.licenseId) {
      return { ok: false, scenario: "vault_unlock", steps: bootstrap.steps, error: bootstrap.error };
    }
    licenseId = bootstrap.licenseId;
    formulaId = bootstrap.formulaId ?? formula.id;
    steps.push(...bootstrap.steps.map((s) => `bootstrap:${s}`));
  }

  steps.push("POST /api/licensing/decrypt-payload");
  const decrypt = await decryptVaultPayload({ licenseId, formulaId, locale });
  if (!decrypt.ok || !decrypt.authorized) {
    return { ok: false, scenario: "vault_unlock", steps, error: decrypt.error, licenseId, formulaId };
  }

  steps.push("ledger: vault_decrypt (CRITICAL authorized)");
  return { ok: true, scenario: "vault_unlock", steps, licenseId, formulaId };
}

export async function runScenarioIntrusionDenied(locale: string): Promise<ScenarioRunResult> {
  const formula = DEFAULT_FORMULA;
  if (!formula) {
    return { ok: false, scenario: "intrusion_denied", steps: [], error: "no_formula_catalog" };
  }

  const steps: string[] = [];
  const dates = dateRange();

  steps.push("POST /api/licensing/issue (pending only)");
  const issued = await issueLicense({
    clientSubject: `e2e-intrusion-${Date.now()}@blocked.test`,
    formulaCode: formula.code,
    validFrom: dates.validFrom,
    validUntil: dates.validUntil,
  });
  if (!issued.ok) {
    return { ok: false, scenario: "intrusion_denied", steps, error: issued.error };
  }

  steps.push("POST /api/licensing/decrypt-payload (expect deny)");
  const decrypt = await decryptVaultPayload({
    licenseId: issued.license.id,
    formulaId: formula.id,
    locale,
  });

  if (decrypt.ok && decrypt.authorized) {
    return {
      ok: false,
      scenario: "intrusion_denied",
      steps,
      error: "expected_denied_but_authorized",
      licenseId: issued.license.id,
    };
  }

  steps.push("ledger: vault_decrypt (CRITICAL blocked)");
  return {
    ok: true,
    scenario: "intrusion_denied",
    steps,
    licenseId: issued.license.id,
    formulaId: formula.id,
  };
}

export async function runSimulationScenario(
  scenario: ScenarioId,
  locale: string,
  ctx?: { licenseId?: string; formulaId?: string },
): Promise<ScenarioRunResult> {
  if (scenario === "issue_approve") return runScenarioIssueApprove(locale);
  if (scenario === "vault_unlock") return runScenarioVaultUnlock(locale, ctx);
  return runScenarioIntrusionDenied(locale);
}
