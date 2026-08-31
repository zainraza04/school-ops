import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdmissionsLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
