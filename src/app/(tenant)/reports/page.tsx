'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AppSelect } from '@/components/common/AppSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CLASSES, EXPENSE_CATEGORIES } from '@/lib/constants';
import {
  MOCK_EXPENSES,
  MOCK_FEES,
  MOCK_STUDENTS,
} from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';

type ReportDomain = 'student' | 'attendance' | 'fee' | 'expense';

interface PreviewRow {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

const STUDENT_TYPES = [
  { value: 'all', label: 'All students' },
  { value: 'active', label: 'Active students' },
  { value: 'admissions', label: 'New admissions' },
  { value: 'withdrawn', label: 'Withdrawn students' },
  { value: 'by_class', label: 'Students by class/section' },
] as const;

const ATTENDANCE_TYPES = [
  { value: 'daily', label: 'Daily attendance' },
  { value: 'monthly', label: 'Monthly attendance' },
  { value: 'student', label: 'Student-wise percentage' },
  { value: 'class', label: 'Class-wise percentage' },
] as const;

const FEE_TYPES = [
  { value: 'daily', label: 'Daily collection' },
  { value: 'monthly', label: 'Monthly collection' },
  { value: 'outstanding', label: 'Outstanding fees' },
  { value: 'status', label: 'Paid / Unpaid' },
  { value: 'by_class', label: 'Collection by class' },
] as const;

const EXPENSE_TYPES = [
  { value: 'category', label: 'Expenses by category' },
  { value: 'daily', label: 'Daily expenses' },
  { value: 'monthly', label: 'Monthly expenses' },
] as const;

interface ReportSectionProps {
  title: string;
  description: string;
  types: ReadonlyArray<{ value: string; label: string }>;
  reportType: string;
  onReportTypeChange: (value: string) => void;
  classFilter: string;
  onClassFilterChange: (value: string) => void;
  showClassFilter?: boolean;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  showCategoryFilter?: boolean;
  onGenerate: () => void;
  preview: PreviewRow[] | null;
  columns: LegacyColumnDef<PreviewRow, unknown>[];
  generated: boolean;
}

function ReportSection({
  title,
  description,
  types,
  reportType,
  onReportTypeChange,
  classFilter,
  onClassFilterChange,
  showClassFilter = true,
  categoryFilter,
  onCategoryFilterChange,
  showCategoryFilter = false,
  onGenerate,
  preview,
  columns,
  generated,
}: ReportSectionProps): ReactNode {
  return (
    <Card className="rounded-lg border bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report type</Label>
              <RadioGroup
                value={reportType}
                onValueChange={(v) => {
                  if (typeof v === 'string') onReportTypeChange(v);
                }}
                className="grid gap-2 sm:grid-cols-2"
              >
                {types.map((type) => (
                  <label
                    key={type.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/40"
                  >
                    <RadioGroupItem value={type.value} />
                    <span>{type.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {(showClassFilter || showCategoryFilter) && (
              <div className="flex flex-wrap gap-3">
                {showClassFilter && (
                  <label className="flex min-w-[180px] flex-col gap-1.5 text-sm font-medium">
                    <span>Class</span>
                    <AppSelect
                      value={classFilter}
                      onValueChange={onClassFilterChange}
                      placeholder="All Classes"
                      aria-label="Class filter"
                      options={[
                        { value: 'all', label: 'All Classes' },
                        ...CLASSES.map((c) => ({
                          value: c.id,
                          label: c.name,
                        })),
                      ]}
                    />
                  </label>
                )}
                {showCategoryFilter && onCategoryFilterChange && (
                  <label className="flex min-w-[180px] flex-col gap-1.5 text-sm font-medium">
                    <span>Category</span>
                    <AppSelect
                      value={categoryFilter ?? 'all'}
                      onValueChange={onCategoryFilterChange}
                      placeholder="All Categories"
                      aria-label="Category filter"
                      options={[
                        { value: 'all', label: 'All Categories' },
                        ...EXPENSE_CATEGORIES.map((c) => ({
                          value: c,
                          label: c,
                        })),
                      ]}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 lg:items-end">
            <Button
              onClick={onGenerate}
              className="w-full sm:w-auto"
              aria-label={`Generate ${title}`}
            >
              <FileText className="size-4" />
              Generate Report
            </Button>
            {generated && (
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => toast.success('PDF export started')}
                  aria-label="Export PDF"
                >
                  <Download className="size-4" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => toast.success('Excel export started')}
                  aria-label="Export Excel"
                >
                  <FileSpreadsheet className="size-4" />
                  Excel
                </Button>
              </div>
            )}
          </div>
        </div>

        {generated && preview && (
          <DataTable
            data={preview}
            columns={columns}
            pagination
            pageSize={10}
            emptyTitle="No data for this report"
            emptyDescription="Try a different report type or filter."
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage(): ReactNode {
  const [studentType, setStudentType] = useState('all');
  const [attendanceType, setAttendanceType] = useState('daily');
  const [feeType, setFeeType] = useState('monthly');
  const [expenseType, setExpenseType] = useState('category');

  const [studentClass, setStudentClass] = useState('all');
  const [attendanceClass, setAttendanceClass] = useState('all');
  const [feeClass, setFeeClass] = useState('all');
  const [expenseCategory, setExpenseCategory] = useState('all');

  const [studentPreview, setStudentPreview] = useState<PreviewRow[] | null>(null);
  const [attendancePreview, setAttendancePreview] = useState<PreviewRow[] | null>(null);
  const [feePreview, setFeePreview] = useState<PreviewRow[] | null>(null);
  const [expensePreview, setExpensePreview] = useState<PreviewRow[] | null>(null);

  const studentColumns = useMemo<LegacyColumnDef<PreviewRow, unknown>[]>(
    () => [
      { accessorKey: 'col1', header: 'Student ID' },
      { accessorKey: 'col2', header: 'Name' },
      { accessorKey: 'col3', header: 'Class' },
      {
        accessorKey: 'col4',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.col4} />,
      },
    ],
    []
  );

  const attendanceColumns = useMemo<LegacyColumnDef<PreviewRow, unknown>[]>(
    () => [
      { accessorKey: 'col1', header: 'Student / Class' },
      { accessorKey: 'col2', header: 'Present' },
      { accessorKey: 'col3', header: 'Absent' },
      { accessorKey: 'col4', header: 'Percentage' },
    ],
    []
  );

  const feeColumns = useMemo<LegacyColumnDef<PreviewRow, unknown>[]>(
    () => [
      { accessorKey: 'col1', header: 'Student' },
      { accessorKey: 'col2', header: 'Month' },
      {
        accessorKey: 'col3',
        header: 'Amount',
        cell: ({ row }) => row.original.col3,
      },
      {
        accessorKey: 'col4',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.col4} />,
      },
    ],
    []
  );

  const expenseColumns = useMemo<LegacyColumnDef<PreviewRow, unknown>[]>(
    () => [
      { accessorKey: 'col1', header: 'Title' },
      { accessorKey: 'col2', header: 'Category' },
      { accessorKey: 'col3', header: 'Amount' },
      { accessorKey: 'col4', header: 'Date' },
    ],
    []
  );

  function generateStudentReport(): void {
    let students = [...MOCK_STUDENTS];
    if (studentClass !== 'all') {
      students = students.filter((s) => s.classId === studentClass);
    }
    if (studentType === 'active') {
      students = students.filter((s) => s.status === 'active');
    } else if (studentType === 'withdrawn') {
      students = students.filter((s) => s.status === 'withdrawn');
    } else if (studentType === 'admissions') {
      students = students.filter((s) => s.admissionDate.startsWith('2026-04'));
    }

    setStudentPreview(
      students.map((s) => ({
        id: s.id,
        col1: s.studentId,
        col2: s.name,
        col3: `${s.className}-${s.sectionName}`,
        col4: s.status,
      }))
    );
    toast.success('Student report generated');
  }

  function generateAttendanceReport(): void {
    const students =
      attendanceClass === 'all'
        ? MOCK_STUDENTS.filter((s) => s.status === 'active')
        : MOCK_STUDENTS.filter(
            (s) => s.status === 'active' && s.classId === attendanceClass
          );

    setAttendancePreview(
      students.slice(0, 12).map((s, i) => {
        const present = 18 + (i % 5);
        const absent = 22 - present;
        const pct = Math.round((present / 22) * 100);
        return {
          id: s.id,
          col1:
            attendanceType === 'class'
              ? `${s.className}-${s.sectionName}`
              : s.name,
          col2: String(present),
          col3: String(absent),
          col4: `${pct}%`,
        };
      })
    );
    toast.success('Attendance report generated');
  }

  function generateFeeReport(): void {
    let fees = [...MOCK_FEES];
    if (feeClass !== 'all') {
      const className = CLASSES.find((c) => c.id === feeClass)?.name;
      if (className) {
        fees = fees.filter((f) => f.className.startsWith(className));
      }
    }
    if (feeType === 'outstanding') {
      fees = fees.filter((f) => f.status !== 'paid');
    } else if (feeType === 'status') {
      fees = fees.filter((f) => f.status === 'paid' || f.status === 'unpaid');
    }

    setFeePreview(
      fees.map((f) => ({
        id: f.id,
        col1: f.studentName,
        col2: f.month,
        col3:
          feeType === 'outstanding'
            ? formatCurrency(f.remainingAmount)
            : formatCurrency(f.paidAmount),
        col4: f.status,
      }))
    );
    toast.success('Fee report generated');
  }

  function generateExpenseReport(): void {
    let expenses = [...MOCK_EXPENSES];
    if (expenseCategory !== 'all') {
      expenses = expenses.filter((e) => e.category === expenseCategory);
    }

    setExpensePreview(
      expenses.map((e) => ({
        id: e.id,
        col1: e.title,
        col2: e.category,
        col3: formatCurrency(e.amount),
        col4: formatDate(e.date),
      }))
    );
    toast.success('Expense report generated');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and export school reports for session 2026-27"
        breadcrumb={['Reports']}
      />

      <ReportSection
        title="Student Reports"
        description="Enrolment, status, and class-wise student lists."
        types={STUDENT_TYPES}
        reportType={studentType}
        onReportTypeChange={setStudentType}
        classFilter={studentClass}
        onClassFilterChange={setStudentClass}
        onGenerate={generateStudentReport}
        preview={studentPreview}
        columns={studentColumns}
        generated={studentPreview !== null}
      />

      <ReportSection
        title="Attendance Reports"
        description="Daily, monthly, and percentage-based attendance views."
        types={ATTENDANCE_TYPES}
        reportType={attendanceType}
        onReportTypeChange={setAttendanceType}
        classFilter={attendanceClass}
        onClassFilterChange={setAttendanceClass}
        onGenerate={generateAttendanceReport}
        preview={attendancePreview}
        columns={attendanceColumns}
        generated={attendancePreview !== null}
      />

      <ReportSection
        title="Fee Reports"
        description="Collection, outstanding balances, and paid/unpaid status."
        types={FEE_TYPES}
        reportType={feeType}
        onReportTypeChange={setFeeType}
        classFilter={feeClass}
        onClassFilterChange={setFeeClass}
        onGenerate={generateFeeReport}
        preview={feePreview}
        columns={feeColumns}
        generated={feePreview !== null}
      />

      <ReportSection
        title="Expense Reports"
        description="Expenses by category, day, or month."
        types={EXPENSE_TYPES}
        reportType={expenseType}
        onReportTypeChange={setExpenseType}
        classFilter="all"
        onClassFilterChange={() => undefined}
        showClassFilter={false}
        showCategoryFilter
        categoryFilter={expenseCategory}
        onCategoryFilterChange={setExpenseCategory}
        onGenerate={generateExpenseReport}
        preview={expensePreview}
        columns={expenseColumns}
        generated={expensePreview !== null}
      />
    </div>
  );
}
