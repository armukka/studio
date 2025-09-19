import type { Metadata } from 'next';
import Header from '@/components/header';
import { InactivityProvider } from '@/components/inactivity-provider';

export const metadata: Metadata = {
  title: 'Dashboard | CipherMail',
  description: 'Send secure emails',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InactivityProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </InactivityProvider>
  );
}
