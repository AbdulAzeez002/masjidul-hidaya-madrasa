import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { getMemberSummaries, createMember, getAllMembers, getFeeSettings } from '@/lib/db';


export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all' | 'paid' | 'pending'
    const query = searchParams.get('query')?.toLowerCase().trim() || '';

    let members = await getMemberSummaries();

    if (filter === 'paid') {
      members = members.filter((m) => m.currentMonthPaid);
    } else if (filter === 'pending') {
      members = members.filter((m) => !m.currentMonthPaid || m.pendingBalance > 0);
    }

    if (query) {
      members = members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.phone.includes(query) ||
          m.memberCode.toLowerCase().includes(query) ||
          m.username.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ members });
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
    const { name, phone, address, monthlyFee, joiningDate, username, password, notes, memberCode } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, Username, and Password are required' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const all = await getAllMembers();

    const cleanUsername = username.trim().toLowerCase();
    if (all.some((m) => m.username.toLowerCase() === cleanUsername)) {
      return NextResponse.json(
        { error: `Username "${username.trim()}" is already in use by another member` },
        { status: 400 }
      );
    }

    // Always auto-generate sequential memberCode by the system (NI-101, NI-102...)
    let maxNum = 100;
    for (const m of all) {
      if (m.memberCode && m.memberCode.startsWith('NI-')) {
        const parsed = parseInt(m.memberCode.replace('NI-', ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
    let nextNum = maxNum + 1;
    while (all.some((m) => m.memberCode === `NI-${String(nextNum).padStart(3, '0')}`)) {
      nextNum++;
    }
    const code = `NI-${String(nextNum).padStart(3, '0')}`;

    const feeSettings = await getFeeSettings();
    const rawFee = monthlyFee ? Number(monthlyFee) : feeSettings.currentMonthlyFee;
    const cleanFee = !isNaN(rawFee) && rawFee > 0 ? Math.round(rawFee) : feeSettings.currentMonthlyFee;

    const newMember = await createMember({
      memberCode: code,
      name: name.trim(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      monthlyFee: cleanFee,
      joiningDate: joiningDate || '2026-01',

      username: username.trim(),
      passwordHash,
      plainPasswordHint: password, // kept so admin can view/tell the elder if they forget
      role: 'member',
      status: 'active',
      notes: notes?.trim() || '',
    });

    return NextResponse.json({ success: true, member: newMember }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create member' }, { status: 400 });
  }
}
