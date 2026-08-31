import { z } from 'zod';

export const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^03\d{2}-\d{7}$/, 'Format: 03XX-XXXXXXX'),
  designation: z.string().min(2, 'Designation is required'),
  role: z.enum(['admin', 'teacher']),
  joiningDate: z.string().min(1, 'Joining date is required'),
  salary: z.coerce.number().positive('Salary must be greater than 0'),
  status: z.enum(['active', 'inactive']).default('active'),
  createAccount: z.boolean().default(false),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
