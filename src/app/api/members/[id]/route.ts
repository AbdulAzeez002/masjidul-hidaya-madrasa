import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { getMemberById, getAllMembers, updateMember, deleteMember, getPaymentsByMember, getMemberSummaryById } from '@/lib/db';

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
    const targetMember = await getMemberById(params.id);
    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.phone !== undefined) updates.phone = body.phone.trim();
    if (body.address !== undefined) updates.address = body.address.trim();

    if (body.monthlyFee !== undefined) {
      const feeNum = Number(body.monthlyFee);
      if (isNaN(feeNum) || feeNum <= 0) {
        return NextResponse.json(
          { error: 'Monthly fee must be a valid positive amount' },
          { status: 400 }
        );
      }
      updates.monthlyFee = Math.round(feeNum);
    }

    if (body.joiningDate !== undefined) updates.joiningDate = body.joiningDate;

    if (body.username !== undefined) {
      const cleanUsername = body.username.trim().toLowerCase();
      const all = await getAllMembers();
      if (all.some((m) => m.id !== params.id && m.username.toLowerCase() === cleanUsername)) {
        return NextResponse.json(
          { error: `Username "${body.username.trim()}" is already taken` },
          { status: 400 }
        );
      }
      updates.username = body.username.trim();
    }

    if (body.status !== undefined) {
      if (targetMember.role === 'admin' && body.status === 'inactive') {
        return NextResponse.json(
          { error: 'Cannot deactivate the primary administrator account' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

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

    const targetMember = await getMemberById(params.id);
    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMember.role === 'admin' || targetMember.username === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete the primary administrator account' },
        { status: 400 }
      );
    }

    const success = await deleteMember(params.id);

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
