'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  CreditCard,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SaasAdminSidebarProps {
  className?: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/saas/dashboard', icon: LayoutDashboard },
  { label: 'Schools', href: '/saas/schools', icon: School },
  { label: 'Subscriptions', href: '/saas/subscriptions', icon: CreditCard },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/saas/dashboard') return pathname === '/saas/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SaasAdminSidebar({ className }: SaasAdminSidebarProps): ReactNode {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-r border-border bg-card',
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-4" aria-hidden />
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">
          SchoolOps Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    active &&
                      'bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary"
                      aria-hidden
                    />
                  )}
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2.5 px-1 py-1">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {getInitials('Zain')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">Zain</p>
            <Badge variant="secondary" className="mt-0.5 h-4 text-[10px]">
              SaaS Admin
            </Badge>
          </div>
        </div>
        <Separator className="mb-2" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={logout}
          aria-label="Sign out"
        >
          <LogOut className="size-4" aria-hidden />
          Logout
        </Button>
      </div>
    </aside>
  );
}
