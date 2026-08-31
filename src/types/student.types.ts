export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  photo: string | null;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  sessionId: string;
  admissionDate: string;
  monthlyFee: number;
  discount: number;
  status: StudentStatus;
  schoolId: string;
}

export interface Guardian {
  name: string;
  phone: string;
  cnic: string;
  address: string;
}

export interface StudentFilters {
  search?: string;
  classId?: string;
  sectionId?: string;
  status?: StudentStatus | 'all';
  sessionId?: string;
  page?: number;
  limit?: number;
}
