import { evaluateRules, Rule } from './rule-engine';

const rules: Rule[] = [
  {
    name: 'frontend',
    paths: ['src/ui/**', '*.css'],
    labels: ['frontend'],
    template: '.github/templates/frontend.md',
  },
  {
    name: 'backend',
    paths: ['src/api/**', 'src/db/**'],
    labels: ['backend'],
    template: '.github/templates/backend.md',
  },
  {
    name: 'ci',
    paths: ['.github/**'],
    labels: ['ci', 'infra'],
  },
];

describe('evaluateRules', () => {
  it('returns empty result when no files match', () => {
    const result = evaluateRules(rules, ['docs/readme.md']);
    expect(result.matchedRules).toHaveLength(0);
    expect(result.requiredLabels).toHaveLength(0);
    expect(result.requiredTemplates).toHaveLength(0);
  });

  it('matches a single rule correctly', () => {
    const result = evaluateRules(rules, ['src/ui/Button.tsx']);
    expect(result.matchedRules).toHaveLength(1);
    expect(result.matchedRules[0].rule.name).toBe('frontend');
    expect(result.requiredLabels).toContain('frontend');
    expect(result.requiredTemplates).toContain('.github/templates/frontend.md');
  });

  it('matches multiple rules and aggregates labels', () => {
    const result = evaluateRules(rules, [
      'src/ui/App.tsx',
      'src/api/handler.ts',
    ]);
    expect(result.matchedRules).toHaveLength(2);
    expect(result.requiredLabels).toContain('frontend');
    expect(result.requiredLabels).toContain('backend');
  });

  it('deduplicates labels from multiple matching rules', () => {
    const dupRules: Rule[] = [
      { name: 'a', paths: ['src/a/**'], labels: ['shared'] },
      { name: 'b', paths: ['src/b/**'], labels: ['shared'] },
    ];
    const result = evaluateRules(dupRules, ['src/a/foo.ts', 'src/b/bar.ts']);
    expect(result.requiredLabels.filter((l) => l === 'shared')).toHaveLength(1);
  });

  it('handles rules without labels or template gracefully', () => {
    const minimalRules: Rule[] = [
      { name: 'misc', paths: ['misc/**'] },
    ];
    const result = evaluateRules(minimalRules, ['misc/notes.txt']);
    expect(result.matchedRules).toHaveLength(1);
    expect(result.requiredLabels).toHaveLength(0);
    expect(result.requiredTemplates).toHaveLength(0);
  });

  it('records matched files per rule', () => {
    const result = evaluateRules(rules, ['.github/workflows/ci.yml']);
    expect(result.matchedRules[0].matchedFiles).toContain(
      '.github/workflows/ci.yml'
    );
  });
});
