import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function AnalyticsLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
