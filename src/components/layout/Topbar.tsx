'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { ACADEMIC_SESSIONS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar(): ReactNode {
  const router = useRouter();
  const { user, logout } = useAuth();
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const activeSession = useUiStore((s) => s.activeSession);
  const setActiveSession = useUiStore((s) => s.setActiveSession);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div className="mx-auto flex w-full max-w-md flex-1 justify-center px-2">
        <GlobalSearch className="h-9 w-full max-w-md justify-start gap-2 text-muted-foreground" />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                aria-label="Select academic session"
              />
            }
          >
            <span className="text-xs font-medium sm:text-sm">{activeSession}</span>
            <ChevronDown className="size-3.5 opacity-60" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {ACADEMIC_SESSIONS.map((session) => (
              <DropdownMenuItem
                key={session.id}
                onClick={() => setActiveSession(session.name)}
              >
                {session.name}
                {session.status === 'active' ? ' (Active)' : ''}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="size-4" aria-hidden />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="User menu"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {user ? getInitials(user.name) : '??'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" aria-hidden />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="size-4" aria-hidden />
              School Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" aria-hidden />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
