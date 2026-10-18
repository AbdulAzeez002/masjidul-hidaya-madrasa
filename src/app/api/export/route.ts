import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllMembers, getAllPayments, getAllAnnouncements, getFeeSettings } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const members = await getAllMembers();
    const payments = await getAllPayments();
    const announcements = await getAllAnnouncements();
    const feeSettings = await getFeeSettings();

    const backupData = {
      madrasaName: 'Nasruthul Islam',
      branchName: 'Kiyakethala Branch',
      exportedAt: new Date().toISOString(),
      feeSettings,
      members,
      payments,
      announcements,
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `nasruthul_islam_backup_${dateStr}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
