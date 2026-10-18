import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deletePayment } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const success = await deletePayment(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Payment record deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
