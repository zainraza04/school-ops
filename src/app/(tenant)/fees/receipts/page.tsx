'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Download } from 'lucide-react';
import { useReceipts } from '@/hooks/useFees';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { ReceiptPreviewDialog } from '@/components/fees/ReceiptPreview';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaymentMethod, Receipt } from '@/types/fee.types';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank: 'Bank',
  other: 'Other',
};

export default function ReceiptsPage(): ReactNode {
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<Receipt | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useReceipts();

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.receiptNumber.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, debouncedSearch]);

  const columns = useMemo<LegacyColumnDef<Receipt, unknown>[]>(
    () => [
      {
        accessorKey: 'receiptNumber',
        header: 'Receipt No.',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">
            {row.original.receiptNumber}
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: 'studentName',
        header: 'Student',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.studentName}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.studentId}
            </p>
          </div>
        ),
      },
      {
        id: 'class',
        header: 'Class',
        cell: ({ row }) =>
          `${row.original.className}-${row.original.sectionName}`,
      },
      {
        accessorKey: 'feeMonth',
        header: 'Fee Month',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Method',
        cell: ({ row }) => METHOD_LABELS[row.original.paymentMethod],
      },
      {
        accessorKey: 'receivedBy',
        header: 'Received By',
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Download receipt ${row.original.receiptNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              setPreview(row.original);
            }}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Receipts"
        subtitle="Payment receipts issued for fee collections"
        breadcrumb={['Fees', 'Receipts']}
      />

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load receipts. Please try again.
        </div>
      ) : (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by receipt, student, or ID..."
          />
          <DataTable
            data={filtered}
            columns={columns}
            loading={isLoading}
            pagination
            pageSize={25}
            emptyTitle="No receipts found"
            emptyDescription="Collected fees will appear here as receipts."
          />
        </>
      )}

      <ReceiptPreviewDialog
        receipt={preview}
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      />
    </div>
  );
}
