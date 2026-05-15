import { createReport, summarizeReport, CheckResult } from './reporter';

describe('createReport', () => {
  it('marks report as passed when all checks pass', () => {
    const results: CheckResult[] = [
      { name: 'labels', status: 'pass' },
      { name: 'template', status: 'pass' },
    ];
    const report = createReport(results);
    expect(report.passed).toBe(true);
    expect(report.results).toHaveLength(2);
  });

  it('marks report as failed when any check fails', () => {
    const results: CheckResult[] = [
      { name: 'labels', status: 'pass' },
      { name: 'template', status: 'fail', message: 'Missing section' },
    ];
    const report = createReport(results);
    expect(report.passed).toBe(false);
  });

  it('marks report as passed when checks are skipped (no failures)', () => {
    const results: CheckResult[] = [
      { name: 'labels', status: 'skip', message: 'No rules matched' },
    ];
    const report = createReport(results);
    expect(report.passed).toBe(true);
  });

  it('returns empty report as passed', () => {
    const report = createReport([]);
    expect(report.passed).toBe(true);
    expect(report.results).toHaveLength(0);
  });
});

describe('summarizeReport', () => {
  it('summarizes mixed results correctly', () => {
    const results: CheckResult[] = [
      { name: 'a', status: 'pass' },
      { name: 'b', status: 'fail' },
      { name: 'c', status: 'skip' },
    ];
    const report = createReport(results);
    const summary = summarizeReport(report);
    expect(summary).toBe('1 passed, 1 failed, 1 skipped (3 total)');
  });

  it('summarizes all-pass results', () => {
    const results: CheckResult[] = [
      { name: 'a', status: 'pass' },
      { name: 'b', status: 'pass' },
    ];
    const report = createReport(results);
    expect(summarizeReport(report)).toBe('2 passed, 0 failed, 0 skipped (2 total)');
  });
});
