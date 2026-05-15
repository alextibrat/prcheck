/**
 * Utilities for matching changed file paths against glob-style patterns.
 */

export function matchesPattern(filePath: string, pattern: string): boolean {
  const regexStr = patternToRegex(pattern);
  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(filePath);
}

export function anyFileMatchesPattern(changedFiles: string[], pattern: string): boolean {
  return changedFiles.some((file) => matchesPattern(file, pattern));
}

export function anyFileMatchesAnyPattern(changedFiles: string[], patterns: string[]): boolean {
  return patterns.some((pattern) => anyFileMatchesPattern(changedFiles, pattern));
}

export function filterFilesByPatterns(changedFiles: string[], patterns: string[]): string[] {
  return changedFiles.filter((file) =>
    patterns.some((pattern) => matchesPattern(file, pattern))
  );
}

/**
 * Converts a glob-style pattern to a regex string.
 * Supports:
 *   - `**` matches any path segment (including slashes)
 *   - `*`  matches any characters except slashes
 *   - `?`  matches a single character except slash
 */
export function patternToRegex(pattern: string): string {
  let result = "";
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "*" && pattern[i + 1] === "*") {
      result += ".*";
      i += 2;
      if (pattern[i] === "/") i++; // skip trailing slash after **
    } else if (ch === "*") {
      result += "[^/]*";
      i++;
    } else if (ch === "?") {
      result += "[^/]";
      i++;
    } else if (".+^${}()|[]\\".includes(ch)) {
      result += "\\" + ch;
      i++;
    } else {
      result += ch;
      i++;
    }
  }
  return result;
}
