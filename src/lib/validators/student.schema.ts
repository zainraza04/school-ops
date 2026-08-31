import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  fatherName: z.string().min(2, 'Father name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  phone: z.string().regex(/^03\d{2}-\d{7}$/, 'Format: 03XX-XXXXXXX'),
  address: z.string().min(5, 'Address is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  sessionId: z.string().min(1, 'Session is required'),
  monthlyFee: z.coerce.number().min(0, 'Fee must be 0 or more'),
  discount: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'withdrawn']).default('active'),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
