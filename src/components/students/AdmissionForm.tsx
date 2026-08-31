'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  admissionSchema,
  admissionStep1Schema,
  admissionStep2Schema,
  admissionStep3Schema,
  type AdmissionFormValues,
} from '@/lib/validators/admission.schema';
import { ACADEMIC_SESSIONS, CLASSES, SECTIONS } from '@/lib/constants';
import { formatCurrency, generateStudentId } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppSelect } from '@/components/common/AppSelect';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Student Info', description: 'Personal details' },
  { id: 2, title: 'Guardian Info', description: 'Parent / guardian' },
  { id: 3, title: 'Academic & Fee', description: 'Class and fees' },
] as const;

const STEP1_FIELDS: (keyof AdmissionFormValues)[] = [
  'name',
  'dateOfBirth',
  'gender',
];
const STEP2_FIELDS: (keyof AdmissionFormValues)[] = [
  'guardianName',
  'phone',
  'cnic',
  'address',
];
const STEP3_FIELDS: (keyof AdmissionFormValues)[] = [
  'sessionId',
  'classId',
  'sectionId',
  'admissionDate',
  'monthlyFee',
  'discount',
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AdmissionForm(): ReactNode {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      gender: 'male',
      photo: null,
      guardianName: '',
      phone: '',
      cnic: '',
      address: '',
      sessionId: 'sess-2627',
      classId: '',
      sectionId: '',
      admissionDate: todayIso(),
      monthlyFee: 0,
      discount: 0,
    },
    mode: 'onTouched',
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const monthlyFee = watch('monthlyFee') || 0;
  const discount = watch('discount') || 0;
  const gender = watch('gender');
  const sessionId = watch('sessionId');
  const classId = watch('classId');
  const sectionId = watch('sectionId');

  const sectionOptions = useMemo(() => {
    if (!classId) return [];
    return SECTIONS.filter((s) => s.classId === classId);
  }, [classId]);

  const netFee = Math.max(0, Number(monthlyFee) - Number(discount));

  async function goNext(): Promise<void> {
    const fields =
      step === 1 ? STEP1_FIELDS : step === 2 ? STEP2_FIELDS : STEP3_FIELDS;
    const schema =
      step === 1
        ? admissionStep1Schema
        : step === 2
          ? admissionStep2Schema
          : admissionStep3Schema;

    const values = form.getValues();
    const partial = Object.fromEntries(
      fields.map((key) => [key, values[key]])
    );
    const parsed = schema.safeParse(partial);
    if (!parsed.success) {
      await trigger(fields);
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack(): void {
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit(values: AdmissionFormValues): Promise<void> {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const newId = generateStudentId(2026, 42);
    setSuccessId(newId);
    setSubmitting(false);
    toast.success(`${values.name} admitted successfully`);
  }

  function handleAdmitAnother(): void {
    setSuccessId(null);
    setStep(1);
    reset({
      name: '',
      dateOfBirth: '',
      gender: 'male',
      photo: null,
      guardianName: '',
      phone: '',
      cnic: '',
      address: '',
      sessionId: 'sess-2627',
      classId: '',
      sectionId: '',
      admissionDate: todayIso(),
      monthlyFee: 0,
      discount: 0,
    });
  }

  if (successId) {
    return (
      <div className="w-full rounded-xl border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-7" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Admission Successful
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The student has been enrolled. Their admission ID is:
        </p>
        <p className="mt-3 font-mono text-lg font-bold text-primary">
          {successId}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/students/${successId}`}
            className={cn(buttonVariants())}
          >
            View Profile
          </Link>
          <Button variant="outline" onClick={handleAdmitAnother}>
            <UserPlus />
            Admit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <nav aria-label="Admission steps" className="rounded-xl border bg-card p-4 sm:p-5">
        <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {STEPS.map((s, index) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-3">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    done && 'bg-primary text-primary-foreground',
                    active && 'bg-primary text-primary-foreground',
                    !active && !done && 'bg-muted text-muted-foreground'
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check className="size-4" aria-hidden /> : s.id}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {s.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.description}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className="mx-2 hidden h-px flex-1 bg-border sm:block"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full rounded-xl border bg-card p-6 shadow-sm sm:p-8"
        noValidate
      >
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Student Information</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                htmlFor="name"
                error={errors.name?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="name"
                  placeholder="e.g. Ahmed Ali"
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
              </Field>
              <Field
                label="Date of Birth"
                htmlFor="dateOfBirth"
                error={errors.dateOfBirth?.message}
              >
                <Input
                  id="dateOfBirth"
                  type="date"
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  {...register('dateOfBirth')}
                />
              </Field>
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['male', 'female'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setValue('gender', option, { shouldValidate: true })
                      }
                      className={cn(
                        'h-10 rounded-md border text-sm font-medium capitalize transition-colors',
                        gender === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input bg-background text-muted-foreground hover:bg-muted/50'
                      )}
                      aria-pressed={gender === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Guardian Information</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Guardian Name"
                htmlFor="guardianName"
                error={errors.guardianName?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="guardianName"
                  placeholder="e.g. Khalid Ali"
                  aria-invalid={Boolean(errors.guardianName)}
                  {...register('guardianName')}
                />
              </Field>
              <Field
                label="Phone"
                htmlFor="phone"
                error={errors.phone?.message}
              >
                <Input
                  id="phone"
                  placeholder="03XX-XXXXXXX"
                  aria-invalid={Boolean(errors.phone)}
                  {...register('phone')}
                />
              </Field>
              <Field label="CNIC" htmlFor="cnic" error={errors.cnic?.message}>
                <Input
                  id="cnic"
                  placeholder="XXXXX-XXXXXXX-X"
                  aria-invalid={Boolean(errors.cnic)}
                  {...register('cnic')}
                />
              </Field>
              <Field
                label="Address"
                htmlFor="address"
                error={errors.address?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="address"
                  placeholder="House / Street, Area, City"
                  className="min-h-24"
                  aria-invalid={Boolean(errors.address)}
                  {...register('address')}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Academic & Fee Info</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Academic Session"
                htmlFor="sessionId"
                error={errors.sessionId?.message}
              >
                <AppSelect
                  id="sessionId"
                  value={sessionId}
                  onValueChange={(v) =>
                    setValue('sessionId', v, { shouldValidate: true })
                  }
                  placeholder="Select session"
                  options={ACADEMIC_SESSIONS.map((s) => ({
                    value: s.id,
                    label: `${s.name}${s.status === 'active' ? ' (Active)' : ''}`,
                  }))}
                />
              </Field>
              <Field
                label="Class"
                htmlFor="classId"
                error={errors.classId?.message}
              >
                <AppSelect
                  id="classId"
                  value={classId}
                  onValueChange={(v) => {
                    setValue('classId', v, { shouldValidate: true });
                    setValue('sectionId', '', { shouldValidate: true });
                  }}
                  placeholder="Select class"
                  options={CLASSES.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </Field>
              <Field
                label="Section"
                htmlFor="sectionId"
                error={errors.sectionId?.message}
              >
                <AppSelect
                  id="sectionId"
                  value={sectionId}
                  onValueChange={(v) =>
                    setValue('sectionId', v, { shouldValidate: true })
                  }
                  placeholder="Select section"
                  disabled={!classId}
                  options={sectionOptions.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Field>
              <Field
                label="Admission Date"
                htmlFor="admissionDate"
                error={errors.admissionDate?.message}
              >
                <Input
                  id="admissionDate"
                  type="date"
                  aria-invalid={Boolean(errors.admissionDate)}
                  {...register('admissionDate')}
                />
              </Field>
              <Field
                label="Monthly Fee (Rs.)"
                htmlFor="monthlyFee"
                error={errors.monthlyFee?.message}
              >
                <Input
                  id="monthlyFee"
                  type="number"
                  min={0}
                  step={100}
                  aria-invalid={Boolean(errors.monthlyFee)}
                  {...register('monthlyFee', { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Discount (Rs.)"
                htmlFor="discount"
                error={errors.discount?.message}
              >
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step={100}
                  aria-invalid={Boolean(errors.discount)}
                  {...register('discount', { valueAsNumber: true })}
                />
              </Field>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Monthly Fee: {formatCurrency(Number(monthlyFee) || 0)} | Discount:{' '}
                {formatCurrency(Number(discount) || 0)} | Net Fee:{' '}
                <span className="font-semibold text-primary">
                  {formatCurrency(netFee)}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={step === 1 || submitting}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => {
                void goNext();
              }}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Complete Admission
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: FieldProps): ReactNode {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
