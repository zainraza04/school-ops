'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardCheck,
  Banknote,
  Receipt,
  AlertCircle,
  Wallet,
  BookOpen,
  CalendarRange,
  FileText,
  GraduationCap,
  Briefcase,
  HandCoins,
  CircleDollarSign,
  BarChart3,
  LineChart,
  MessageCircle,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useUiStore } from '@/store/uiStore';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Role } from '@/types/auth.types';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  visible: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ROLE_LABELS: Record<Role, string> = {
  saas_admin: 'SaaS Admin',
  owner: 'Owner',
  admin: 'Admin',
  teacher: 'Teacher',
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/students') {
    return (
      pathname === '/students' || /^\/students\/(?!admissions)[^/]+$/.test(pathname)
    );
  }
  if (href === '/fees') return pathname === '/fees';
  if (href === '/staff') {
    return pathname === '/staff' || /^\/staff\/(?!payroll)[^/]+$/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ className }: SidebarProps): ReactNode {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const groups: NavGroup[] = [
    {
      label: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          visible: true,
        },
      ],
    },
    {
      label: 'STUDENTS',
      items: [
        {
          label: 'All Students',
          href: '/students',
          icon: Users,
          visible: can('students', 'view'),
        },
        {
          label: 'Admissions',
          href: '/students/admissions',
          icon: UserPlus,
          visible: can('admissions', 'manage'),
        },
      ],
    },
    {
      label: 'DAILY OPERATIONS',
      items: [
        {
          label: 'Attendance',
          href: '/attendance',
          icon: ClipboardCheck,
          visible: can('attendance', 'view'),
        },
        {
          label: 'Collect Fee',
          href: '/fees/collect',
          icon: Banknote,
          visible: can('fees', 'view'),
        },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        {
          label: 'Fee Management',
          href: '/fees',
          icon: Wallet,
          visible: can('fees', 'view'),
        },
        {
          label: 'Outstanding',
          href: '/fees/outstanding',
          icon: AlertCircle,
          visible: can('fees', 'view'),
        },
        {
          label: 'Receipts',
          href: '/fees/receipts',
          icon: Receipt,
          visible: can('fees', 'view'),
        },
        {
          label: 'Expenses',
          href: '/finance/expenses',
          icon: CircleDollarSign,
          visible: can('expenses', 'view'),
        },
      ],
    },
    {
      label: 'ACADEMICS',
      items: [
        {
          label: 'Classes',
          href: '/academics/classes',
          icon: BookOpen,
          visible: true,
        },
        {
          label: 'Sessions',
          href: '/academics/sessions',
          icon: CalendarRange,
          visible: true,
        },
        {
          label: 'Exams',
          href: '/academics/exams',
          icon: FileText,
          visible: can('exams', 'view'),
        },
        {
          label: 'Results',
          href: '/academics/results',
          icon: GraduationCap,
          visible: can('results', 'view'),
        },
      ],
    },
    {
      label: 'HUMAN RESOURCES',
      items: [
        {
          label: 'Staff',
          href: '/staff',
          icon: Briefcase,
          visible: can('staff', 'view'),
        },
        {
          label: 'Payroll',
          href: '/staff/payroll',
          icon: HandCoins,
          visible: can('payroll', 'view'),
        },
      ],
    },
    {
      label: 'INSIGHTS',
      items: [
        {
          label: 'Reports',
          href: '/reports',
          icon: BarChart3,
          visible: can('reports', 'view'),
        },
        {
          label: 'Analytics',
          href: '/analytics',
          icon: LineChart,
          visible: can('analytics', 'view'),
        },
      ],
    },
    {
      label: 'COMMUNICATION',
      items: [
        {
          label: 'WhatsApp Notifications',
          href: '/notifications',
          icon: MessageCircle,
          visible: true,
        },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          visible: can('settings', 'manage'),
        },
      ],
    },
  ];

  const schoolName = user?.schoolName ?? 'SchoolOps';
  const collapsed = sidebarCollapsed;

  const handleNavClick = (): void => {
    setMobileSidebarOpen(false);
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-3 border-b border-border px-3',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {getInitials(schoolName)}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {schoolName}
            </p>
            <p className="truncate text-xs text-muted-foreground">SchoolOps</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => {
          const visibleItems = group.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleNavClick}
                        aria-label={item.label}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                          collapsed && 'justify-center px-2',
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
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2">
        <div
          className={cn(
            'mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2',
            collapsed && 'justify-center'
          )}
        >
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {user ? getInitials(user.name) : '??'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? 'User'}
              </p>
              {user && (
                <Badge variant="secondary" className="mt-0.5 h-4 text-[10px]">
                  {ROLE_LABELS[user.role]}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator className="mb-2" />

        <div className={cn('flex gap-1', collapsed ? 'flex-col' : 'flex-row')}>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            className={cn(!collapsed && 'flex-1 justify-start')}
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
            {!collapsed && 'Logout'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
