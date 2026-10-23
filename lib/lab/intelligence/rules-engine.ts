/**
 * Motor de regras — avalia contexto operacional e emite decisões.
 */

import { INTELLIGENCE_RULE_CATALOG } from "@/lib/lab/intelligence/rules/catalog";
import type {
  IntelligenceRule,
  LabRuleContext,
  RuleCondition,
  RuleEvaluationResult,
} from "@/lib/lab/intelligence/types";

function readPath(ctx: LabRuleContext, path: string): unknown {
  return (ctx as Record<string, unknown>)[path];
}

function evaluateCondition(condition: RuleCondition, ctx: LabRuleContext): boolean {
  switch (condition.op) {
    case "eq":
      return readPath(ctx, condition.path) === condition.value;
    case "gt":
      return Number(readPath(ctx, condition.path)) > condition.value;
    case "gte":
      return Number(readPath(ctx, condition.path)) >= condition.value;
    case "lt":
      return Number(readPath(ctx, condition.path)) < condition.value;
    case "lte":
      return Number(readPath(ctx, condition.path)) <= condition.value;
    case "in":
      return condition.values.includes(readPath(ctx, condition.path));
    case "and":
      return condition.conditions.every((c) => evaluateCondition(c, ctx));
    case "or":
      return condition.conditions.some((c) => evaluateCondition(c, ctx));
    case "not":
      return !evaluateCondition(condition.condition, ctx);
    default:
      return false;
  }
}

export function listIntelligenceRules(): IntelligenceRule[] {
  return INTELLIGENCE_RULE_CATALOG;
}

export function evaluateIntelligenceRules(
  ctx: LabRuleContext,
  rules: IntelligenceRule[] = INTELLIGENCE_RULE_CATALOG,
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const matched = evaluateCondition(rule.condition, ctx);
    if (!matched) continue;

    results.push({
      ruleId: rule.id,
      matched: true,
      decision: rule.decision,
      severity: rule.severity,
      message: rule.description,
      action: rule.action,
      busTopic: rule.busTopic,
    });
  }

  return results;
}
