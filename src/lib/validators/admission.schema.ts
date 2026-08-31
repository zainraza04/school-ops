import { z } from 'zod';

export const admissionStep1Schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], { message: 'Select gender' }),
  photo: z.string().nullable().optional(),
});

export const admissionStep2Schema = z.object({
  guardianName: z.string().min(2, 'Guardian name is required'),
  phone: z.string().regex(/^03\d{2}-\d{7}$/, 'Format: 03XX-XXXXXXX'),
  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, 'Format: XXXXX-XXXXXXX-X'),
  address: z.string().min(5, 'Address is required'),
});

export const admissionStep3Schema = z.object({
  sessionId: z.string().min(1, 'Academic session is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  monthlyFee: z.number().positive('Monthly fee is required'),
  discount: z.number().min(0),
});

export const admissionSchema = admissionStep1Schema
  .merge(admissionStep2Schema)
  .merge(admissionStep3Schema);

export type AdmissionFormValues = z.infer<typeof admissionSchema>;
