import { githubClient } from './client';
import type { RunStatus } from '@/types';

interface RunStatusResult {
  runId: string;
  status: RunStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export async function getRunStatus(runId: string): Promise<RunStatusResult> {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;

  try {
    const { data } = await githubClient.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: Number(runId),
    });

    let status: RunStatus = 'idle';
    if (data.status === 'queued') status = 'queued';
    else if (data.status === 'in_progress') status = 'in_progress';
    else if (data.status === 'completed') {
      if (data.conclusion === 'success') status = 'success';
      else if (data.conclusion === 'failure' || data.conclusion === 'timed_out') status = 'failure';
      else status = 'error';
    }

    return {
      runId,
      status,
      startedAt: data.run_started_at ?? null,
      completedAt: data.updated_at ?? null,
    };
  } catch (err: unknown) {
    const httpStatus = (err as { status?: number }).status;
    if (httpStatus === 401) throw new Error('AUTH_ERROR');
    if (httpStatus === 404) throw new Error('NOT_FOUND');
    throw new Error('NETWORK_ERROR');
  }
}
