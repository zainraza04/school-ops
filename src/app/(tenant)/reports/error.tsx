'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface ReportsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReportsError({
  error,
  reset,
}: ReportsErrorProps): ReactNode {
  return (
    <ErrorState
      message={error.message || 'Failed to load reports. Please try again.'}
      onRetry={reset}
    />
  );
}
