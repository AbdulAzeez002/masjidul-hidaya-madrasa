import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/db';
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

  const [{ stats, members }, currentPeriod] = [
    await getAdminDashboardData(),
    getCurrentYearMonth(),
  ];

  return (
    <AdminDashboardClient
      initialStats={stats}
      members={members}
      currentPeriod={currentPeriod}
      adminUser={session}
    />
  );
}
