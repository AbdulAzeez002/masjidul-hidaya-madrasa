import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberSummaryById, getPaymentsByMember, getAllAnnouncements } from '@/lib/db';
import MemberDashboardClient from './MemberDashboardClient';
import { getCurrentYearMonth } from '@/lib/utils';

export default async function MemberPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // If admin visits /member, redirect to /admin
  if (session.role === 'admin') {
    redirect('/admin');
  }

  const [[memberSummary, payments, announcements], currentPeriod] = [
    await Promise.all([
      getMemberSummaryById(session.id),
      getPaymentsByMember(session.id),
      getAllAnnouncements(),
    ]),
    getCurrentYearMonth(),
  ];

  if (!memberSummary) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Member account not found.</h2>
        <p className="text-gray-600 mt-2">Please contact the Madrasa administrator.</p>
      </div>
    );
  }

  return (
    <MemberDashboardClient
      member={memberSummary}
      payments={payments}
      announcements={announcements}
      currentPeriod={currentPeriod}
    />
  );
}
