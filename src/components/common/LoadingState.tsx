import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  variant?: 'table' | 'cards' | 'page' | 'chart';
  rows?: number;
}

export function LoadingState({
  variant = 'page',
  rows = 5,
}: LoadingStateProps): ReactNode {
  if (variant === 'cards') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return <Skeleton className="h-72 w-full rounded-lg" />;
  }

  if (variant === 'table') {
    return (
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <div className="border-b border-border/60 bg-slate-50/90 px-4 py-3.5">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
