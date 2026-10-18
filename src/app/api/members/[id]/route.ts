import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { getMemberById, updateMember, deleteMember, getPaymentsByMember, getMemberSummaryById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Members can only see their own profile, admin can see any
    if (session.role !== 'admin' && session.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const member = await getMemberById(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const summary = await getMemberSummaryById(params.id);
    const payments = await getPaymentsByMember(params.id);

    return NextResponse.json({ member, summary, payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.phone !== undefined) updates.phone = body.phone.trim();
    if (body.address !== undefined) updates.address = body.address.trim();
    if (body.monthlyFee !== undefined) updates.monthlyFee = Number(body.monthlyFee);
    if (body.joiningDate !== undefined) updates.joiningDate = body.joiningDate;
    if (body.username !== undefined) updates.username = body.username.trim();
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes.trim();

    // Password reset if provided
    if (body.password && body.password.trim().length > 0) {
      updates.passwordHash = await hashPassword(body.password.trim());
      updates.plainPasswordHint = body.password.trim();
    }

    const updated = await updateMember(params.id, updates);
    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update member' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const success = await deleteMember(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
