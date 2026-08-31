'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Eye, MoreHorizontal, Pencil, UserX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStudents } from '@/hooks/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StudentStatusBadge } from '@/components/students/StudentStatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CLASSES, SECTIONS, STUDENT_STATUS_LABELS } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import type { Student, StudentStatus } from '@/types/student.types';

type ConfirmAction = 'deactivate' | 'delete';

interface ConfirmState {
  student: Student;
  action: ConfirmAction;
}

export function StudentTable(): ReactNode {
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('all');
  const [sectionId, setSectionId] = useState('all');
  const [status, setStatus] = useState<StudentStatus | 'all'>('all');
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useStudents({
    search: debouncedSearch || undefined,
    classId,
    sectionId,
    status,
  });

  const sectionOptions = useMemo(() => {
    const filtered =
      classId === 'all'
        ? SECTIONS
        : SECTIONS.filter((s) => s.classId === classId);
    return [
      { label: 'All Sections', value: 'all' },
      ...filtered.map((s) => ({ label: s.name, value: s.id })),
    ];
  }, [classId]);

  const columns = useMemo<LegacyColumnDef<Student, unknown>[]>(
    () => [
      {
        accessorKey: 'studentId',
        header: 'Student ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.studentId}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/students/${row.original.id}`}
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'fatherName',
        header: 'Father',
      },
      {
        accessorKey: 'className',
        header: 'Class',
      },
      {
        accessorKey: 'sectionName',
        header: 'Section',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'admissionDate',
        header: 'Admission Date',
        cell: ({ row }) => formatDate(row.original.admissionDate),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/students/${student.id}`}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon-sm' })
                )}
                aria-label={`View ${student.name}`}
              >
                <Eye />
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${student.name}`}
                onClick={() => setEditStudent(student)}
              >
                <Pencil />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`More actions for ${student.name}`}
                    />
                  }
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmState({ student, action: 'deactivate' })
                    }
                  >
                    <UserX />
                    Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      setConfirmState({ student, action: 'delete' })
                    }
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  async function handleConfirm(): Promise<void> {
    if (!confirmState) return;
    setConfirmLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const { student, action } = confirmState;
    if (action === 'deactivate') {
      toast.success(`${student.name} has been deactivated`);
    } else {
      toast.success(`${student.name} has been deleted`);
    }
    setConfirmLoading(false);
    setConfirmState(null);
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load students. Please try again.
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, ID, or father..."
        filters={[
          {
            key: 'class',
            label: 'Class',
            value: classId,
            onChange: (value) => {
              setClassId(value);
              setSectionId('all');
            },
            options: [
              { label: 'All Classes', value: 'all' },
              ...CLASSES.map((c) => ({ label: c.name, value: c.id })),
            ],
          },
          {
            key: 'section',
            label: 'Section',
            value: sectionId,
            onChange: setSectionId,
            options: sectionOptions,
          },
          {
            key: 'status',
            label: 'Status',
            value: status,
            onChange: (value) => setStatus(value as StudentStatus | 'all'),
            options: [
              { label: 'All Statuses', value: 'all' },
              ...Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({
                label,
                value,
              })),
            ],
          },
        ]}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        pagination
        pageSize={25}
        emptyTitle="No students found"
        emptyDescription="Try adjusting your filters, or admit a new student."
      />

      <Sheet
        open={Boolean(editStudent)}
        onOpenChange={(open) => {
          if (!open) setEditStudent(null);
        }}
      >
        <SheetContent side="right" className="sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Edit Student</SheetTitle>
            <SheetDescription>
              Update details for {editStudent?.name}. Full edit form will be
              available here.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">{editStudent?.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {editStudent?.studentId}
              </p>
              <p className="mt-2 text-muted-foreground">
                {editStudent?.className} — Section {editStudent?.sectionName}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                toast.success('Student details saved');
                setEditStudent(null);
              }}
            >
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(confirmState)}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        title={
          confirmState?.action === 'delete'
            ? 'Delete student?'
            : 'Deactivate student?'
        }
        description={
          confirmState?.action === 'delete'
            ? `This will permanently remove ${confirmState.student.name} (${confirmState.student.studentId}). This action cannot be undone.`
            : `This will set ${confirmState?.student.name} to inactive. They will no longer appear in active class lists.`
        }
        confirmLabel={
          confirmState?.action === 'delete' ? 'Delete' : 'Deactivate'
        }
        onConfirm={() => {
          void handleConfirm();
        }}
        isLoading={confirmLoading}
      />
    </div>
  );
}
