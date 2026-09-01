'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GUARDIANS,
  MOCK_EXAMS,
  MOCK_RESULT_DELIVERIES,
  MOCK_RESULTS,
  MOCK_STUDENTS,
} from '@/lib/mockData';
import { buildResultWhatsAppMessage, buildResultSheetForExam } from '@/lib/results';
import type {
  Exam,
  ExamResult,
  ResultDeliveryRecord,
} from '@/types/exam.types';

export function useExams(): ReturnType<typeof useQuery<Exam[]>> {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      return MOCK_EXAMS;
    },
  });
}

export function useExamResults(
  examId: string
): ReturnType<typeof useQuery<ExamResult[]>> {
  return useQuery({
    queryKey: ['results', examId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      const exam = MOCK_EXAMS.find((e) => e.id === examId);
      if (!exam) return [];
      const existing = MOCK_RESULTS.filter((r) => r.examId === examId).map(
        (r) => ({ ...r })
      );
      return buildResultSheetForExam(exam, MOCK_STUDENTS, existing);
    },
    enabled: Boolean(examId),
  });
}

interface SaveResultsInput {
  examId: string;
  results: ExamResult[];
}

export function useSaveExamResults(): ReturnType<
  typeof useMutation<ExamResult[], Error, SaveResultsInput>
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      examId,
      results,
    }: SaveResultsInput): Promise<ExamResult[]> => {
      await new Promise((r) => setTimeout(r, 500));

      const remaining = MOCK_RESULTS.filter((r) => r.examId !== examId);
      MOCK_RESULTS.length = 0;
      MOCK_RESULTS.push(...remaining, ...results);

      return results;
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['results', variables.examId] });
      void qc.invalidateQueries({ queryKey: ['student-results'] });
    },
  });
}

export function useStudentResults(
  studentId: string
): ReturnType<
  typeof useQuery<Array<{ result: ExamResult; exam: Exam | undefined }>>
> {
  return useQuery({
    queryKey: ['student-results', studentId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_RESULTS.filter((r) => r.studentId === studentId)
        .map((result) => ({
          result,
          exam: MOCK_EXAMS.find((e) => e.id === result.examId),
        }))
        .sort((a, b) => {
          const da = a.exam?.date ?? '';
          const db = b.exam?.date ?? '';
          return db.localeCompare(da);
        });
    },
    enabled: Boolean(studentId),
  });
}

export function useResultDeliveries(
  studentId?: string
): ReturnType<typeof useQuery<ResultDeliveryRecord[]>> {
  return useQuery({
    queryKey: ['result-deliveries', studentId ?? 'all'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 250));
      const list = [...MOCK_RESULT_DELIVERIES];
      if (studentId) {
        return list
          .filter((d) => d.studentId === studentId)
          .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
      }
      return list.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    },
  });
}

interface SendResultsInput {
  exam: Exam;
  results: ExamResult[];
  sentBy?: string;
}

interface SendResultsOutput {
  sent: number;
  failed: number;
  deliveries: ResultDeliveryRecord[];
}

function resolveGuardian(studentId: string): { name: string; phone: string } {
  const known = GUARDIANS[studentId];
  if (known) return { name: known.name, phone: known.phone };
  const student = MOCK_STUDENTS.find((s) => s.id === studentId);
  return {
    name: student?.fatherName ?? 'Guardian',
    phone: student?.phone ?? '0300-0000000',
  };
}

export function useSendResults(): ReturnType<
  typeof useMutation<SendResultsOutput, Error, SendResultsInput>
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exam,
      results,
      sentBy = 'Sana Khan',
    }: SendResultsInput): Promise<SendResultsOutput> => {
      await new Promise((r) => setTimeout(r, 700));

      const deliveries: ResultDeliveryRecord[] = [];
      let sent = 0;
      let failed = 0;

      for (const result of results) {
        const guardian = resolveGuardian(result.studentId);
        const message = buildResultWhatsAppMessage(exam, result);
        // Simulate rare failure for demo (phone ending in 6)
        const ok = !guardian.phone.endsWith('6');
        const record: ResultDeliveryRecord = {
          id: `rd-${Date.now()}-${result.id}`,
          resultId: result.id,
          examId: exam.id,
          examTitle: exam.title,
          examType: exam.examType,
          studentId: result.studentId,
          studentName: result.studentName,
          guardianName: guardian.name,
          phone: guardian.phone,
          message,
          status: ok ? 'Sent' : 'Failed',
          sentAt: new Date().toISOString(),
          sentBy,
        };
        deliveries.push(record);
        if (ok) sent += 1;
        else failed += 1;

        const idx = MOCK_RESULTS.findIndex((r) => r.id === result.id);
        if (idx >= 0) {
          MOCK_RESULTS[idx] = {
            ...MOCK_RESULTS[idx],
            deliveryStatus: ok ? 'sent' : 'failed',
            lastSentAt: record.sentAt,
          };
        }
      }

      MOCK_RESULT_DELIVERIES.unshift(...deliveries);
      return { sent, failed, deliveries };
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['results', variables.exam.id] });
      void qc.invalidateQueries({ queryKey: ['student-results'] });
      void qc.invalidateQueries({ queryKey: ['result-deliveries'] });
    },
  });
}
