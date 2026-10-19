import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getAllPayments,
  getPaymentsByMember,
  createPayment,
  createAdvancePayments,
  getMemberById,
  getFeeSettings,
} from '@/lib/db';
import { calculateAdvanceDistribution, getRequiredFeeForMonth, MONTH_NAMES } from '@/lib/utils';

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
    const {
      memberId,
      amount,
      paymentDate,
      forMonth,
      forYear,
      paymentMode,
      notes,
      isAdvance,
      distribution,
    } = body;

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

    // Retrieve fee settings and member's existing payment history
    const feeSettings = await getFeeSettings();
    const existingPayments = await getPaymentsByMember(member.id);
    const existingPaidMap: Record<string, number> = {};
    for (const p of existingPayments) {
      const k = `${p.forYear}-${p.forMonth < 10 ? '0' + p.forMonth : p.forMonth}`;
      existingPaidMap[k] = (existingPaidMap[k] || 0) + p.amount;
    }

    const memberMonthlyFee = member.monthlyFee || feeSettings.currentMonthlyFee || 50;

    const targetKey = `${numYear}-${numMonth < 10 ? '0' + numMonth : numMonth}`;
    const requiredFee = getRequiredFeeForMonth(
      memberMonthlyFee,
      numYear,
      numMonth,
      feeSettings.feeSchedule
    );
    const alreadyPaid = existingPaidMap[targetKey] || 0;
    const remainingDeficit = Math.max(0, requiredFee - alreadyPaid);

    // Auto-advance if isAdvance is requested OR if amount exceeds the single month deficit
    const shouldAdvance = Boolean(isAdvance || numAmount > remainingDeficit || (alreadyPaid >= requiredFee && numAmount > 0));

    // Handle Advance Payment if enabled or required by amount
    if (shouldAdvance) {
      const finalDist = calculateAdvanceDistribution(
        numAmount,
        numMonth,
        numYear,
        memberMonthlyFee,
        feeSettings.feeSchedule,
        existingPaidMap
      );

      if (!finalDist || finalDist.length === 0) {
        return NextResponse.json(
          {
            error: 'The selected month and subsequent months are already fully paid for this member.',
          },
          { status: 400 }
        );
      }

      if (finalDist.length > 1) {
        // Validate total sum matches amount
        const distSum = finalDist.reduce((s: number, d: any) => s + Math.round(Number(d.amount)), 0);
        if (Math.abs(distSum - numAmount) > 0) {
          finalDist[finalDist.length - 1].amount += (numAmount - distSum);
        }

        const payments = await createAdvancePayments({
          memberId: member.id,
          memberName: member.name,
          totalAmount: numAmount,
          paymentDate: paymentDate.trim(),
          paymentMode: paymentMode || 'Cash',
          notes: notes?.trim() || '',
          recordedBy: session.name || 'Admin',
          distribution: finalDist,
        });

        return NextResponse.json(
          {
            success: true,
            payment: payments[0],
            payments,
            isAdvance: true,
            monthsCovered: payments.length,
          },
          { status: 201 }
        );
      }

      // If advance distribution only covers 1 month after skipping already paid months
      const singleItem = finalDist[0];
      const newPayment = await createPayment({
        memberId: member.id,
        memberName: member.name,
        amount: singleItem.amount,
        paymentDate: paymentDate.trim(),
        forMonth: singleItem.month,
        forYear: singleItem.year,
        paymentMode: paymentMode || 'Cash',
        notes: notes?.trim() || '',
        recordedBy: session.name || 'Admin',
      });

      return NextResponse.json({ success: true, payment: newPayment }, { status: 201 });
    }

    // Standard Single Month Payment (only when amount <= remainingDeficit)
    if (alreadyPaid >= requiredFee) {
      return NextResponse.json(
        {
          error: `This member has already fully paid (₹${alreadyPaid}) for ${MONTH_NAMES[numMonth - 1]} ${numYear}. Duplicate payments are not allowed.`,
          alreadyPaid,
          requiredFee,
        },
        { status: 400 }
      );
    }

    if (numAmount > remainingDeficit) {
      return NextResponse.json(
        {
          error: `Only ₹${remainingDeficit} remains due for ${MONTH_NAMES[numMonth - 1]} ${numYear} (already paid: ₹${alreadyPaid}). Overpaying a single month is not allowed.`,
          alreadyPaid,
          requiredFee,
          remainingDeficit,
        },
        { status: 400 }
      );
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

