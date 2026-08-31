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
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
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
