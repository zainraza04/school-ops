import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusValue =
  | 'active'
  | 'inactive'
  | 'graduated'
  | 'withdrawn'
  | 'paid'
  | 'unpaid'
  | 'partial'
  | 'trial'
  | 'draft'
  | 'completed'
  | 'Sent'
  | 'Failed';

interface StatusBadgeProps {
  status: StatusValue | string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  graduated: 'bg-blue-50 text-blue-700 border-blue-200',
  withdrawn: 'bg-orange-50 text-orange-700 border-orange-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  trial: 'bg-violet-50 text-violet-700 border-violet-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  not_sent: 'bg-slate-100 text-slate-600 border-slate-200',
  monthly: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  bi_monthly: 'bg-violet-50 text-violet-700 border-violet-200',
  mid_term: 'bg-blue-50 text-blue-700 border-blue-200',
  mock: 'bg-amber-50 text-amber-800 border-amber-200',
  class_test: 'bg-teal-50 text-teal-700 border-teal-200',
  final: 'bg-rose-50 text-rose-700 border-rose-200',
};

function labelize(status: string): string {
  if (status === 'Sent' || status === 'Failed') return status;
  if (status === 'not_sent') return 'Not sent';
  if (status === 'bi_monthly') return 'Bi-Monthly';
  if (status === 'mid_term') return 'Mid Term';
  if (status === 'class_test') return 'Class Test';
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function StatusBadge({ status, className }: StatusBadgeProps): ReactNode {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border font-medium capitalize',
        STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600',
        className
      )}
    >
      {labelize(status)}
    </Badge>
  );
}
