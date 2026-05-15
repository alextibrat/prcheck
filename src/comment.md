# comment.ts

Provides utilities for managing a single bot-owned comment on a pull request.
The comment is identified by an HTML tag embedded at the top of its body,
allowing prcheck to upsert or delete it across workflow runs without leaving
duplicate comments.

## API

### `buildTaggedBody(body, tag?)`

Prepends the given `tag` (default `<!-- prcheck-comment -->`) to `body`.
This tag is used as a unique marker when searching for an existing comment.

### `findExistingComment(octokit, owner, repo, prNumber, tag?)`

Lists all comments on the given PR and returns the `id` of the first one
whose body contains `tag`, or `null` if none is found.

### `upsertComment(octokit, options)`

Creates a new comment if none tagged with `options.tag` exists, or updates
the existing one in place. Accepts:

| Field | Type | Description |
|-------|------|-------------|
| `owner` | `string` | Repository owner |
| `repo` | `string` | Repository name |
| `prNumber` | `number` | Pull request number |
| `body` | `string` | Comment body (Markdown) |
| `tag` | `string?` | Override the default marker tag |

### `deleteComment(octokit, owner, repo, prNumber, tag?)`

Finds and deletes the tagged comment. Does nothing if no comment is found.

## Usage

```ts
import { upsertComment } from './comment';

await upsertComment(octokit, {
  owner: context.repo.owner,
  repo: context.repo.repo,
  prNumber: context.payload.pull_request.number,
  body: '## prcheck results\n\n✅ All checks passed.',
});
```
