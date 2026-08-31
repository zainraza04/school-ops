import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function SaasSubscriptionsLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
