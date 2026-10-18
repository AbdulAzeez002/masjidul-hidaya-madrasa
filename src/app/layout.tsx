import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ | Fee Tracker',
  description:
    'Monthly subscription and dues tracking portal for Nasruthul Islam Madrasa, Kiyakethala Branch.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#064e3b',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar currentUser={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
