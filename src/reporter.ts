import * as core from '@actions/core';

export type CheckStatus = 'pass' | 'fail' | 'skip';

export interface CheckResult {
  name: string;
  status: CheckStatus;
  message?: string;
}

export interface Report {
  results: CheckResult[];
  passed: boolean;
}

export function createReport(results: CheckResult[]): Report {
  const passed = results.every((r) => r.status !== 'fail');
  return { results, passed };
}

export function logReport(report: Report): void {
  for (const result of report.results) {
    const prefix = `[${result.name}]`;
    switch (result.status) {
      case 'pass':
        core.info(`✅ ${prefix} ${result.message ?? 'Passed'}`);
        break;
      case 'fail':
        core.error(`❌ ${prefix} ${result.message ?? 'Failed'}`);
        break;
      case 'skip':
        core.info(`⏭️  ${prefix} ${result.message ?? 'Skipped'}`);
        break;
    }
  }

  if (!report.passed) {
    core.setFailed('One or more PR checks failed. See details above.');
  } else {
    core.info('✅ All PR checks passed.');
  }
}

export function summarizeReport(report: Report): string {
  const total = report.results.length;
  const failed = report.results.filter((r) => r.status === 'fail').length;
  const skipped = report.results.filter((r) => r.status === 'skip').length;
  const passed = total - failed - skipped;
  return `${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`;
}
