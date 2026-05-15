import { parseTemplate, validateAgainstTemplate, loadTemplate } from './template';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const SAMPLE_TEMPLATE = `## Summary
Describe your changes here.

## Motivation
Why is this change needed?

## Testing
How was this tested?

## Notes (optional)
Any additional context.
`;

describe('parseTemplate', () => {
  it('parses required sections', () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    expect(result.sections.length).toBe(4);
    expect(result.sections[0].heading).toBe('Summary');
    expect(result.sections[0].required).toBe(true);
  });

  it('marks optional sections correctly', () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    const optional = result.sections.find(s => s.heading.includes('optional'));
    expect(optional).toBeDefined();
    expect(optional?.required).toBe(false);
  });

  it('returns raw template content', () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    expect(result.raw).toBe(SAMPLE_TEMPLATE);
  });
});

describe('validateAgainstTemplate', () => {
  const template = parseTemplate(SAMPLE_TEMPLATE);

  it('returns no missing sections for a complete PR body', () => {
    const body = `## Summary\nThis PR adds a new feature with enough detail.\n\n## Motivation\nBecause we needed it badly.\n\n## Testing\nManual testing was performed on staging.`;
    const missing = validateAgainstTemplate(body, template);
    expect(missing).toHaveLength(0);
  });

  it('returns missing sections when headings are absent', () => {
    const body = `## Summary\nSome summary here with enough text.`;
    const missing = validateAgainstTemplate(body, template);
    expect(missing).toContain('Motivation');
    expect(missing).toContain('Testing');
  });

  it('does not flag optional sections as missing', () => {
    const body = `## Summary\nSome summary here with enough text.\n\n## Motivation\nBecause we needed it.\n\n## Testing\nTested manually on staging env.`;
    const missing = validateAgainstTemplate(body, template);
    expect(missing).not.toContain('Notes (optional)');
  });
});

describe('loadTemplate', () => {
  it('returns null for non-existent file', () => {
    const result = loadTemplate('/non/existent/path.md');
    expect(result).toBeNull();
  });

  it('loads and parses a template from disk', () => {
    const tmpFile = path.join(os.tmpdir(), 'prcheck-template-test.md');
    fs.writeFileSync(tmpFile, SAMPLE_TEMPLATE, 'utf8');
    const result = loadTemplate(tmpFile);
    expect(result).not.toBeNull();
    expect(result?.sections.length).toBeGreaterThan(0);
    fs.unlinkSync(tmpFile);
  });
});
