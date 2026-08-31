'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MOCK_FEES, MOCK_RECEIPTS } from '@/lib/mockData';
import type { FeeRecord, Receipt, PaymentMethod } from '@/types/fee.types';

export function useFees(status?: string): ReturnType<typeof useQuery<FeeRecord[]>> {
  return useQuery({
    queryKey: ['fees', status],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      if (!status || status === 'all') return MOCK_FEES;
      return MOCK_FEES.filter((f) => f.status === status);
    },
    staleTime: 30_000,
  });
}

export function useOutstandingFees(): ReturnType<typeof useQuery<FeeRecord[]>> {
  return useQuery({
    queryKey: ['fees', 'outstanding'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      return MOCK_FEES.filter((f) => f.remainingAmount > 0);
    },
  });
}

export function useReceipts(): ReturnType<typeof useQuery<Receipt[]>> {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_RECEIPTS;
    },
  });
}

interface CollectFeeInput {
  studentId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  feeMonth: string;
}

export function useCollectFee(): ReturnType<
  typeof useMutation<Receipt, Error, CollectFeeInput>
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CollectFeeInput): Promise<Receipt> => {
      await new Promise((r) => setTimeout(r, 600));
      const fee = MOCK_FEES.find((f) => f.studentId === input.studentId);
      const receipt: Receipt = {
        receiptNumber: `#REC-${String(422 + Math.floor(Math.random() * 50)).padStart(6, '0')}`,
        studentName: fee?.studentName ?? 'Student',
        studentId: fee?.studentCode ?? 'ADM-2026-0000',
        className: fee?.className.split('-')[0] ?? 'Class',
        sectionName: fee?.className.split('-')[1] ?? 'A',
        feeMonth: input.feeMonth,
        amount: input.amount,
        paymentMethod: input.method,
        date: input.paymentDate,
        receivedBy: 'Sana Khan',
        schoolName: 'Green Valley Academy',
        schoolLogo: null,
      };
      return receipt;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fees'] });
      void qc.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
}
