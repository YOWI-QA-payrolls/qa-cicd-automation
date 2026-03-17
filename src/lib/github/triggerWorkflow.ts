import { githubClient } from './client';

interface TriggerInput {
  workflowId: string;
  scope: string;
  planId: string;
  triggeredBy: string;
}

export async function triggerWorkflow(input: TriggerInput): Promise<string> {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const createdAfter = new Date().toISOString();

  try {
    await githubClient.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: input.workflowId,
      ref: 'main',
      inputs: { scope: input.scope, planId: input.planId, triggeredBy: input.triggeredBy },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401) throw new Error('AUTH_ERROR');
    if (status === 404) throw new Error('NOT_FOUND');
    throw new Error('NETWORK_ERROR');
  }

  const { data } = await githubClient.rest.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: input.workflowId,
    event: 'workflow_dispatch',
    created: `>=${createdAfter}`,
    per_page: 1,
  });

  const run = data.workflow_runs[0];
  if (!run) throw new Error('NOT_FOUND');
  return String(run.id);
}
