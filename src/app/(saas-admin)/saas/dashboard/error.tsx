'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface SaasDashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SaasDashboardError({
  error,
  reset,
}: SaasDashboardErrorProps): ReactNode {
  return (
    <ErrorState
      message={
        error.message || 'Failed to load platform dashboard. Please try again.'
      }
      onRetry={reset}
    />
  );
}
