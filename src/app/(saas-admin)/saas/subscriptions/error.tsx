'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface SaasSubscriptionsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SaasSubscriptionsError({
  error,
  reset,
}: SaasSubscriptionsErrorProps): ReactNode {
  return (
    <ErrorState
      message={
        error.message || 'Failed to load subscriptions. Please try again.'
      }
      onRetry={reset}
    />
  );
}
