import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDashboardStats, getMemberSummaries } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';
import { getCurrentYearMonth } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/member');
  }

  const stats = await getDashboardStats();
  const members = await getMemberSummaries();
  const currentPeriod = getCurrentYearMonth();

  return (
    <AdminDashboardClient
      initialStats={stats}
      members={members}
      currentPeriod={currentPeriod}
      adminUser={session}
    />
  );
}
