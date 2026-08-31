'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface SaasSchoolsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SaasSchoolsError({
  error,
  reset,
}: SaasSchoolsErrorProps): ReactNode {
  return (
    <ErrorState
      message={error.message || 'Failed to load schools. Please try again.'}
      onRetry={reset}
    />
  );
}
