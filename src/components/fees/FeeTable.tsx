'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { FileText, Wallet } from 'lucide-react';
import { useFees } from '@/hooks/useFees';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ReceiptPreviewDialog } from '@/components/fees/ReceiptPreview';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CLASSES } from '@/lib/constants';
import { MOCK_RECEIPTS } from '@/lib/mockData';
import { cn, formatCurrency, generateReceiptNumber } from '@/lib/utils';
import type { FeeRecord, FeeStatus, Receipt } from '@/types/fee.types';

type StatusTab = 'all' | FeeStatus;

function buildReceiptFromFee(fee: FeeRecord): Receipt {
  const parts = fee.className.split('-');
  const sequence = Number.parseInt(fee.id.replace(/\D/g, ''), 10) || 1;
  return {
    receiptNumber: generateReceiptNumber(sequence),
    studentName: fee.studentName,
    studentId: fee.studentCode,
    className: parts[0] ?? fee.className,
    sectionName: parts[1] ?? '',
    feeMonth: fee.month,
    amount: fee.paidAmount > 0 ? fee.paidAmount : fee.totalAmount,
    paymentMethod: 'cash',
    date: new Date().toISOString().slice(0, 10),
    receivedBy: 'Sana Khan',
    schoolName: 'Green Valley Academy',
    schoolLogo: null,
  };
}

function findReceipt(fee: FeeRecord): Receipt {
  const match = MOCK_RECEIPTS.find(
    (r) => r.studentId === fee.studentCode && r.feeMonth === fee.month
  );
  return match ?? buildReceiptFromFee(fee);
}

export function FeeTable(): ReactNode {
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useFees(statusTab);

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set((data ?? []).map((f) => f.month))).sort();
    return [
      { label: 'All Months', value: 'all' },
      ...months.map((m) => ({ label: m, value: m })),
    ];
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (f) =>
          f.studentName.toLowerCase().includes(q) ||
          f.studentCode.toLowerCase().includes(q)
      );
    }
    if (classFilter !== 'all') {
      const className = CLASSES.find((c) => c.id === classFilter)?.name ?? '';
      rows = rows.filter((f) => f.className.startsWith(className));
    }
    if (monthFilter !== 'all') {
      rows = rows.filter((f) => f.month === monthFilter);
    }
    return rows;
  }, [data, debouncedSearch, classFilter, monthFilter]);

  const columns = useMemo<LegacyColumnDef<FeeRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'studentCode',
        header: 'Student ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.studentCode}
          </span>
        ),
      },
      {
        accessorKey: 'studentName',
        header: 'Student',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.studentName}</span>
        ),
      },
      {
        accessorKey: 'className',
        header: 'Class',
      },
      {
        accessorKey: 'month',
        header: 'Month',
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
      },
      {
        accessorKey: 'paidAmount',
        header: 'Paid',
        cell: ({ row }) => formatCurrency(row.original.paidAmount),
      },
      {
        accessorKey: 'remainingAmount',
        header: 'Remaining',
        cell: ({ row }) => formatCurrency(row.original.remainingAmount),
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
          const fee = row.original;
          const canCollect = fee.remainingAmount > 0;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {canCollect && (
                <Link
                  href={`/fees/collect?student=${fee.studentId}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' })
                  )}
                  aria-label={`Collect fee for ${fee.studentName}`}
                >
                  <Wallet className="size-3.5" />
                  Collect
                </Link>
              )}
              <Button
                type="button"
                variant={canCollect ? 'ghost' : 'outline'}
                size="sm"
                aria-label={`View receipt for ${fee.studentName}`}
                onClick={() => setPreviewReceipt(findReceipt(fee))}
              >
                <FileText className="size-3.5" />
                Receipt
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load fees. Please try again.
      </div>
    );
  }

  return (
    <div>
      <Tabs
        value={statusTab}
        onValueChange={(value) => {
          if (
            value === 'all' ||
            value === 'paid' ||
            value === 'unpaid' ||
            value === 'partial'
          ) {
            setStatusTab(value);
          }
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="partial">Partial</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name or ID..."
        filters={[
          {
            key: 'class',
            label: 'Class',
            value: classFilter,
            onChange: setClassFilter,
            options: [
              { label: 'All Classes', value: 'all' },
              ...CLASSES.map((c) => ({ label: c.name, value: c.id })),
            ],
          },
          {
            key: 'month',
            label: 'Month',
            value: monthFilter,
            onChange: setMonthFilter,
            options: monthOptions,
          },
        ]}
      />

      <DataTable
        data={filtered}
        columns={columns}
        loading={isLoading}
        pagination
        pageSize={25}
        emptyTitle="No fee records found"
        emptyDescription="Try adjusting your filters or status tab."
      />

      <ReceiptPreviewDialog
        receipt={previewReceipt}
        open={Boolean(previewReceipt)}
        onOpenChange={(open) => {
          if (!open) setPreviewReceipt(null);
        }}
      />
    </div>
  );
}
