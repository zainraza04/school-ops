'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface FeeCollectErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FeeCollectError({
  error,
  reset,
}: FeeCollectErrorProps): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {error.message || 'Failed to load fee collection. Please try again.'}
      </p>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
