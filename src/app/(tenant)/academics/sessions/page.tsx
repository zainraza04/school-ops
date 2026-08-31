'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { ACADEMIC_SESSIONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export default function SessionsPage(): ReactNode {
  const [sessions, setSessions] = useState<AcademicSession[]>(() =>
    ACADEMIC_SESSIONS.map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status,
    }))
  );

  function setActive(sessionId: string, name: string): void {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        status: s.id === sessionId ? 'active' : 'inactive',
      }))
    );
    toast.success(`${name} set as active`);
  }

  const columns = useMemo<LegacyColumnDef<AcademicSession, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Session',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => formatDate(row.original.endDate),
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
          const session = row.original;
          if (session.status === 'active') {
            return (
              <span className="text-xs text-muted-foreground">Current</span>
            );
          }
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActive(session.id, session.name)}
            >
              Set as Active
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Academic Sessions"
        subtitle="Switch the active academic year for the school"
        breadcrumb={['Academics', 'Sessions']}
      />
      <DataTable
        data={sessions}
        columns={columns}
        pagination={false}
        emptyTitle="No sessions"
        emptyDescription="Academic sessions will appear here."
      />
    </div>
  );
}
