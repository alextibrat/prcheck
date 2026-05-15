import * as fs from 'fs';
import * as path from 'path';

export interface TemplateSection {
  heading: string;
  required: boolean;
  minLength?: number;
}

export interface ParsedTemplate {
  sections: TemplateSection[];
  raw: string;
}

/**
 * Parses a markdown PR description template into structured sections.
 */
export function parseTemplate(templateContent: string): ParsedTemplate {
  const sections: TemplateSection[] = [];
  const lines = templateContent.split('\n');

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      const required = !heading.toLowerCase().includes('(optional)');
      sections.push({ heading, required, minLength: required ? 10 : 0 });
    }
  }

  return { sections, raw: templateContent };
}

/**
 * Loads a template file from the given path.
 */
export function loadTemplate(templatePath: string): ParsedTemplate | null {
  const resolved = path.resolve(templatePath);
  if (!fs.existsSync(resolved)) {
    return null;
  }
  const content = fs.readFileSync(resolved, 'utf8');
  return parseTemplate(content);
}

/**
 * Validates a PR body against a parsed template.
 * Returns a list of missing or incomplete section headings.
 */
export function validateAgainstTemplate(
  prBody: string,
  template: ParsedTemplate
): string[] {
  const missing: string[] = [];

  for (const section of template.sections) {
    if (!section.required) continue;

    const headingPattern = new RegExp(
      `#{1,3}\\s+${escapeRegex(section.heading)}`,
      'i'
    );
    const match = headingPattern.exec(prBody);

    if (!match) {
      missing.push(section.heading);
      continue;
    }

    if (section.minLength && section.minLength > 0) {
      const afterHeading = prBody.slice(match.index + match[0].length).trim();
      if (afterHeading.length < section.minLength) {
        missing.push(section.heading);
      }
    }
  }

  return missing;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
