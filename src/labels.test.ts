import { computeLabelChanges, LabelResult } from './labels';
import { Rule } from './config';

const rules: Rule[] = [
  { pattern: 'src/**', labels: ['code-change'], template: '' },
  { pattern: 'docs/**', labels: ['documentation'], template: '' },
  { pattern: '*.md', labels: ['documentation'], template: '' },
];

describe('computeLabelChanges', () => {
  it('adds labels for matched rules', async () => {
    const matched: Rule[] = [rules[0]];
    const result = await computeLabelChanges(rules, matched, []);
    expect(result.toAdd).toEqual(['code-change']);
    expect(result.toRemove).toEqual([]);
  });

  it('removes managed labels that are no longer matched', async () => {
    const matched: Rule[] = [rules[0]];
    const current = ['code-change', 'documentation'];
    const result = await computeLabelChanges(rules, matched, current);
    expect(result.toAdd).toEqual([]);
    expect(result.toRemove).toEqual(['documentation']);
  });

  it('does not remove unmanaged labels', async () => {
    const matched: Rule[] = [];
    const current = ['manual-label', 'code-change'];
    const result = await computeLabelChanges(rules, matched, current);
    expect(result.toRemove).not.toContain('manual-label');
    expect(result.toRemove).toContain('code-change');
  });

  it('deduplicates labels from multiple matched rules', async () => {
    const matched: Rule[] = [rules[1], rules[2]];
    const result = await computeLabelChanges(rules, matched, []);
    expect(result.toAdd).toEqual(['documentation']);
  });

  it('returns empty changes when labels already match', async () => {
    const matched: Rule[] = [rules[0]];
    const current = ['code-change'];
    const result = await computeLabelChanges(rules, matched, current);
    expect(result.toAdd).toEqual([]);
    expect(result.toRemove).toEqual([]);
  });
});
