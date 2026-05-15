# Path Filter Module

The `path-filter` module provides utilities for matching changed file paths against glob-style patterns. It is used by the rule-matching engine to determine which PR rules apply based on the files changed in a pull request.

## Supported Glob Syntax

| Pattern | Description |
|---------|-------------|
| `*`     | Matches any characters except `/` |
| `**`    | Matches any characters including `/` (recursive) |
| `?`     | Matches a single character except `/` |

## API

### `matchesPattern(filePath, pattern)`
Returns `true` if the given file path matches the glob pattern.

### `anyFileMatchesPattern(changedFiles, pattern)`
Returns `true` if **any** file in the list matches the pattern.

### `anyFileMatchesAnyPattern(changedFiles, patterns)`
Returns `true` if any file matches **any** of the provided patterns.

### `filterFilesByPatterns(changedFiles, patterns)`
Returns a filtered list of files that match at least one of the provided patterns.

### `patternToRegex(pattern)`
Converts a glob-style pattern string into an equivalent regex string.

## Examples

```yaml
# prcheck.yml
rules:
  - name: Frontend changes
    paths:
      - "src/ui/**/*.tsx"
      - "src/styles/**/*.css"
    label: "frontend"
    template: .github/PULL_REQUEST_TEMPLATE/frontend.md
```
