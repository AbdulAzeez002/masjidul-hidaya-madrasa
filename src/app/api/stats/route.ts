import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const stats = await getDashboardStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
