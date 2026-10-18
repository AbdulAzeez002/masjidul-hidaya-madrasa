import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getFeeSettings, updateFixedMonthlyFee } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getFeeSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch fee settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { amount, effectiveFrom } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid positive number for the monthly fee' },
        { status: 400 }
      );
    }

    const updated = await updateFixedMonthlyFee(numAmount, effectiveFrom, session.username);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update fee' }, { status: 400 });
  }
}
