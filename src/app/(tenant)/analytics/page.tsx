'use client';

import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MOCK_ATTENDANCE_TREND,
  MOCK_DASHBOARD,
  MOCK_EXPENSE_BY_CATEGORY,
  MOCK_EXPENSE_CHART,
  MOCK_FEE_CHART,
  MOCK_STUDENTS,
  MOCK_STUDENTS_BY_CLASS,
} from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#6366F1', '#14B8A6'];

const ATTENDANCE_BY_CLASS = [
  { className: 'Class 6', percentage: 93 },
  { className: 'Class 7', percentage: 91 },
  { className: 'Class 8', percentage: 89 },
  { className: 'Class 9', percentage: 88 },
  { className: 'Class 10', percentage: 90 },
];

function formatAxisAmount(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `Rs. ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `Rs. ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  }
  return `Rs. ${value}`;
}

export default function AnalyticsPage(): ReactNode {
  const activeStudents = MOCK_STUDENTS.filter((s) => s.status === 'active').length;
  const withdrawnStudents = MOCK_STUDENTS.filter((s) => s.status === 'withdrawn').length;
  const newAdmissions = MOCK_STUDENTS.filter((s) =>
    s.admissionDate.startsWith('2026-04')
  ).length;

  const expectedFees =
    MOCK_DASHBOARD.monthFeeCollection + MOCK_DASHBOARD.outstandingFees;
  const collectedFees = MOCK_DASHBOARD.monthFeeCollection;

  const feeComparison = [
    { name: 'Expected', amount: expectedFees },
    { name: 'Collected', amount: collectedFees },
  ];

  const feeStatusDonut = [
    { name: 'Paid', value: collectedFees, color: '#10B981' },
    { name: 'Outstanding', value: MOCK_DASHBOARD.outstandingFees, color: '#F43F5E' },
  ];

  const overallAttendance = Math.round(
    (MOCK_DASHBOARD.presentToday /
      (MOCK_DASHBOARD.presentToday + MOCK_DASHBOARD.absentToday)) *
      100
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="Visual insights for students, attendance, fees, and expenses"
        breadcrumb={['Analytics']}
      />

      {/* Students */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Students</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Students"
            value={MOCK_DASHBOARD.totalStudents.toLocaleString('en-PK')}
            icon={Users}
            iconColor="text-primary"
          />
          <MetricCard
            title="Active"
            value={activeStudents.toLocaleString('en-PK')}
            icon={TrendingUp}
            iconColor="text-success"
          />
          <MetricCard
            title="New Admissions"
            value={newAdmissions.toLocaleString('en-PK')}
            icon={UserPlus}
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Withdrawn"
            value={withdrawnStudents.toLocaleString('en-PK')}
            icon={UserMinus}
            iconColor="text-danger"
          />
        </div>
        <Card className="rounded-lg border bg-white shadow-sm ring-0">
          <CardHeader>
            <CardTitle>Students by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_STUDENTS_BY_CLASS}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="className" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" width={40} />
                  <Tooltip
                    formatter={(value): string =>
                      typeof value === 'number' ? String(value) : String(value ?? 0)
                    }
                  />
                  <Bar dataKey="count" name="Students" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Attendance */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Attendance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Overall Attendance"
            value={`${overallAttendance}%`}
            icon={TrendingUp}
            iconColor="text-success"
          />
          <MetricCard
            title="Present Today"
            value={MOCK_DASHBOARD.presentToday.toLocaleString('en-PK')}
            icon={Users}
            iconColor="text-success"
          />
          <MetricCard
            title="Absent Today"
            value={MOCK_DASHBOARD.absentToday.toLocaleString('en-PK')}
            icon={TrendingDown}
            iconColor="text-danger"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-lg border bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle>Attendance Trend (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={MOCK_ATTENDANCE_TREND}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      domain={[70, 100]}
                      tickLine={false}
                      axisLine={false}
                      className="text-xs"
                      width={40}
                      tickFormatter={(v: number): string => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value): string =>
                        `${typeof value === 'number' ? value : Number(value) || 0}%`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      name="Attendance"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle>Attendance by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ATTENDANCE_BY_CLASS}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="className" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      className="text-xs"
                      width={40}
                      tickFormatter={(v: number): string => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value): string =>
                        `${typeof value === 'number' ? value : Number(value) || 0}%`
                      }
                    />
                    <Bar
                      dataKey="percentage"
                      name="Attendance %"
                      fill="#6366F1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Fees */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Fees</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-lg border bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle>Expected vs Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feeComparison}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      tickFormatter={formatAxisAmount}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value): string =>
                        formatCurrency(typeof value === 'number' ? value : Number(value) || 0)
                      }
                    />
                    <Bar dataKey="amount" name="Amount" radius={[6, 6, 0, 0]}>
                      {feeComparison.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.name === 'Collected' ? '#10B981' : '#4F46E5'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <p className="text-muted-foreground">Expected</p>
                  <p className="font-semibold">{formatCurrency(expectedFees)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Collected</p>
                  <p className="font-semibold text-success">
                    {formatCurrency(collectedFees)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle>Paid vs Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feeStatusDonut}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {feeStatusDonut.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value): string =>
                        formatCurrency(typeof value === 'number' ? value : Number(value) || 0)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="rounded-lg border bg-white shadow-sm ring-0">
          <CardHeader>
            <CardTitle>Monthly Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={MOCK_FEE_CHART}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis
                    tickFormatter={formatAxisAmount}
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value): string =>
                      formatCurrency(typeof value === 'number' ? value : Number(value) || 0)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Collected"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4F46E5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Expenses */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Expenses</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-lg border bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={MOCK_EXPENSE_CHART}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis
                      tickFormatter={formatAxisAmount}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value): string =>
                        formatCurrency(typeof value === 'number' ? value : Number(value) || 0)
                      }
                    />
                    <Bar dataKey="amount" name="Expenses" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_EXPENSE_BY_CATEGORY}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {MOCK_EXPENSE_BY_CATEGORY.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value): string =>
                        formatCurrency(typeof value === 'number' ? value : Number(value) || 0)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
