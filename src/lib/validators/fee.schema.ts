import { z } from 'zod';

export const feeCollectionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.enum(['cash', 'bank', 'other']),
  paymentDate: z.string().min(1, 'Payment date is required'),
  feeMonth: z.string().min(1, 'Fee month is required'),
});

export type FeeCollectionFormValues = z.infer<typeof feeCollectionSchema>;
