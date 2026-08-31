'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useUiStore } from '@/store/uiStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function BlockedPermissionToast(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('blocked') === 'true') {
      toast.error('You do not have permission to access that page.');
    }
  }, [searchParams]);

  return null;
}

export default function TenantLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <Suspense fallback={null}>
        <BlockedPermissionToast />
      </Suspense>

      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-60 max-w-[85vw] p-0 sm:max-w-60"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>School navigation menu</SheetDescription>
          </SheetHeader>
          <Sidebar className="w-full border-r-0" />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-4">{children}</main>
      </div>
    </div>
  );
}
