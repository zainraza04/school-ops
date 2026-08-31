import type { ReactNode } from 'react';
import { StudentProfile } from '@/components/students/StudentProfile';

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps): Promise<ReactNode> {
  const { id } = await params;
  return <StudentProfile studentId={id} />;
}
