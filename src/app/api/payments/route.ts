import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllPayments, getPaymentsByMember, createPayment, getMemberById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberIdParam = searchParams.get('memberId');
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    let payments;
    if (session.role === 'member') {
      // Member can only view their own
      payments = await getPaymentsByMember(session.id);
    } else {
      if (memberIdParam) {
        payments = await getPaymentsByMember(memberIdParam);
      } else {
        payments = await getAllPayments();
      }
    }

    if (yearParam) {
      const y = Number(yearParam);
      payments = payments.filter((p) => p.forYear === y);
    }

    if (monthParam) {
      const m = Number(monthParam);
      payments = payments.filter((p) => p.forMonth === m);
    }

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { memberId, amount, paymentDate, forMonth, forYear, paymentMode, notes } = body;

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be a valid positive number greater than ₹0' },
        { status: 400 }
      );
    }

    const numMonth = Math.floor(Number(forMonth));
    const numYear = Math.floor(Number(forYear));
    if (isNaN(numMonth) || numMonth < 1 || numMonth > 12 || isNaN(numYear) || numYear < 2020 || numYear > 2100) {
      return NextResponse.json(
        { error: 'Valid payment month (1-12) and year are required' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(paymentDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Valid payment date is required' },
        { status: 400 }
      );
    }

    const member = await getMemberById(memberId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const newPayment = await createPayment({
      memberId: member.id,
      memberName: member.name,
      amount: numAmount,
      paymentDate: paymentDate.trim(),
      forMonth: numMonth,
      forYear: numYear,
      paymentMode: paymentMode || 'Cash',
      notes: notes?.trim() || '',
      recordedBy: session.name || 'Admin',
    });

    return NextResponse.json({ success: true, payment: newPayment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 400 });
  }
}
