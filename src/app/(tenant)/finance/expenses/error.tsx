'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface ExpensesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ExpensesError({
  error,
  reset,
}: ExpensesErrorProps): ReactNode {
  return (
    <ErrorState
      message={error.message || 'Failed to load expenses. Please try again.'}
      onRetry={reset}
    />
  );
}
