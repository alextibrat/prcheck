import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as core from '@actions/core';
import { runChecks, reportOutcome } from './checks';
import { PRContext } from './github';
import { MatchResult } from './matcher';

vi.mock('@actions/core');

const baseContext: PRContext = {
  owner: 'org',
  repo: 'repo',
  pullNumber: 42,
  description: '## What changed\nFixed a bug',
  existingLabels: [],
  changedFiles: ['src/index.ts'],
};

const baseMatch: MatchResult = {
  matchedRules: [],
  requiredLabels: [],
  requiredTemplate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('runChecks', () => {
  it('passes when no rules matched', () => {
    const outcome = runChecks(baseContext, baseMatch, true);
    expect(outcome.passed).toBe(true);
    expect(outcome.errors).toHaveLength(0);
  });

  it('adds warning for missing labels', () => {
    const match: MatchResult = { ...baseMatch, requiredLabels: ['typescript'] };
    const outcome = runChecks(baseContext, match, true);
    expect(outcome.warnings[0]).toContain('typescript');
    expect(outcome.passed).toBe(true);
  });

  it('does not warn when labels already exist', () => {
    const ctx = { ...baseContext, existingLabels: ['typescript'] };
    const match: MatchResult = { ...baseMatch, requiredLabels: ['typescript'] };
    const outcome = runChecks(ctx, match, true);
    expect(outcome.warnings).toHaveLength(0);
  });

  it('fails when template is required but description does not match', () => {
    const match: MatchResult = {
      ...baseMatch,
      requiredTemplate: '## What changed\n## Testing\n',
    };
    const outcome = runChecks(baseContext, match, false);
    expect(outcome.passed).toBe(false);
    expect(outcome.errors[0]).toContain('template');
  });

  it('passes when template is satisfied', () => {
    const match: MatchResult = {
      ...baseMatch,
      requiredTemplate: '## What changed\n',
    };
    const outcome = runChecks(baseContext, match, true);
    expect(outcome.passed).toBe(true);
  });
});

describe('reportOutcome', () => {
  it('calls setFailed when checks did not pass', () => {
    reportOutcome({ passed: false, errors: ['bad'], warnings: [] });
    expect(core.setFailed).toHaveBeenCalled();
  });

  it('does not call setFailed when checks pass', () => {
    reportOutcome({ passed: true, errors: [], warnings: [] });
    expect(core.setFailed).not.toHaveBeenCalled();
  });
});
