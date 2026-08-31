'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStaff } from '@/hooks/useStaff';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { StaffForm } from '@/components/staff/StaffForm';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Staff, StaffRole, StaffStatus } from '@/types/staff.types';
import type { StaffFormValues } from '@/lib/validators/staff.schema';

export function StaffTable(): ReactNode {
  const { data, isLoading, isError } = useStaff();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<StaffRole | 'all'>('all');
  const [status, setStatus] = useState<StaffStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [deleteStaff, setDeleteStaff] = useState<Staff | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    const list = (data ?? []).filter((s) => !removedIds.includes(s.id));
    const q = debouncedSearch.trim().toLowerCase();
    return list.filter((s) => {
      if (role !== 'all' && s.role !== role) return false;
      if (status !== 'all' && s.status !== status) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.designation.toLowerCase().includes(q)
      );
    });
  }, [data, debouncedSearch, role, status, removedIds]);

  const editDefaults: Partial<StaffFormValues> | undefined = editStaff
    ? {
        name: editStaff.name,
        phone: editStaff.phone,
        designation: editStaff.designation,
        role: editStaff.role,
        joiningDate: editStaff.joiningDate,
        salary: editStaff.salary,
        status: editStaff.status,
        createAccount: Boolean(editStaff.email),
        email: editStaff.email ?? '',
      }
    : undefined;

  const columns = useMemo<LegacyColumnDef<Staff, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            {row.original.email && (
              <p className="text-xs text-muted-foreground">
                {row.original.email}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'designation',
        header: 'Designation',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span className="capitalize">{row.original.role}</span>
        ),
      },
      {
        accessorKey: 'joiningDate',
        header: 'Joined',
        cell: ({ row }) => formatDate(row.original.joiningDate),
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => formatCurrency(row.original.salary),
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
          const staff = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${staff.name}`}
                onClick={() => {
                  setEditStaff(staff);
                  setFormOpen(true);
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${staff.name}`}
                onClick={() => setDeleteStaff(staff)}
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  async function handleDelete(): Promise<void> {
    if (!deleteStaff) return;
    setConfirmLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setRemovedIds((prev) => [...prev, deleteStaff.id]);
    toast.success(`${deleteStaff.name} removed`);
    setConfirmLoading(false);
    setDeleteStaff(null);
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load staff. Please try again.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage teachers and school administrators"
        breadcrumb={['Staff']}
        action={
          <Button
            onClick={() => {
              setEditStaff(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Staff
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, phone, or designation..."
        filters={[
          {
            key: 'role',
            label: 'Role',
            value: role,
            onChange: (value) => setRole(value as StaffRole | 'all'),
            options: [
              { label: 'All Roles', value: 'all' },
              { label: 'Teacher', value: 'teacher' },
              { label: 'Admin', value: 'admin' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: status,
            onChange: (value) => setStatus(value as StaffStatus | 'all'),
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
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
        emptyTitle="No staff found"
        emptyDescription="Try adjusting your filters, or add a new staff member."
      />

      <StaffForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditStaff(null);
        }}
        defaultValues={editDefaults}
      />

      <ConfirmDialog
        open={Boolean(deleteStaff)}
        onOpenChange={(open) => {
          if (!open) setDeleteStaff(null);
        }}
        title="Delete staff member?"
        description={
          deleteStaff
            ? `This will permanently remove ${deleteStaff.name}. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={() => {
          void handleDelete();
        }}
        isLoading={confirmLoading}
      />
    </div>
  );
}
