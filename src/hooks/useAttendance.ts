'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MOCK_STUDENTS } from '@/lib/mockData';
import type { AttendanceRecord, AttendanceSession } from '@/types/attendance.types';

async function loadAttendance(
  classId: string,
  sectionId: string,
  date: string
): Promise<AttendanceSession> {
  await new Promise((r) => setTimeout(r, 350));
  const students = MOCK_STUDENTS.filter(
    (s) => s.classId === classId && s.sectionId === sectionId && s.status === 'active'
  );
  const records: AttendanceRecord[] = students.map((s) => ({
    studentId: s.id,
    studentName: s.name,
    fatherName: s.fatherName,
    status: 'present',
  }));
  return { date, classId, sectionId, records };
}

export function useAttendanceSheet(
  classId: string,
  sectionId: string,
  date: string,
  enabled: boolean
): ReturnType<typeof useQuery<AttendanceSession>> {
  return useQuery({
    queryKey: ['attendance', classId, sectionId, date],
    queryFn: () => loadAttendance(classId, sectionId, date),
    enabled: enabled && Boolean(classId) && Boolean(sectionId) && Boolean(date),
    staleTime: 10_000,
  });
}

export function useSaveAttendance(): ReturnType<
  typeof useMutation<void, Error, AttendanceSession>
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: AttendanceSession) => {
      await new Promise((r) => setTimeout(r, 500));
      qc.setQueryData(
        ['attendance', session.classId, session.sectionId, session.date],
        session
      );
    },
  });
}
