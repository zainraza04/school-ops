import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-muted-foreground',
}: MetricCardProps): ReactNode {
  return (
    <Card className="rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
      <CardContent className="p-5 [--card-spacing:0]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground break-words leading-tight">
              {value}
            </p>
          </div>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/70',
              iconColor
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
