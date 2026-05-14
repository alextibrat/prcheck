import * as github from '@actions/github';
import * as core from '@actions/core';

export type Octokit = ReturnType<typeof github.getOctokit>;

export interface PRContext {
  owner: string;
  repo: string;
  pullNumber: number;
  description: string;
  existingLabels: string[];
  changedFiles: string[];
}

export async function getPRContext(octokit: Octokit): Promise<PRContext> {
  const { owner, repo } = github.context.repo;
  const pullNumber = github.context.payload.pull_request?.number;

  if (!pullNumber) {
    throw new Error('This action must be triggered by a pull_request event.');
  }

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  const filesResponse = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  return {
    owner,
    repo,
    pullNumber,
    description: pr.body ?? '',
    existingLabels: pr.labels.map((l) => l.name),
    changedFiles: filesResponse.map((f) => f.filename),
  };
}

export async function applyLabels(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  labels: string[]
): Promise<void> {
  if (labels.length === 0) return;
  core.info(`Applying labels: ${labels.join(', ')}`);
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: pullNumber,
    labels,
  });
}
