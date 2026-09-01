import { EXAM_TYPES } from '@/lib/constants';
import { calculateGrade } from '@/lib/utils';
import type { Exam, ExamResult, ExamType } from '@/types/exam.types';
import type { Student } from '@/types/student.types';

export function examTypeLabel(type: ExamType): string {
  return EXAM_TYPES[type];
}

export function buildResultSheetForExam(
  exam: Exam,
  students: Student[],
  existing: ExamResult[] = []
): ExamResult[] {
  const classStudents = students
    .filter(
      (s) =>
        s.status === 'active' &&
        s.classId === exam.classId &&
        s.sectionId === exam.sectionId
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const total = exam.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const emptyMarks = Object.fromEntries(
    exam.subjects.map((s) => [s.id, 0])
  ) as Record<string, number>;

  return classStudents.map((student) => {
    const found = existing.find(
      (r) => r.examId === exam.id && r.studentId === student.id
    );
    if (found) return { ...found };

    return {
      id: `res-${exam.id}-${student.id}`,
      examId: exam.id,
      studentId: student.id,
      studentName: student.name,
      marks: { ...emptyMarks },
      total,
      obtained: 0,
      percentage: 0,
      grade: calculateGrade(0),
      deliveryStatus: 'not_sent' as const,
      lastSentAt: null,
    };
  });
}

export function buildResultWhatsAppMessage(
  exam: Exam,
  result: ExamResult,
  schoolName = 'Green Valley Academy'
): string {
  const subjectLines = exam.subjects
    .map((s) => `${s.name}: ${result.marks[s.id] ?? 0}/${s.maxMarks}`)
    .join(', ');

  return (
    `Dear Parent,\n` +
    `${result.studentName}'s result for ${exam.title} (${examTypeLabel(exam.examType)}) — ` +
    `${exam.className}-${exam.sectionName} on ${exam.date}.\n` +
    `Subjects: ${subjectLines}.\n` +
    `Total: ${result.obtained}/${result.total} (${result.percentage}%, Grade ${result.grade}).\n` +
    `— ${schoolName}`
  );
}

export function toWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0')
    ? `92${digits.slice(1)}`
    : digits.startsWith('92')
      ? digits
      : `92${digits}`;
  const base = `https://wa.me/${international}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
