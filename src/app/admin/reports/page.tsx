import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/db';
import ReportsClient from './ReportsClient';
import { getCurrentYearMonth } from '@/lib/utils';

export default async function AdminReportsPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const { stats, members } = await getAdminDashboardData();
  const currentPeriod = getCurrentYearMonth();

  return (
    <ReportsClient
      members={members}
      stats={stats}
      currentPeriod={currentPeriod}
    />
  );
}
