import * as core from '@actions/core';
import * as github from '@actions/github';
import { Rule } from './config';

export interface LabelResult {
  toAdd: string[];
  toRemove: string[];
  current: string[];
}

export async function computeLabelChanges(
  rules: Rule[],
  matchedRules: Rule[],
  currentLabels: string[]
): Promise<LabelResult> {
  const allManagedLabels = new Set<string>();
  const desiredLabels = new Set<string>();

  for (const rule of rules) {
    if (rule.labels) {
      rule.labels.forEach((l) => allManagedLabels.add(l));
    }
  }

  for (const rule of matchedRules) {
    if (rule.labels) {
      rule.labels.forEach((l) => desiredLabels.add(l));
    }
  }

  const toAdd = [...desiredLabels].filter((l) => !currentLabels.includes(l));
  const toRemove = currentLabels.filter(
    (l) => allManagedLabels.has(l) && !desiredLabels.has(l)
  );

  return { toAdd, toRemove, current: currentLabels };
}

export async function applyLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number,
  changes: LabelResult
): Promise<void> {
  if (changes.toAdd.length > 0) {
    core.info(`Adding labels: ${changes.toAdd.join(', ')}`);
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels: changes.toAdd,
    });
  }

  for (const label of changes.toRemove) {
    core.info(`Removing label: ${label}`);
    await octokit.rest.issues.removeLabel({
      owner,
      repo,
      issue_number: prNumber,
      name: label,
    });
  }
}
