import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginPage from './login/page';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/member');
    }
  }

  return <LoginPage />;
}
