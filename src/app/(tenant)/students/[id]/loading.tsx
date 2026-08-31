import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function StudentDetailLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
