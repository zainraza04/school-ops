import type { ReactNode } from 'react';
import {
  Banknote,
  CircleDollarSign,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from 'lucide-react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { FeeCollectionChart } from '@/components/dashboard/FeeCollectionChart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { StudentsByClassChart } from '@/components/dashboard/StudentsByClassChart';
import { PageHeader } from '@/components/common/PageHeader';
import { MOCK_DASHBOARD } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage(): ReactNode {
  const {
    totalStudents,
    presentToday,
    absentToday,
    totalStaff,
    todayFeeCollection,
    monthFeeCollection,
    outstandingFees,
  } = MOCK_DASHBOARD;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of school operations today" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard
          title="Total Students"
          value={totalStudents.toLocaleString('en-PK')}
          icon={Users}
          iconColor="text-primary"
        />
        <MetricCard
          title="Present Today"
          value={presentToday.toLocaleString('en-PK')}
          icon={UserCheck}
          iconColor="text-success"
        />
        <MetricCard
          title="Absent Today"
          value={absentToday.toLocaleString('en-PK')}
          icon={UserX}
          iconColor="text-danger"
        />
        <MetricCard
          title="Total Staff"
          value={totalStaff.toLocaleString('en-PK')}
          icon={Users}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Today's Fee"
          value={formatCurrency(todayFeeCollection)}
          icon={Banknote}
          iconColor="text-success"
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(monthFeeCollection)}
          icon={Wallet}
          iconColor="text-primary"
        />
        <MetricCard
          title="Outstanding"
          value={formatCurrency(outstandingFees)}
          icon={CircleDollarSign}
          iconColor="text-warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeeCollectionChart />
        </div>
        <AttendanceChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentsByClassChart />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
