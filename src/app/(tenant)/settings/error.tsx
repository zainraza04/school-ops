'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface SettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SettingsError({
  error,
  reset,
}: SettingsErrorProps): ReactNode {
  return (
    <ErrorState
      message={error.message || 'Failed to load settings. Please try again.'}
      onRetry={reset}
    />
  );
}
