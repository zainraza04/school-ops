export type ExamStatus = 'draft' | 'active' | 'completed';

/** Covers monthly tests, bi-monthly, mid-term, mock, class tests, finals */
export type ExamType =
  | 'monthly'
  | 'bi_monthly'
  | 'mid_term'
  | 'mock'
  | 'class_test'
  | 'final';

export type ResultDeliveryStatus = 'not_sent' | 'sent' | 'failed';

export interface ExamSubject {
  id: string;
  name: string;
  maxMarks: number;
}

export interface Exam {
  id: string;
  title: string;
  examType: ExamType;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  date: string;
  subjects: ExamSubject[];
  status: ExamStatus;
  schoolId: string;
  sessionId: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  marks: Record<string, number>;
  total: number;
  obtained: number;
  percentage: number;
  grade: string;
  /** Parent WhatsApp delivery tracking */
  deliveryStatus: ResultDeliveryStatus;
  lastSentAt: string | null;
}

export interface ResultDeliveryRecord {
  id: string;
  resultId: string;
  examId: string;
  examTitle: string;
  examType: ExamType;
  studentId: string;
  studentName: string;
  guardianName: string;
  phone: string;
  message: string;
  status: 'Sent' | 'Failed';
  sentAt: string;
  sentBy: string;
}
