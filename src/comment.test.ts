import { buildTaggedBody, findExistingComment, upsertComment, deleteComment } from './comment';

const DEFAULT_TAG = '<!-- prcheck-comment -->';

function makeOctokit(comments: { id: number; body: string }[]) {
  return {
    rest: {
      issues: {
        listComments: jest.fn().mockResolvedValue({ data: comments }),
        createComment: jest.fn().mockResolvedValue({}),
        updateComment: jest.fn().mockResolvedValue({}),
        deleteComment: jest.fn().mockResolvedValue({}),
      },
    },
  } as any;
}

describe('buildTaggedBody', () => {
  it('prepends the default tag', () => {
    const result = buildTaggedBody('hello');
    expect(result).toBe(`${DEFAULT_TAG}\nhello`);
  });

  it('uses a custom tag when provided', () => {
    const result = buildTaggedBody('hello', '<!-- custom -->');
    expect(result).toBe('<!-- custom -->\nhello');
  });
});

describe('findExistingComment', () => {
  it('returns null when no matching comment exists', async () => {
    const octokit = makeOctokit([{ id: 1, body: 'no tag here' }]);
    const id = await findExistingComment(octokit, 'owner', 'repo', 1);
    expect(id).toBeNull();
  });

  it('returns the comment id when a match is found', async () => {
    const octokit = makeOctokit([{ id: 42, body: `${DEFAULT_TAG}\nsome content` }]);
    const id = await findExistingComment(octokit, 'owner', 'repo', 1);
    expect(id).toBe(42);
  });
});

describe('upsertComment', () => {
  it('creates a new comment when none exists', async () => {
    const octokit = makeOctokit([]);
    await upsertComment(octokit, { owner: 'o', repo: 'r', prNumber: 1, body: 'msg' });
    expect(octokit.rest.issues.createComment).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.stringContaining('msg') })
    );
  });

  it('updates an existing comment when one is found', async () => {
    const octokit = makeOctokit([{ id: 7, body: `${DEFAULT_TAG}\nold` }]);
    await upsertComment(octokit, { owner: 'o', repo: 'r', prNumber: 1, body: 'new msg' });
    expect(octokit.rest.issues.updateComment).toHaveBeenCalledWith(
      expect.objectContaining({ comment_id: 7, body: expect.stringContaining('new msg') })
    );
  });
});

describe('deleteComment', () => {
  it('does nothing when no comment exists', async () => {
    const octokit = makeOctokit([]);
    await deleteComment(octokit, 'o', 'r', 1);
    expect(octokit.rest.issues.deleteComment).not.toHaveBeenCalled();
  });

  it('deletes the comment when found', async () => {
    const octokit = makeOctokit([{ id: 5, body: `${DEFAULT_TAG}\nstuff` }]);
    await deleteComment(octokit, 'o', 'r', 1);
    expect(octokit.rest.issues.deleteComment).toHaveBeenCalledWith(
      expect.objectContaining({ comment_id: 5 })
    );
  });
});
