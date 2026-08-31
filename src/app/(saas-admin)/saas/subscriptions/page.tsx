'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { MOCK_SCHOOLS, MOCK_SCHOOLS_BY_PLAN } from '@/lib/mockData';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { School, SubscriptionPlan } from '@/types/school.types';

interface PlanCard {
  key: SubscriptionPlan;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

const PLANS: PlanCard[] = [
  {
    key: 'basic',
    name: 'Basic',
    price: 15000,
    features: [
      'Students & admissions',
      'Attendance marking',
      'Fee collection & receipts',
      'WhatsApp notifications',
      'Basic reports',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    price: 35000,
    highlighted: true,
    features: [
      'Everything in Basic',
      'Exams & results',
      'Staff & payroll',
      'Expense tracking',
      'Analytics dashboard',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 65000,
    features: [
      'Everything in Professional',
      'Higher student limits',
      'Priority support',
      'Custom branding',
      'Advanced exports',
    ],
  },
];

function schoolCountForPlan(plan: SubscriptionPlan): number {
  const fromChart = MOCK_SCHOOLS_BY_PLAN.find(
    (p) => p.name.toLowerCase() === plan || p.name === SUBSCRIPTION_PLANS[plan]
  );
  if (fromChart) return fromChart.value;
  return MOCK_SCHOOLS.filter((s) => s.plan === plan).length;
}

export default function SaasSubscriptionsPage(): ReactNode {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_SCHOOLS.filter((s) => {
      if (planFilter !== 'all' && s.plan !== planFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.ownerName ?? '').toLowerCase().includes(q)
      );
    });
  }, [search, planFilter, statusFilter]);

  const columns = useMemo<LegacyColumnDef<School, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'School',
        cell: ({ row }) => (
          <Link
            href={`/saas/schools/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ row }) => SUBSCRIPTION_PLANS[row.original.plan],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'planRenewalDate',
        header: 'Renewal',
        cell: ({ row }) => formatDate(row.original.planRenewalDate),
      },
      {
        accessorKey: 'totalStudents',
        header: 'Students',
        cell: ({ row }) =>
          row.original.totalStudents.toLocaleString('en-PK'),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        subtitle="Platform plans and school subscription assignments"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const count = schoolCountForPlan(plan.key);
          return (
            <Card
              key={plan.key}
              className={cn(
                'rounded-lg border bg-white shadow-sm ring-0',
                plan.highlighted && 'border-primary ring-1 ring-primary/20'
              )}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted && (
                    <Badge className="bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  )}
                </div>
                <p>
                  <span className="text-3xl font-bold tracking-tight">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {count} school{count === 1 ? '' : 's'} on this plan
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Schools by subscription</h2>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search schools…"
          filters={[
            {
              key: 'plan',
              label: 'Plan',
              value: planFilter,
              onChange: setPlanFilter,
              options: [
                { label: 'All Plans', value: 'all' },
                { label: 'Basic', value: 'basic' },
                { label: 'Professional', value: 'professional' },
                { label: 'Premium', value: 'premium' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Trial', value: 'trial' },
                { label: 'Inactive', value: 'inactive' },
              ],
            },
          ]}
        />
        <DataTable
          data={filtered}
          columns={columns}
          pagination
          pageSize={25}
          emptyTitle="No schools on this filter"
          emptyDescription="Try a different plan or status."
        />
      </div>
    </div>
  );
}
