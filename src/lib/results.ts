import { EXAM_TYPES } from '@/lib/constants';
import type { Exam, ExamResult, ExamType } from '@/types/exam.types';

export function examTypeLabel(type: ExamType): string {
  return EXAM_TYPES[type];
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
