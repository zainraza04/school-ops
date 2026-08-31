import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function ExamsLoading(): ReactNode {
  return <LoadingState variant="cards" />;
}
