# prcheck

> Lightweight GitHub Action that enforces PR description templates and labels based on changed file paths.

## Installation

```bash
npm install
npm run build
```

## Usage

Add the following to your workflow file (e.g. `.github/workflows/prcheck.yml`):

```yaml
name: PR Check

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  prcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run prcheck
        uses: your-org/prcheck@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          config-path: .github/prcheck.yml
```

Define your rules in `.github/prcheck.yml`:

```yaml
rules:
  - paths:
      - "src/**"
    labels:
      - "code-change"
    template: .github/PULL_REQUEST_TEMPLATE/code.md
  - paths:
      - "docs/**"
    labels:
      - "documentation"
    template: .github/PULL_REQUEST_TEMPLATE/docs.md
```

If a PR touches files matching a defined path pattern, `prcheck` will:
- Automatically apply the configured labels
- Warn if the PR description does not match the expected template structure

## License

MIT © your-org