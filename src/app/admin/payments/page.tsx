import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAllPayments, getMemberSummaries } from '@/lib/db';
import PaymentsClient from './PaymentsClient';
import { getCurrentYearMonth } from '@/lib/utils';

export default async function AdminPaymentsPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const [[payments, members], currentPeriod] = [
    await Promise.all([getAllPayments(), getMemberSummaries()]),
    getCurrentYearMonth(),
  ];

  return (
    <PaymentsClient
      initialPayments={payments}
      members={members}
      currentPeriod={currentPeriod}
    />
  );
}
