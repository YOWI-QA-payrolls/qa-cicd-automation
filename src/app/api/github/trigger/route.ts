import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { triggerWorkflow } from '@/lib/github/triggerWorkflow';

const ERROR_STATUS: Record<string, number> = {
  AUTH_ERROR: 401,
  NOT_FOUND: 404,
  NETWORK_ERROR: 502,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_ERROR' }, { status: 401 });
  }

  const body = await request.json() as {
    workflowId: string;
    scope: string;
    planId: string;
    triggeredBy: string;
  };

  const { workflowId, scope, planId, triggeredBy } = body;
  if (!workflowId || !scope || !planId || !triggeredBy) {
    return NextResponse.json({ error: 'Missing required fields', code: 'BAD_PAYLOAD' }, { status: 400 });
  }

  try {
    const githubRunId = await triggerWorkflow({ workflowId, scope, planId, triggeredBy });

    const workflow = await prisma.githubWorkflow.findFirst({ where: { workflowId } });
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    await prisma.triggerLog.create({
      data: {
        workflowId: workflow.id,
        scope,
        triggeredBy,
        githubRunId,
        status: 'queued',
      },
    });

    return NextResponse.json({ runId: githubRunId });
  } catch (err: unknown) {
    const code = (err as Error).message;
    const status = ERROR_STATUS[code] ?? 500;
    return NextResponse.json({ error: code, code }, { status });
  }
}
