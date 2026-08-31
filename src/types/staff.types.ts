export type StaffRole = 'admin' | 'teacher';
export type StaffStatus = 'active' | 'inactive';
export type PayrollStatus = 'paid' | 'unpaid';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  designation: string;
  role: StaffRole;
  joiningDate: string;
  salary: number;
  status: StaffStatus;
  schoolId: string;
  email?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  basicSalary: number;
  salaryMonth: string;
  paidAmount: number;
  paymentDate: string | null;
  status: PayrollStatus;
  role: StaffRole;
}
