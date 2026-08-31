'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface SchoolDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SchoolDetailError({
  error,
  reset,
}: SchoolDetailErrorProps): ReactNode {
  return (
    <ErrorState
      message={
        error.message || 'Failed to load school details. Please try again.'
      }
      onRetry={reset}
    />
  );
}
