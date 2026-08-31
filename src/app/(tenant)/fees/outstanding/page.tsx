'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { MessageCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useOutstandingFees } from '@/hooks/useFees';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MOCK_STUDENTS } from '@/lib/mockData';
import { CLASSES } from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import type { FeeRecord } from '@/types/fee.types';

function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.startsWith('92')) return digits;
  return `92${digits}`;
}

function studentPhone(studentId: string): string | null {
  return MOCK_STUDENTS.find((s) => s.id === studentId)?.phone ?? null;
}

function openWhatsAppReminder(fee: FeeRecord): void {
  const phone = studentPhone(fee.studentId);
  if (!phone) {
    toast.error('No phone number on file for this student');
    return;
  }
  const text = encodeURIComponent(
    `Assalam-o-Alaikum. Reminder from Green Valley Academy: fee of ${formatCurrency(fee.remainingAmount)} is outstanding for ${fee.studentName} (${fee.month}). Please clear dues at your earliest convenience. JazakAllah.`
  );
  window.open(
    `https://wa.me/${toWhatsAppNumber(phone)}?text=${text}`,
    '_blank',
    'noopener,noreferrer'
  );
}

export default function OutstandingFeesPage(): ReactNode {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useOutstandingFees();

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
    return rows;
  }, [data, debouncedSearch, classFilter]);

  const toggleOne = useCallback((id: string, checked: boolean): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean): void => {
      if (checked) {
        setSelectedIds(new Set(filtered.map((f) => f.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [filtered]
  );

  function sendBulkReminders(): void {
    const selected = filtered.filter((f) => selectedIds.has(f.id));
    if (selected.length === 0) {
      toast.error('Select at least one student');
      return;
    }
    selected.forEach((fee) => openWhatsAppReminder(fee));
    toast.success(`Opened WhatsApp for ${selected.length} reminder(s)`);
  }

  const allSelected =
    filtered.length > 0 && filtered.every((f) => selectedIds.has(f.id));

  const columns = useMemo<LegacyColumnDef<FeeRecord, unknown>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => toggleAll(Boolean(checked))}
            aria-label="Select all outstanding fees"
          />
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.has(row.original.id)}
            onCheckedChange={(checked) =>
              toggleOne(row.original.id, Boolean(checked))
            }
            aria-label={`Select ${row.original.studentName}`}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
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
        accessorKey: 'remainingAmount',
        header: 'Outstanding',
        cell: ({ row }) => (
          <span className="font-semibold text-rose-700">
            {formatCurrency(row.original.remainingAmount)}
          </span>
        ),
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
          return (
            <div
              className="flex flex-wrap items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/fees/collect?student=${fee.studentId}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                aria-label={`Collect fee for ${fee.studentName}`}
              >
                <Wallet className="size-3.5" />
                Collect
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`WhatsApp reminder for ${fee.studentName}`}
                onClick={() => openWhatsAppReminder(fee)}
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </Button>
            </div>
          );
        },
      },
    ],
    [allSelected, selectedIds, toggleAll, toggleOne]
  );

  return (
    <div>
      <PageHeader
        title="Outstanding Fees"
        subtitle="Students with unpaid or partial dues"
        breadcrumb={['Fees', 'Outstanding']}
        action={
          <Button
            type="button"
            onClick={sendBulkReminders}
            disabled={selectedIds.size === 0}
          >
            <MessageCircle className="size-4" />
            Send WhatsApp Reminders
            {selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </Button>
        }
      />

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load outstanding fees. Please try again.
        </div>
      ) : (
        <>
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
            ]}
          />
          <DataTable
            data={filtered}
            columns={columns}
            loading={isLoading}
            pagination
            pageSize={25}
            emptyTitle="No outstanding fees"
            emptyDescription="All fee dues are cleared for the current filters."
          />
        </>
      )}
    </div>
  );
}
