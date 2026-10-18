import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberSummaries, getDashboardStats } from '@/lib/db';
import ReportsClient from './ReportsClient';
import { getCurrentYearMonth } from '@/lib/utils';

export default async function AdminReportsPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const members = await getMemberSummaries();
  const stats = await getDashboardStats();
  const currentPeriod = getCurrentYearMonth();

  return (
    <ReportsClient
      members={members}
      stats={stats}
      currentPeriod={currentPeriod}
    />
  );
}
