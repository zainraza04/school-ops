'use client';

import { useState, type ReactNode } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy';
import type { RowData, SortingState } from '@tanstack/table-core';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<T extends RowData> {
  data: T[];
  columns: LegacyColumnDef<T, unknown>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

function SortIndicator({
  direction,
}: {
  direction: false | 'asc' | 'desc';
}): ReactNode {
  if (direction === 'asc') {
    return <ArrowUp className="size-3.5 shrink-0 text-primary" aria-hidden />;
  }
  if (direction === 'desc') {
    return <ArrowDown className="size-3.5 shrink-0 text-primary" aria-hidden />;
  }
  return (
    <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
  );
}

export function DataTable<T extends RowData>({
  data,
  columns,
  loading = false,
  onRowClick,
  pagination = true,
  pageSize = 25,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your filters or search.',
}: DataTableProps<T>): ReactNode {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useLegacyTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <div className="border-b border-border/60 bg-slate-50/90 px-4 py-3.5">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-0 divide-y divide-border/50 p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageRows = table.getRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = pageIndex * pageSize + pageRows;

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();

                return (
                  <TableHead
                    key={header.id}
                    className={cn(canSort && 'cursor-pointer select-none')}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && <SortIndicator direction={sorted} />}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {pageCount > 1 ? (
              <>
                Showing <span className="font-medium text-foreground">{from}</span>
                –
                <span className="font-medium text-foreground">{to}</span> of{' '}
                <span className="font-medium text-foreground">{totalRows}</span>{' '}
                records
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{totalRows}</span>{' '}
                {totalRows === 1 ? 'record' : 'records'}
              </>
            )}
          </p>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft />
                Prev
              </Button>
              <span className="min-w-[5rem] text-center text-sm font-medium text-foreground">
                {pageIndex + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
