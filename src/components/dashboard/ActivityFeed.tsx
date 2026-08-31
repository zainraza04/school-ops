import type { ReactNode } from 'react';
import {
  Banknote,
  ClipboardCheck,
  Receipt,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_ACTIVITY } from '@/lib/mockData';
import { cn, relativeTime } from '@/lib/utils';

type ActivityType = (typeof MOCK_ACTIVITY)[number]['type'];

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  admission: UserPlus,
  fee: Banknote,
  attendance: ClipboardCheck,
  staff: Users,
  expense: Receipt,
};

const ACTIVITY_ICON_COLORS: Record<ActivityType, string> = {
  admission: 'bg-primary/10 text-primary',
  fee: 'bg-success/10 text-success',
  attendance: 'bg-emerald-500/10 text-emerald-600',
  staff: 'bg-blue-500/10 text-blue-600',
  expense: 'bg-warning/10 text-warning',
};

export function ActivityFeed(): ReactNode {
  const items = MOCK_ACTIVITY.slice(0, 8);

  return (
    <Card className="rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => {
            const Icon = ACTIVITY_ICONS[item.type];
            return (
              <li key={item.id} className="flex gap-3">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    ACTIVITY_ICON_COLORS[item.type]
                  )}
                  aria-hidden
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {relativeTime(item.time)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
