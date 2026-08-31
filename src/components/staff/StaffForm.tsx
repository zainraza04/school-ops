'use client';

import { useEffect, type ReactNode } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  staffSchema,
  type StaffFormValues,
} from '@/lib/validators/staff.schema';
import { useCreateStaff } from '@/hooks/useStaff';
import { AppSelect } from '@/components/common/AppSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<StaffFormValues>;
  onSuccess?: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_VALUES: StaffFormValues = {
  name: '',
  phone: '',
  designation: '',
  role: 'teacher',
  joiningDate: todayIso(),
  salary: 0,
  status: 'active',
  createAccount: false,
  email: '',
};

export function StaffForm({
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: StaffFormProps): ReactNode {
  const createStaff = useCreateStaff();
  const isEdit = Boolean(defaultValues?.name);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema) as Resolver<StaffFormValues>,
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  });

  const createAccount = watch('createAccount');
  const role = watch('role');
  const status = watch('status');

  useEffect(() => {
    if (!open) return;
    reset({ ...EMPTY_VALUES, ...defaultValues });
  }, [open, defaultValues, reset]);

  async function onSubmit(values: StaffFormValues): Promise<void> {
    if (values.createAccount && !values.email?.trim()) {
      setError('email', { message: 'Email is required to create an account' });
      return;
    }

    try {
      if (isEdit) {
        await new Promise((r) => setTimeout(r, 400));
        toast.success('Staff member updated');
      } else {
        await createStaff.mutateAsync(values);
        toast.success('Staff member added');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to save. Please try again.');
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Staff' : 'Add Staff'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update staff details and account settings.'
              : 'Add a new staff member to your school.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Full name</Label>
              <Input
                id="staff-name"
                {...register('name')}
                placeholder="Usman Malik"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                {...register('phone')}
                placeholder="03XX-XXXXXXX"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-designation">Designation</Label>
              <Input
                id="staff-designation"
                {...register('designation')}
                placeholder="Math Teacher"
                aria-invalid={Boolean(errors.designation)}
              />
              {errors.designation && (
                <p className="text-xs text-destructive">
                  {errors.designation.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staff-role">Role</Label>
                <AppSelect
                  id="staff-role"
                  value={role}
                  onValueChange={(v) =>
                    setValue('role', v as StaffFormValues['role'], {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select role"
                  aria-label="Role"
                  options={[
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                />
                {errors.role && (
                  <p className="text-xs text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-status">Status</Label>
                <AppSelect
                  id="staff-status"
                  value={status}
                  onValueChange={(v) =>
                    setValue('status', v as StaffFormValues['status'], {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select status"
                  aria-label="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staff-joining">Joining date</Label>
                <Input
                  id="staff-joining"
                  type="date"
                  {...register('joiningDate')}
                  aria-invalid={Boolean(errors.joiningDate)}
                />
                {errors.joiningDate && (
                  <p className="text-xs text-destructive">
                    {errors.joiningDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-salary">Monthly salary (Rs.)</Label>
                <Input
                  id="staff-salary"
                  type="number"
                  min={0}
                  {...register('salary')}
                  aria-invalid={Boolean(errors.salary)}
                />
                {errors.salary && (
                  <p className="text-xs text-destructive">
                    {errors.salary.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={createAccount}
                  onChange={(e) =>
                    setValue('createAccount', e.target.checked, {
                      shouldDirty: true,
                    })
                  }
                />
                Create Account
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Allow this staff member to sign in to SchoolOps.
              </p>

              {createAccount && (
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="staff-email">Email</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    {...register('email')}
                    placeholder="teacher@school.edu.pk"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || createStaff.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createStaff.isPending}
            >
              {(isSubmitting || createStaff.isPending) && (
                <Loader2 className="animate-spin" />
              )}
              {isEdit ? 'Save Changes' : 'Add Staff'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
