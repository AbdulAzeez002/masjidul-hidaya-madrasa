import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAllAnnouncements } from '@/lib/db';
import AnnouncementsClient from './AnnouncementsClient';

export default async function AdminAnnouncementsPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const announcements = await getAllAnnouncements();

  return <AnnouncementsClient initialAnnouncements={announcements} />;
}
