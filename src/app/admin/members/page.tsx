import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getMemberSummaries } from '@/lib/db';
import MembersClient from './MembersClient';
import { getCurrentYearMonth } from '@/lib/utils';

export default async function AdminMembersPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const members = await getMemberSummaries();
  const currentPeriod = getCurrentYearMonth();

  return <MembersClient initialMembers={members} currentPeriod={currentPeriod} />;
}
