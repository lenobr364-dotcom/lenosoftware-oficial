export type ScenarioId = "issue_approve" | "vault_unlock" | "intrusion_denied";

export type ScenarioRunResult = {
  ok: boolean;
  scenario: ScenarioId;
  steps: string[];
  error?: string;
  licenseId?: string;
  formulaId?: string;
};
