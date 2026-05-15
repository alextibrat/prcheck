import { matchRules } from './matcher';
import { anyFileMatchesAnyPattern } from './path-filter';
import { loadConfig } from './config';

export interface Rule {
  name: string;
  paths: string[];
  labels?: string[];
  template?: string;
  description?: string;
}

export interface RuleMatch {
  rule: Rule;
  matchedFiles: string[];
}

export interface RuleEngineResult {
  matchedRules: RuleMatch[];
  requiredLabels: string[];
  requiredTemplates: string[];
}

/**
 * Evaluates all configured rules against the list of changed files.
 * Returns matched rules, aggregated required labels and templates.
 */
export function evaluateRules(
  rules: Rule[],
  changedFiles: string[]
): RuleEngineResult {
  const matchedRules: RuleMatch[] = [];
  const labelSet = new Set<string>();
  const templateSet = new Set<string>();

  for (const rule of rules) {
    const matched = filterMatchedFiles(rule.paths, changedFiles);
    if (matched.length > 0) {
      matchedRules.push({ rule, matchedFiles: matched });
      (rule.labels ?? []).forEach((l) => labelSet.add(l));
      if (rule.template) templateSet.add(rule.template);
    }
  }

  return {
    matchedRules,
    requiredLabels: Array.from(labelSet),
    requiredTemplates: Array.from(templateSet),
  };
}

function filterMatchedFiles(patterns: string[], files: string[]): string[] {
  return files.filter((file) => anyFileMatchesAnyPattern([file], patterns));
}

/**
 * Loads config and evaluates rules in one step.
 */
export async function evaluateRulesFromConfig(
  changedFiles: string[],
  configPath?: string
): Promise<RuleEngineResult> {
  const config = await loadConfig(configPath);
  const rules: Rule[] = (config as any).rules ?? [];
  return evaluateRules(rules, changedFiles);
}
