import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function ReceiptsLoading(): ReactNode {
  return <LoadingState variant="table" rows={8} />;
}
