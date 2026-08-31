'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Building2,
  CircleDollarSign,
  PauseCircle,
  Timer,
  UserCog,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PlatformMetricCard } from '@/components/saas-admin/PlatformMetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import {
  MOCK_SAAS_METRICS,
  MOCK_SCHOOLS,
  MOCK_SCHOOLS_BY_MONTH,
  MOCK_SCHOOLS_BY_PLAN,
} from '@/lib/mockData';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { School } from '@/types/school.types';

const PLAN_COLORS = ['#6366F1', '#4F46E5', '#10B981'];

export default function SaasDashboardPage(): ReactNode {
  const recentSchools = useMemo(
    () =>
      [...MOCK_SCHOOLS]
        .sort((a, b) =>
          (b.registeredDate ?? '').localeCompare(a.registeredDate ?? '')
        )
        .slice(0, 5),
    []
  );

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
        accessorKey: 'totalStudents',
        header: 'Students',
        cell: ({ row }) =>
          row.original.totalStudents.toLocaleString('en-PK'),
      },
      {
        accessorKey: 'registeredDate',
        header: 'Registered',
        cell: ({ row }) =>
          row.original.registeredDate
            ? formatDate(row.original.registeredDate)
            : '—',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        subtitle="SchoolOps SaaS overview across all tenants"
        action={
          <Link href="/saas/schools" className={cn(buttonVariants({ variant: 'outline' }))}>
            View all schools
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <PlatformMetricCard
          title="Total Schools"
          value={MOCK_SAAS_METRICS.totalSchools}
          icon={Building2}
          iconColor="text-primary"
        />
        <PlatformMetricCard
          title="Active"
          value={MOCK_SAAS_METRICS.activeSchools}
          icon={Building2}
          iconColor="text-success"
        />
        <PlatformMetricCard
          title="Trial"
          value={MOCK_SAAS_METRICS.trialSchools}
          icon={Timer}
          iconColor="text-warning"
        />
        <PlatformMetricCard
          title="Inactive"
          value={MOCK_SAAS_METRICS.inactiveSchools}
          icon={PauseCircle}
          iconColor="text-muted-foreground"
        />
        <PlatformMetricCard
          title="Students"
          value={MOCK_SAAS_METRICS.totalStudents.toLocaleString('en-PK')}
          icon={Users}
          iconColor="text-blue-600"
        />
        <PlatformMetricCard
          title="MRR"
          value={formatCurrency(MOCK_SAAS_METRICS.mrr)}
          icon={CircleDollarSign}
          iconColor="text-success"
          subtitle={`${MOCK_SAAS_METRICS.totalStaff.toLocaleString('en-PK')} staff`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border bg-white shadow-sm ring-0">
          <CardHeader>
            <CardTitle>Schools by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_SCHOOLS_BY_PLAN}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {MOCK_SCHOOLS_BY_PLAN.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PLAN_COLORS[index % PLAN_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-white shadow-sm ring-0">
          <CardHeader>
            <CardTitle>New Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_SCHOOLS_BY_MONTH}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" name="Schools" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Schools</h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <UserCog className="size-3.5" aria-hidden />
            Last 5 registrations
          </span>
        </div>
        <DataTable
          data={recentSchools}
          columns={columns}
          pagination={false}
          emptyTitle="No schools yet"
          emptyDescription="Register a school to get started."
        />
      </div>
    </div>
  );
}
