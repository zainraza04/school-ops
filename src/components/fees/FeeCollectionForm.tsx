'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Search, UserRound } from 'lucide-react';
import { useCollectFee } from '@/hooks/useFees';
import { useStudents } from '@/hooks/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { ReceiptPreview } from '@/components/fees/ReceiptPreview';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MOCK_FEES, MOCK_STUDENTS } from '@/lib/mockData';
import {
  feeCollectionSchema,
  type FeeCollectionFormValues,
} from '@/lib/validators/fee.schema';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import type { FeeRecord, PaymentMethod, Receipt } from '@/types/fee.types';
import type { Student } from '@/types/student.types';

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'other', label: 'Other' },
];

interface PaymentMethodPillsProps {
  value: PaymentMethod;
  disabled?: boolean;
  onChange: (method: PaymentMethod) => void;
}

function PaymentMethodPills({
  value,
  disabled,
  onChange,
}: PaymentMethodPillsProps): ReactNode {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Payment method">
      {METHOD_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'min-h-10 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50',
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input bg-background text-muted-foreground hover:bg-muted'
            )}
            aria-pressed={selected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function findFeeForStudent(student: Student): FeeRecord | null {
  return (
    MOCK_FEES.find(
      (f) => f.studentId === student.id && f.remainingAmount > 0
    ) ?? MOCK_FEES.find((f) => f.studentId === student.id) ?? null
  );
}

function formValuesForStudent(
  student: Student,
  fee: FeeRecord | null
): FeeCollectionFormValues {
  if (fee) {
    return {
      amount: fee.remainingAmount > 0 ? fee.remainingAmount : fee.totalAmount,
      method: 'cash',
      paymentDate: todayIso(),
      feeMonth: fee.month,
    };
  }
  return {
    amount: student.monthlyFee - student.discount,
    method: 'cash',
    paymentDate: todayIso(),
    feeMonth: 'August 2026',
  };
}

function resolveStudent(id: string): Student | null {
  if (!id) return null;
  return (
    MOCK_STUDENTS.find((s) => s.id === id || s.studentId === id) ?? null
  );
}

export function FeeCollectionForm(): ReactNode {
  const searchParams = useSearchParams();
  const preselectId = searchParams.get('student') ?? '';
  const initialStudent = resolveStudent(preselectId);
  const initialFee = initialStudent ? findFeeForStudent(initialStudent) : null;

  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    initialStudent
  );
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(initialFee);
  const [collectedReceipt, setCollectedReceipt] = useState<Receipt | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const collectFee = useCollectFee();
  const { data: studentPage } = useStudents({
    search: debouncedQuery || undefined,
    status: 'active',
    limit: 8,
  });
  const searchResults = debouncedQuery.trim() ? (studentPage?.data ?? []) : [];

  const form = useForm<FeeCollectionFormValues>({
    resolver: zodResolver(feeCollectionSchema) as Resolver<FeeCollectionFormValues>,
    defaultValues: initialStudent
      ? formValuesForStudent(initialStudent, initialFee)
      : {
          amount: 0,
          method: 'cash',
          paymentDate: todayIso(),
          feeMonth: '',
        },
  });

  const selectStudent = useCallback(
    (student: Student): void => {
      setSelectedStudent(student);
      setQuery('');
      setCollectedReceipt(null);
      const fee = findFeeForStudent(student);
      setSelectedFee(fee);
      form.reset(formValuesForStudent(student, fee));
    },
    [form]
  );

  const paymentMethod = useWatch({
    control: form.control,
    name: 'method',
  });

  async function onSubmit(values: FeeCollectionFormValues): Promise<void> {
    if (!selectedStudent) {
      toast.error('Select a student first');
      return;
    }
    try {
      const receipt = await collectFee.mutateAsync({
        studentId: selectedStudent.id,
        amount: values.amount,
        method: values.method,
        paymentDate: values.paymentDate,
        feeMonth: values.feeMonth,
      });
      setCollectedReceipt(receipt);
      toast.success('Fee collected successfully');
    } catch {
      toast.error('Failed to collect fee. Please try again.');
    }
  }

  function collectAnother(): void {
    setCollectedReceipt(null);
    setSelectedStudent(null);
    setSelectedFee(null);
    setQuery('');
    form.reset({
      amount: 0,
      method: 'cash',
      paymentDate: todayIso(),
      feeMonth: '',
    });
  }

  if (collectedReceipt) {
    return (
      <div className="space-y-4">
        <ReceiptPreview receipt={collectedReceipt} showPrintButton />
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={collectAnother}>
            Collect Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-lg border bg-white shadow-sm ring-0">
        <CardHeader>
          <CardTitle className="text-base">Find Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID, or father..."
              className="pl-8"
              aria-label="Search students"
            />
          </div>

          {searchResults.length > 0 && (
            <ul className="max-h-56 overflow-y-auto rounded-lg border divide-y">
              {searchResults.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                    onClick={() => selectStudent(student)}
                  >
                    <Avatar size="sm">
                      <AvatarFallback>
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {student.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {student.studentId} · {student.className}-{student.sectionName}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedStudent ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedStudent.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedStudent.studentId}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedStudent.className} — Section{' '}
                    {selectedStudent.sectionName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    S/O {selectedStudent.fatherName}
                  </p>
                </div>
              </div>
              {selectedFee && (
                <div className="mt-4 space-y-2 border-t pt-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Fee Month</span>
                    <span className="font-medium">{selectedFee.month}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Total</span>
                    <span>{formatCurrency(selectedFee.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Paid</span>
                    <span>{formatCurrency(selectedFee.paidAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-semibold text-rose-700">
                      {formatCurrency(selectedFee.remainingAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={selectedFee.status} />
                  </div>
                </div>
              )}
              {!selectedFee && (
                <p className="mt-3 text-sm text-muted-foreground">
                  No fee record on file. Collecting monthly fee of{' '}
                  {formatCurrency(
                    selectedStudent.monthlyFee - selectedStudent.discount
                  )}
                  .
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center">
              <UserRound className="mb-2 size-8 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-foreground">
                No student selected
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Search and select a student to collect fees.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg border bg-white shadow-sm ring-0">
        <CardHeader>
          <CardTitle className="text-base">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="fee-amount">Amount (Rs.)</Label>
              <Input
                id="fee-amount"
                type="number"
                min={1}
                step={1}
                disabled={!selectedStudent}
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <PaymentMethodPills
                value={paymentMethod}
                disabled={!selectedStudent}
                onChange={(method) => form.setValue('method', method)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                disabled={!selectedStudent}
                {...form.register('paymentDate')}
              />
              {form.formState.errors.paymentDate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.paymentDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fee-month">Fee Month</Label>
              <Input
                id="fee-month"
                disabled={!selectedStudent}
                {...form.register('feeMonth')}
              />
              {form.formState.errors.feeMonth && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.feeMonth.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selectedStudent || collectFee.isPending}
            >
              {collectFee.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Collecting…
                </>
              ) : (
                'Collect Fee'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
