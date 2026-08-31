export type PaymentMethod = 'cash' | 'bank' | 'other';
export type FeeStatus = 'paid' | 'unpaid' | 'partial';

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  month: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeStatus;
  schoolId: string;
}

export interface Payment {
  id: string;
  feeRecordId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  receivedBy: string;
  receiptNumber: string;
}

export interface Receipt {
  receiptNumber: string;
  studentName: string;
  studentId: string;
  className: string;
  sectionName: string;
  feeMonth: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  receivedBy: string;
  schoolName: string;
  schoolLogo: string | null;
}
