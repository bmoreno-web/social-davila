import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'CLIENT') {
    redirect('/portal');
  }

  return (
    <div className="flex min-h-screen bg-[#07090e] print:bg-white print:block">
      <div className="print:hidden">
        <Sidebar user={session} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 print:block print:w-full print:p-0 print:m-0">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
