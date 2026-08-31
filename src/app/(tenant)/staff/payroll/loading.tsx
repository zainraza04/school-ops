import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function PayrollLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
