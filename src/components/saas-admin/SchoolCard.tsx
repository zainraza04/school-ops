import type { ReactNode } from 'react';
import Link from 'next/link';
import { Building2, Users, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { School } from '@/types/school.types';

interface SchoolCardProps {
  school: School;
}

export function SchoolCard({ school }: SchoolCardProps): ReactNode {
  return (
    <Link href={`/saas/schools/${school.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="rounded-lg border bg-white shadow-sm ring-0">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{school.name}</CardTitle>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {school.ownerName ?? school.email}
              </p>
            </div>
          </div>
          <StatusBadge status={school.status} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
              {SUBSCRIPTION_PLANS[school.plan]}
            </span>
            {school.registeredDate && (
              <span>Registered {formatDate(school.registeredDate)}</span>
            )}
          </div>
          <div className="flex gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-3.5" aria-hidden />
              {school.totalStudents.toLocaleString('en-PK')} students
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <UserCog className="size-3.5" aria-hidden />
              {school.totalStaff.toLocaleString('en-PK')} staff
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
