import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ResultPayload {
  caseId: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  durationMs?: number;
  errorMessage?: string;
  framework?: string;
  retryCount?: number;
}

interface WebhookBody {
  githubRunId: string;
  planId: string;
  triggeredBy?: string;
  results: ResultPayload[];
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_ERROR' }, { status: 401 });
  }

  const body = await request.json() as WebhookBody;
  const { githubRunId, planId, results, triggeredBy } = body;

  if (!githubRunId || !planId || !results) {
    return NextResponse.json({ error: 'Missing required fields', code: 'BAD_PAYLOAD' }, { status: 400 });
  }

  let testRun = await prisma.testRun.findFirst({ where: { githubRunId } });
  if (!testRun) {
    testRun = await prisma.testRun.create({
      data: {
        planId,
        triggeredBy: triggeredBy ?? null,
        githubRunId,
        source: 'github_actions',
      },
    });
  }

  await prisma.testResult.createMany({
    data: results.map((r) => ({
      runId: testRun.id,
      caseId: r.caseId,
      status: r.status,
      durationMs: r.durationMs ?? null,
      errorMessage: r.errorMessage ?? null,
      framework: r.framework ?? null,
      retryCount: r.retryCount ?? 0,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
