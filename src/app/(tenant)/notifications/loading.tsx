import type { ReactNode } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export default function NotificationsLoading(): ReactNode {
  return <LoadingState variant="page" />;
}
