'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface NotificationsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({
  error,
  reset,
}: NotificationsErrorProps): ReactNode {
  return (
    <ErrorState
      message={
        error.message || 'Failed to load notifications. Please try again.'
      }
      onRetry={reset}
    />
  );
}
