import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { validatePR, ValidationContext } from './validator';

function writeTempFile(name: string, content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prcheck-'));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

const CONFIG_YAML = `
rules:
  - name: backend
    paths:
      - 'src/**/*.ts'
    template: TMPL_PATH
    labels:
      - backend
`;

const TEMPLATE_MD = `## Summary

## Test Plan
`;

const VALID_BODY = `## Summary
Did something useful.

## Test Plan
Ran unit tests.
`;

const INVALID_BODY = `Just a quick fix.`;

async function makeConfig(templatePath: string): Promise<string> {
  const yaml = CONFIG_YAML.replace('TMPL_PATH', templatePath);
  return writeTempFile('prcheck.yml', yaml);
}

test('integration: passes when body matches template', async () => {
  const tmpl = writeTempFile('template.md', TEMPLATE_MD);
  const cfg = await makeConfig(tmpl);

  const ctx: ValidationContext = {
    prTitle: 'fix: something',
    prBody: VALID_BODY,
    changedFiles: ['src/foo.ts'],
    labels: ['backend'],
  };

  const result = await validatePR(ctx, cfg);
  expect(result.passed).toBe(true);
  expect(result.matchedRules).toContain('backend');
}, 10000);

test('integration: fails when body does not match template', async () => {
  const tmpl = writeTempFile('template.md', TEMPLATE_MD);
  const cfg = await makeConfig(tmpl);

  const ctx: ValidationContext = {
    prTitle: 'fix: something',
    prBody: INVALID_BODY,
    changedFiles: ['src/bar.ts'],
    labels: ['backend'],
  };

  const result = await validatePR(ctx, cfg);
  expect(result.passed).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
}, 10000);
