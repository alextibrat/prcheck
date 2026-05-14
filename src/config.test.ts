import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig, PrCheckConfig } from './config';

function writeTempConfig(content: string): string {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `prcheck-test-${Date.now()}.yml`);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

describe('loadConfig', () => {
  it('loads a valid config file', () => {
    const filePath = writeTempConfig(`
rules:
  - pattern: 'src/**'
    labels:
      - frontend
    template: '.github/templates/frontend.md'
  - pattern: 'infra/**'
    labels:
      - infrastructure
default_labels:
  - needs-review
`);
    const config: PrCheckConfig = loadConfig(filePath);
    expect(config.rules).toHaveLength(2);
    expect(config.rules[0].pattern).toBe('src/**');
    expect(config.rules[0].labels).toContain('frontend');
    expect(config.default_labels).toContain('needs-review');
  });

  it('throws if config file does not exist', () => {
    expect(() => loadConfig('/nonexistent/path/config.yml')).toThrow('Config file not found');
  });

  it('throws if rules is missing', () => {
    const filePath = writeTempConfig(`default_labels:\n  - review\n`);
    expect(() => loadConfig(filePath)).toThrow('"rules" must be an array');
  });

  it('throws if a rule is missing pattern', () => {
    const filePath = writeTempConfig(`
rules:
  - labels:
      - backend
`);
    expect(() => loadConfig(filePath)).toThrow('non-empty "pattern" string');
  });
});
