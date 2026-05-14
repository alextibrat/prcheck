import { describe, it, expect } from 'vitest';
import { matchRules, descriptionMatchesTemplate, Rule } from './matcher';

const rules: Rule[] = [
  {
    patterns: ['src/**/*.ts'],
    labels: ['typescript'],
    template: '## What changed\n',
  },
  {
    patterns: ['docs/**'],
    labels: ['documentation'],
  },
  {
    patterns: ['*.yml', '*.yaml'],
    labels: ['config', 'ci'],
    template: '## Config change\n',
  },
];

describe('matchRules', () => {
  it('returns empty result when no files match', () => {
    const result = matchRules(['README.md'], rules);
    expect(result.matchedRules).toHaveLength(0);
    expect(result.requiredLabels).toHaveLength(0);
    expect(result.requiredTemplate).toBeNull();
  });

  it('matches typescript files and extracts labels and template', () => {
    const result = matchRules(['src/index.ts', 'src/utils.ts'], rules);
    expect(result.requiredLabels).toContain('typescript');
    expect(result.requiredTemplate).toBe('## What changed\n');
  });

  it('aggregates labels from multiple matched rules', () => {
    const result = matchRules(['src/foo.ts', 'docs/guide.md'], rules);
    expect(result.requiredLabels).toContain('typescript');
    expect(result.requiredLabels).toContain('documentation');
  });

  it('uses first matched template when multiple rules match', () => {
    const result = matchRules(['src/foo.ts', 'ci.yml'], rules);
    expect(result.requiredTemplate).toBe('## What changed\n');
  });

  it('supports glob dot files', () => {
    const dotRules: Rule[] = [{ patterns: ['**/.env*'], labels: ['secrets'] }];
    const result = matchRules(['.env.local'], dotRules);
    expect(result.requiredLabels).toContain('secrets');
  });
});

describe('descriptionMatchesTemplate', () => {
  it('returns true when description contains all required lines', () => {
    const template = '## What changed\n## Testing\n';
    const description = 'Some intro\n## What changed\nDetails\n## Testing\nDone';
    expect(descriptionMatchesTemplate(description, template)).toBe(true);
  });

  it('returns false when a required line is missing', () => {
    const template = '## What changed\n## Testing\n';
    const description = '## What changed\nSome details';
    expect(descriptionMatchesTemplate(description, template)).toBe(false);
  });

  it('ignores HTML comment lines in template', () => {
    const template = '<!-- Fill in below -->\n## Summary\n';
    const description = '## Summary\nFixed a bug';
    expect(descriptionMatchesTemplate(description, template)).toBe(true);
  });
});
