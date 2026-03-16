import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRunStatus } from '@/lib/github/getRunStatus';

const ERROR_STATUS: Record<string, number> = {
  AUTH_ERROR: 401,
  NOT_FOUND: 404,
  NETWORK_ERROR: 502,
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_ERROR' }, { status: 401 });
  }

  const runId = request.nextUrl.searchParams.get('runId');
  if (!runId) {
    return NextResponse.json({ error: 'Missing runId', code: 'BAD_PAYLOAD' }, { status: 400 });
  }

  try {
    const result = await getRunStatus(runId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const code = (err as Error).message;
    const status = ERROR_STATUS[code] ?? 500;
    return NextResponse.json({ error: code, code }, { status });
  }
}
