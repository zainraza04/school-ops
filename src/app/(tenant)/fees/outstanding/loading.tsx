import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function OutstandingFeesLoading(): ReactNode {
  return <LoadingState variant="table" rows={8} />;
}
