import * as core from '@actions/core';
import { MatchResult } from './matcher';
import { PRContext } from './github';

export interface CheckOutcome {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that the PR satisfies label and template requirements
 * derived from the match result.
 */
export function runChecks(
  context: PRContext,
  matchResult: MatchResult,
  descriptionSatisfied: boolean
): CheckOutcome {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required labels
  const missingLabels = matchResult.requiredLabels.filter(
    (label) => !context.existingLabels.includes(label)
  );

  if (missingLabels.length > 0) {
    warnings.push(
      `Missing labels that will be auto-applied: ${missingLabels.join(', ')}`
    );
  }

  // Check template compliance
  if (matchResult.requiredTemplate !== null && !descriptionSatisfied) {
    errors.push(
      'PR description does not satisfy the required template sections. ' +
        'Please update the description to include all required headings.'
    );
  }

  if (matchResult.matchedRules.length === 0) {
    core.info('No rules matched the changed files. Skipping checks.');
  }

  const passed = errors.length === 0;

  return { passed, errors, warnings };
}

export function reportOutcome(outcome: CheckOutcome): void {
  outcome.warnings.forEach((w) => core.warning(w));

  if (!outcome.passed) {
    outcome.errors.forEach((e) => core.error(e));
    core.setFailed('PR check failed. See errors above.');
  } else {
    core.info('All PR checks passed.');
  }
}
