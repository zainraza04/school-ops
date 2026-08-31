'use client';

import { useQuery } from '@tanstack/react-query';
import { MOCK_STUDENTS, GUARDIANS } from '@/lib/mockData';
import type { PaginatedResponse } from '@/types/api.types';
import type { Student, StudentFilters, Guardian } from '@/types/student.types';

async function fetchStudents(
  filters: StudentFilters
): Promise<PaginatedResponse<Student>> {
  await new Promise((r) => setTimeout(r, 400));
  let data = [...MOCK_STUDENTS];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q)
    );
  }
  if (filters.classId && filters.classId !== 'all') {
    data = data.filter((s) => s.classId === filters.classId);
  }
  if (filters.sectionId && filters.sectionId !== 'all') {
    data = data.filter((s) => s.sectionId === filters.sectionId);
  }
  if (filters.status && filters.status !== 'all') {
    data = data.filter((s) => s.status === filters.status);
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  return {
    data: paged,
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit) || 1,
  };
}

export function useStudents(filters: StudentFilters = {}): ReturnType<
  typeof useQuery<PaginatedResponse<Student>>
> {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => fetchStudents(filters),
    staleTime: 30_000,
  });
}

export function useStudent(id: string): ReturnType<typeof useQuery<Student | undefined>> {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_STUDENTS.find((s) => s.id === id || s.studentId === id);
    },
    enabled: Boolean(id),
  });
}

export function useGuardian(studentId: string): ReturnType<typeof useQuery<Guardian | undefined>> {
  return useQuery({
    queryKey: ['guardian', studentId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return GUARDIANS[studentId];
    },
    enabled: Boolean(studentId),
  });
}
