import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Nasruthul Islam Madrasa Fee Tracker',
  description:
    'Administration and financial records management for Nasruthul Islam Madrasa, Kiyakethala.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
