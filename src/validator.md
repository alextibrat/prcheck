# validator

The `validator` module is the central orchestration layer for PR validation in **prcheck**.
It ties together config loading, rule evaluation, template validation, and label checking
into a single `validatePR` call.

## API

### `validatePR(context, configPath): Promise<ValidationResult>`

Runs all configured rules against the provided PR context.

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `context` | `ValidationContext` | PR metadata: title, body, changed files, labels |
| `configPath` | `string` | Path to the `prcheck.yml` config file |

**Returns** a `ValidationResult`:

```ts
{
  passed: boolean;       // true when no errors were raised
  errors: string[];      // hard failures (e.g. template mismatch)
  warnings: string[];    // soft issues (e.g. missing labels)
  matchedRules: string[];// names of rules whose path patterns matched
}
```

## Behaviour

1. Loads config via `loadConfig`.
2. Evaluates path-based rules via `evaluateRules`.
3. For each matched rule:
   - If a `template` is specified, loads and validates the PR body.
   - If `labels` are specified, checks that all required labels are present.
4. Returns a structured result; does **not** throw on validation failure.

## Error vs Warning

- **Error** – template mismatch. Blocks the PR.
- **Warning** – missing labels. Informational only.
