import { minimatch } from 'minimatch';

export interface Rule {
  patterns: string[];
  labels?: string[];
  template?: string;
}

export interface MatchResult {
  matchedRules: Rule[];
  requiredLabels: string[];
  requiredTemplate: string | null;
}

/**
 * Matches changed file paths against configured rules.
 * Returns aggregated labels and the first matched template.
 */
export function matchRules(changedFiles: string[], rules: Rule[]): MatchResult {
  const matchedRules: Rule[] = [];
  const labelSet = new Set<string>();
  let requiredTemplate: string | null = null;

  for (const rule of rules) {
    const isMatch = rule.patterns.some((pattern) =>
      changedFiles.some((file) => minimatch(file, pattern, { dot: true }))
    );

    if (isMatch) {
      matchedRules.push(rule);

      if (rule.labels) {
        rule.labels.forEach((label) => labelSet.add(label));
      }

      if (rule.template && requiredTemplate === null) {
        requiredTemplate = rule.template;
      }
    }
  }

  return {
    matchedRules,
    requiredLabels: Array.from(labelSet),
    requiredTemplate,
  };
}

/**
 * Returns true if the PR description satisfies the template requirement.
 * A template is satisfied when all non-comment, non-empty lines appear in the description.
 */
export function descriptionMatchesTemplate(
  description: string,
  template: string
): boolean {
  const requiredLines = template
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('<!--'));

  return requiredLines.every((line) => description.includes(line));
}
