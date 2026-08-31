import type { ReactNode } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { AttendanceSheet } from '@/components/attendance/AttendanceSheet';

export default function AttendancePage(): ReactNode {
  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance by class and section"
        breadcrumb={['Attendance']}
      />
      <AttendanceSheet />
    </div>
  );
}
