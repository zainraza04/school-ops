'use client';

import type { ReactNode } from 'react';
import { BookOpen, CalendarDays, Layers } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { examTypeLabel } from '@/lib/results';
import { cn, formatDate } from '@/lib/utils';
import type { Exam, ExamType } from '@/types/exam.types';

interface ExamTypeAccent {
  border: string;
  chip: string;
  icon: string;
}

const EXAM_TYPE_ACCENT: Record<ExamType, ExamTypeAccent> = {
  monthly: {
    border: 'border-l-indigo-500',
    chip: 'bg-indigo-50 text-indigo-700',
    icon: 'text-indigo-600',
  },
  bi_monthly: {
    border: 'border-l-violet-500',
    chip: 'bg-violet-50 text-violet-700',
    icon: 'text-violet-600',
  },
  mid_term: {
    border: 'border-l-blue-500',
    chip: 'bg-blue-50 text-blue-700',
    icon: 'text-blue-600',
  },
  mock: {
    border: 'border-l-amber-500',
    chip: 'bg-amber-50 text-amber-800',
    icon: 'text-amber-600',
  },
  class_test: {
    border: 'border-l-teal-500',
    chip: 'bg-teal-50 text-teal-700',
    icon: 'text-teal-600',
  },
  final: {
    border: 'border-l-rose-500',
    chip: 'bg-rose-50 text-rose-700',
    icon: 'text-rose-600',
  },
};

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps): ReactNode {
  const accent = EXAM_TYPE_ACCENT[exam.examType];
  const totalMarks = exam.subjects.reduce((sum, subject) => sum + subject.maxMarks, 0);

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
        'border-l-4',
        accent.border
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl',
                accent.chip
              )}
            >
              <BookOpen className={cn('size-5', accent.icon)} aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold leading-snug text-foreground">
                {exam.title}
              </h3>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                  accent.chip
                )}
              >
                {examTypeLabel(exam.examType)}
              </span>
            </div>
          </div>
          <StatusBadge status={exam.status} className="shrink-0" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class
            </p>
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Layers className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              {exam.className} — {exam.sectionName}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </p>
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              {formatDate(exam.date)}
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Subjects
            </p>
            <p className="text-xs text-muted-foreground">
              {exam.subjects.length} subjects · {totalMarks} marks
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exam.subjects.map((subject) => (
              <span
                key={subject.id}
                className="inline-flex items-center rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
              >
                {subject.name}
                <span className="ml-1.5 text-muted-foreground">{subject.maxMarks}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
