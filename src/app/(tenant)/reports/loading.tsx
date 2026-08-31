import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function ReportsLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
