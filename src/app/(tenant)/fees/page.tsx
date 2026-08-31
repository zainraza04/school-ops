import type { ReactNode } from 'react';
import Link from 'next/link';
import { Banknote, CircleAlert, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FeeTable } from '@/components/fees/FeeTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { buttonVariants } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';

export default function FeesPage(): ReactNode {
  return (
    <div>
      <PageHeader
        title="Fees"
        subtitle="Track fee collection across all classes"
        breadcrumb={['Fees']}
        action={
          <Link href="/fees/collect" className={cn(buttonVariants())}>
            <Wallet className="size-4" />
            Collect Fee
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Expected"
          value={formatCurrency(3_200_000)}
          icon={Banknote}
          iconColor="text-primary"
        />
        <MetricCard
          title="Collected"
          value={formatCurrency(2_450_000)}
          icon={Wallet}
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Outstanding"
          value={formatCurrency(750_000)}
          icon={CircleAlert}
          iconColor="text-rose-500"
        />
      </div>

      <FeeTable />
    </div>
  );
}
