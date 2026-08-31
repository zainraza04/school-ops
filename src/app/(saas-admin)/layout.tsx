'use client';

import type { ReactNode } from 'react';
import { SaasAdminSidebar } from '@/components/layout/SaasAdminSidebar';

export default function SaasAdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <SaasAdminSidebar />
      <main className="flex-1 overflow-y-auto px-6 py-4">{children}</main>
    </div>
  );
}
