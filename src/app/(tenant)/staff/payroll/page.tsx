'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePayroll } from '@/hooks/useStaff';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AppSelect } from '@/components/common/AppSelect';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PayrollRecord } from '@/types/staff.types';

const MONTH_OPTIONS = [
  'August 2026',
  'July 2026',
  'June 2026',
] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PayrollPage(): ReactNode {
  const [month, setMonth] = useState<string>(MONTH_OPTIONS[0]);
  const { data, isLoading, isError } = usePayroll(month);

  const [overrides, setOverrides] = useState<Record<string, PayrollRecord>>({});
  const [paying, setPaying] = useState<PayrollRecord | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [saving, setSaving] = useState(false);

  const records = useMemo(() => {
    return (data ?? []).map((r) => overrides[r.id] ?? r);
  }, [data, overrides]);

  const summary = useMemo(() => {
    const total = records.reduce((sum, r) => sum + r.basicSalary, 0);
    const paid = records
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const unpaid = records
      .filter((r) => r.status === 'unpaid')
      .reduce((sum, r) => sum + r.basicSalary, 0);
    return { total, paid, unpaid };
  }, [records]);

  function openMarkPaid(record: PayrollRecord): void {
    setPaying(record);
    setPaidAmount(String(record.basicSalary));
    setPaymentDate(todayIso());
  }

  async function handleMarkPaid(): Promise<void> {
    if (!paying) return;
    const amount = Number(paidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    if (!paymentDate) {
      toast.error('Payment date is required');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setOverrides((prev) => ({
      ...prev,
      [paying.id]: {
        ...paying,
        paidAmount: amount,
        paymentDate,
        status: 'paid',
      },
    }));
    toast.success(`Marked ${paying.staffName} as paid`);
    setSaving(false);
    setPaying(null);
  }

  const columns = useMemo<LegacyColumnDef<PayrollRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'staffName',
        header: 'Staff',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.staffName}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {row.original.role}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'basicSalary',
        header: 'Basic Salary',
        cell: ({ row }) => formatCurrency(row.original.basicSalary),
      },
      {
        accessorKey: 'salaryMonth',
        header: 'Month',
      },
      {
        accessorKey: 'paidAmount',
        header: 'Paid',
        cell: ({ row }) =>
          row.original.status === 'paid'
            ? formatCurrency(row.original.paidAmount)
            : '—',
      },
      {
        accessorKey: 'paymentDate',
        header: 'Payment Date',
        cell: ({ row }) =>
          row.original.paymentDate
            ? formatDate(row.original.paymentDate)
            : '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const record = row.original;
          if (record.status === 'paid') {
            return (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Paid
              </span>
            );
          }
          return (
            <Button size="sm" variant="outline" onClick={() => openMarkPaid(record)}>
              Mark as Paid
            </Button>
          );
        },
      },
    ],
    []
  );

  if (isError) {
    return (
      <div>
        <PageHeader
          title="Payroll"
          subtitle="Track and record monthly staff salaries"
          breadcrumb={['Staff', 'Payroll']}
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load payroll. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="Track and record monthly staff salaries"
        breadcrumb={['Staff', 'Payroll']}
        action={
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span className="sr-only">Salary month</span>
            <AppSelect
              value={month}
              onValueChange={(v) => {
                setMonth(v);
                setOverrides({});
              }}
              aria-label="Salary month"
              placeholder="Select month"
              options={MONTH_OPTIONS.map((m) => ({
                value: m,
                label: m,
              }))}
            />
          </label>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Payroll"
          value={formatCurrency(summary.total)}
          icon={Wallet}
          iconColor="text-primary"
        />
        <MetricCard
          title="Paid"
          value={formatCurrency(summary.paid)}
          icon={CircleDollarSign}
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Unpaid"
          value={formatCurrency(summary.unpaid)}
          icon={Banknote}
          iconColor="text-rose-600"
        />
      </div>

      <DataTable
        data={records}
        columns={columns}
        loading={isLoading}
        pagination={false}
        emptyTitle="No payroll records"
        emptyDescription={`No salary records for ${month}.`}
      />

      <Dialog
        open={Boolean(paying)}
        onOpenChange={(open) => {
          if (!open) setPaying(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              Record payment for {paying?.staffName} — {paying?.salaryMonth}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pay-amount">Amount (Rs.)</Label>
              <Input
                id="pay-amount"
                type="number"
                min={1}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-date">Payment date</Label>
              <Input
                id="pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaying(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleMarkPaid()} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
