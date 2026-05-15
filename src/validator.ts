import { matchRules } from './matcher';
import { evaluateRules } from './rule-engine';
import { createReport } from './reporter';
import { loadConfig } from './config';
import { loadTemplate, validateAgainstTemplate } from './template';

export interface ValidationContext {
  prTitle: string;
  prBody: string;
  changedFiles: string[];
  labels: string[];
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  matchedRules: string[];
}

export async function validatePR(
  context: ValidationContext,
  configPath: string
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const matchedRules: string[] = [];

  const config = await loadConfig(configPath);
  const { matched } = evaluateRules(config.rules ?? [], context.changedFiles);

  for (const rule of matched) {
    matchedRules.push(rule.name);

    if (rule.template) {
      const template = await loadTemplate(rule.template);
      const valid = validateAgainstTemplate(context.prBody, template);
      if (!valid) {
        errors.push(`PR description does not satisfy template for rule "${rule.name}".`);
      }
    }

    if (rule.labels && rule.labels.length > 0) {
      const missing = rule.labels.filter((l: string) => !context.labels.includes(l));
      if (missing.length > 0) {
        warnings.push(`Missing expected labels for rule "${rule.name}": ${missing.join(', ')}.`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    matchedRules,
  };
}
