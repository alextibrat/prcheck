# Rule Engine

The `rule-engine` module is the core decision layer of **prcheck**. It evaluates
configured rules against the list of files changed in a pull request and
produces a structured result describing which rules were triggered.

## API

### `evaluateRules(rules, changedFiles)`

Synchronously evaluates an array of `Rule` objects against `changedFiles`.

```ts
const result = evaluateRules(rules, ['src/ui/Button.tsx']);
// result.matchedRules   — rules whose path patterns matched at least one file
// result.requiredLabels — deduplicated union of all matched rules' labels
// result.requiredTemplates — deduplicated union of all matched rules' templates
```

### `evaluateRulesFromConfig(changedFiles, configPath?)`

Async helper that loads the YAML config from disk (via `loadConfig`) and calls
`evaluateRules` internally.

```ts
const result = await evaluateRulesFromConfig(changedFiles);
```

## Rule Shape

```yaml
rules:
  - name: frontend
    paths:
      - src/ui/**
      - '*.css'
    labels:
      - frontend
    template: .github/templates/frontend.md
```

| Field      | Required | Description                              |
|------------|----------|------------------------------------------|
| `name`     | yes      | Human-readable identifier                |
| `paths`    | yes      | Glob patterns matched against PR files   |
| `labels`   | no       | Labels to apply when rule matches        |
| `template` | no       | Path to required PR description template |

## Integration

The rule engine is consumed by `src/checks.ts` (`runChecks`) which passes its
output to the label applicator (`src/labels.ts`) and the template validator
(`src/template.ts`).
