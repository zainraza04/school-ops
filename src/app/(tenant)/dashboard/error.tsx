'use client';

import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({
  error,
  reset,
}: DashboardErrorProps): ReactNode {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-danger" aria-hidden />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || 'Failed to load the dashboard. Please try again.'}
        </p>
      </div>
      <Button type="button" onClick={reset} aria-label="Try again">
        Try again
      </Button>
    </div>
  );
}
