import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as core from '@actions/core';

export interface Rule {
  pattern: string;
  labels?: string[];
  template?: string;
  required_description?: boolean;
}

export interface Config {
  rules: Rule[];
  fail_on_missing_template?: boolean;
  comment_on_failure?: boolean;
}

export function loadConfig(configPath: string): Config {
  if (!fs.existsSync(configPath)) {
    core.warning(`Config file not found at ${configPath}, using defaults.`);
    return { rules: [] };
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = yaml.load(raw) as Config;

  if (!parsed || !Array.isArray(parsed.rules)) {
    throw new Error(`Invalid config: 'rules' must be an array.`);
  }

  for (const rule of parsed.rules) {
    if (!rule.pattern) {
      throw new Error(`Invalid config: each rule must have a 'pattern'.`);
    }
  }

  core.debug(`Loaded ${parsed.rules.length} rule(s) from ${configPath}`);
  return parsed;
}
