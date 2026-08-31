export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  fatherName?: string;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  date: string;
  classId: string;
  sectionId: string;
  records: AttendanceRecord[];
}
