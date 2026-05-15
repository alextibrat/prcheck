import { validatePR, ValidationContext } from './validator';
import * as config from './config';
import * as ruleEngine from './rule-engine';
import * as template from './template';

jest.mock('./config');
jest.mock('./rule-engine');
jest.mock('./template');

const mockLoadConfig = config.loadConfig as jest.Mock;
const mockEvaluateRules = ruleEngine.evaluateRules as jest.Mock;
const mockLoadTemplate = template.loadTemplate as jest.Mock;
const mockValidateAgainstTemplate = template.validateAgainstTemplate as jest.Mock;

const baseContext: ValidationContext = {
  prTitle: 'feat: add feature',
  prBody: '## Summary\nDid something.',
  changedFiles: ['src/index.ts'],
  labels: ['enhancement'],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadConfig.mockResolvedValue({ rules: [] });
  mockEvaluateRules.mockReturnValue({ matched: [], unmatched: [] });
});

test('returns passed=true when no rules match', async () => {
  const result = await validatePR(baseContext, '.github/prcheck.yml');
  expect(result.passed).toBe(true);
  expect(result.errors).toHaveLength(0);
  expect(result.matchedRules).toHaveLength(0);
});

test('reports error when template validation fails', async () => {
  mockEvaluateRules.mockReturnValue({
    matched: [{ name: 'backend', template: 'templates/backend.md', labels: [] }],
    unmatched: [],
  });
  mockLoadTemplate.mockResolvedValue({ sections: ['## Summary'] });
  mockValidateAgainstTemplate.mockReturnValue(false);

  const result = await validatePR(baseContext, '.github/prcheck.yml');
  expect(result.passed).toBe(false);
  expect(result.errors[0]).toContain('backend');
});

test('reports warning for missing labels', async () => {
  mockEvaluateRules.mockReturnValue({
    matched: [{ name: 'frontend', labels: ['ui', 'frontend'] }],
    unmatched: [],
  });

  const result = await validatePR({ ...baseContext, labels: [] }, '.github/prcheck.yml');
  expect(result.passed).toBe(true);
  expect(result.warnings[0]).toContain('ui');
});

test('populates matchedRules correctly', async () => {
  mockEvaluateRules.mockReturnValue({
    matched: [{ name: 'docs', labels: [] }],
    unmatched: [],
  });

  const result = await validatePR(baseContext, '.github/prcheck.yml');
  expect(result.matchedRules).toContain('docs');
});
