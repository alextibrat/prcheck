import * as github from '@actions/github';

type Octokit = ReturnType<typeof github.getOctokit>;

export interface CommentOptions {
  owner: string;
  repo: string;
  prNumber: number;
  body: string;
  tag?: string;
}

const DEFAULT_TAG = '<!-- prcheck-comment -->';

export function buildTaggedBody(body: string, tag: string = DEFAULT_TAG): string {
  return `${tag}\n${body}`;
}

export async function findExistingComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  tag: string = DEFAULT_TAG
): Promise<number | null> {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  const existing = comments.find((c) => c.body?.includes(tag));
  return existing ? existing.id : null;
}

export async function upsertComment(
  octokit: Octokit,
  options: CommentOptions
): Promise<void> {
  const { owner, repo, prNumber, body, tag = DEFAULT_TAG } = options;
  const taggedBody = buildTaggedBody(body, tag);

  const existingId = await findExistingComment(octokit, owner, repo, prNumber, tag);

  if (existingId) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingId,
      body: taggedBody,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: taggedBody,
    });
  }
}

export async function deleteComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  tag: string = DEFAULT_TAG
): Promise<void> {
  const existingId = await findExistingComment(octokit, owner, repo, prNumber, tag);
  if (existingId) {
    await octokit.rest.issues.deleteComment({
      owner,
      repo,
      comment_id: existingId,
    });
  }
}
