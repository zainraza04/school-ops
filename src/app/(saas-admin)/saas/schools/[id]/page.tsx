'use client';

import { use, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { MOCK_ACTIVITY, MOCK_SCHOOLS } from '@/lib/mockData';
import { cn, formatCurrency, formatDate, relativeTime } from '@/lib/utils';
import type { SubscriptionPlan } from '@/types/school.types';

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  basic: 15000,
  professional: 35000,
  premium: 65000,
};

interface SchoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SchoolDetailPage({
  params,
}: SchoolDetailPageProps): ReactNode {
  const { id } = use(params);
  const school = MOCK_SCHOOLS.find((s) => s.id === id);
  const [status, setStatus] = useState(school?.status);

  if (!school) {
    notFound();
  }

  const activity = MOCK_ACTIVITY.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title={school.name}
        subtitle={school.email}
        breadcrumb={['Schools', school.name]}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/saas/schools"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {status !== 'active' && (
              <Button
                onClick={() => {
                  setStatus('active');
                  toast.success(`${school.name} activated`);
                }}
              >
                Activate School
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit rounded-lg border bg-white shadow-sm ring-0">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base">{school.name}</CardTitle>
              <div className="mt-2">
                <StatusBadge status={status ?? school.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {school.address}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0" aria-hidden />
              {school.phone}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0" aria-hidden />
              {school.email}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4 shrink-0" aria-hidden />
              {school.ownerName} ({school.ownerEmail})
            </p>
            <div className="flex gap-4 border-t pt-3">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-muted-foreground" aria-hidden />
                {school.totalStudents.toLocaleString('en-PK')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserCog className="size-3.5 text-muted-foreground" aria-hidden />
                {school.totalStaff.toLocaleString('en-PK')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-xl border bg-white shadow-sm ring-0">
                <CardContent className="p-5">
                  <p className="text-2xl font-bold">
                    {school.totalStudents.toLocaleString('en-PK')}
                  </p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border bg-white shadow-sm ring-0">
                <CardContent className="p-5">
                  <p className="text-2xl font-bold">
                    {school.totalStaff.toLocaleString('en-PK')}
                  </p>
                  <p className="text-sm text-muted-foreground">Staff</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border bg-white shadow-sm ring-0">
                <CardContent className="p-5">
                  <p className="text-2xl font-bold">
                    {SUBSCRIPTION_PLANS[school.plan]}
                  </p>
                  <p className="text-sm text-muted-foreground">Current plan</p>
                </CardContent>
              </Card>
            </div>
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>School details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Website</p>
                  <p className="font-medium">
                    {school.website || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {school.registeredDate
                      ? formatDate(school.registeredDate)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium">{school.ownerName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner email</p>
                  <p className="font-medium">{school.ownerEmail ?? '—'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-4">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-lg font-semibold">
                      {SUBSCRIPTION_PLANS[school.plan]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(PLAN_PRICES[school.plan])}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={status ?? school.status} />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-sm text-muted-foreground">Start date</p>
                      <p className="font-medium">
                        {formatDate(school.planStartDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="text-sm text-muted-foreground">Renewal date</p>
                      <p className="font-medium">
                        {formatDate(school.planRenewalDate)}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success('Plan change request noted for this school')
                  }
                >
                  Change plan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {activity.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.description}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                          {item.type}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {relativeTime(item.time)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
