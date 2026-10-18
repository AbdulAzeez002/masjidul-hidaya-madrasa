import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMemberSummaryById } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  let memberSummary = null;
  if (session.role === 'member') {
    memberSummary = await getMemberSummaryById(session.id);
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
    memberSummary,
  });
}
