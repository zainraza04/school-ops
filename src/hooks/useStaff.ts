'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MOCK_STAFF, MOCK_PAYROLL } from '@/lib/mockData';
import type { Staff, PayrollRecord } from '@/types/staff.types';
import type { StaffFormValues } from '@/lib/validators/staff.schema';

export function useStaff(): ReturnType<typeof useQuery<Staff[]>> {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      return MOCK_STAFF;
    },
  });
}

export function usePayroll(month?: string): ReturnType<typeof useQuery<PayrollRecord[]>> {
  return useQuery({
    queryKey: ['payroll', month],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      if (!month) return MOCK_PAYROLL;
      return MOCK_PAYROLL.filter((p) => p.salaryMonth === month);
    },
  });
}

export function useCreateStaff(): ReturnType<
  typeof useMutation<Staff, Error, StaffFormValues>
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: StaffFormValues): Promise<Staff> => {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: `sf-${Date.now()}`,
        name: values.name,
        phone: values.phone,
        designation: values.designation,
        role: values.role,
        joiningDate: values.joiningDate,
        salary: values.salary,
        status: values.status,
        schoolId: 'sch-green-valley',
        email: values.email || undefined,
      };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
