import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { StudentStatus } from '@/types/student.types';

interface StudentStatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export function StudentStatusBadge({
  status,
  className,
}: StudentStatusBadgeProps): ReactNode {
  return <StatusBadge status={status} className={className} />;
}
