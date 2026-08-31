'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface AnalyticsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({
  error,
  reset,
}: AnalyticsErrorProps): ReactNode {
  return (
    <ErrorState
      message={error.message || 'Failed to load analytics. Please try again.'}
      onRetry={reset}
    />
  );
}
