import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function FeesLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
