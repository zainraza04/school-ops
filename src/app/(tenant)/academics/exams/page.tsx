'use client';

import { useState, type ReactNode } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useExams } from '@/hooks/useExams';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import {
  ExamForm,
  type ExamFormValues,
} from '@/components/exams/ExamForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CLASSES, SECTIONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Exam } from '@/types/exam.types';

export default function ExamsPage(): ReactNode {
  const { data, isLoading, isError } = useExams();
  const [created, setCreated] = useState<Exam[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  const exams = [...created, ...(data ?? [])];

  async function handleCreate(values: ExamFormValues): Promise<void> {
    await new Promise((r) => setTimeout(r, 400));
    const className =
      CLASSES.find((c) => c.id === values.classId)?.name ?? values.classId;
    const sectionName =
      SECTIONS.find((s) => s.id === values.sectionId)?.name ?? values.sectionId;

    const exam: Exam = {
      id: `exm-${Date.now()}`,
      title: values.title,
      examType: values.examType,
      classId: values.classId,
      className,
      sectionId: values.sectionId,
      sectionName,
      date: values.date,
      subjects: values.subjects.map((s, i) => ({
        id: `sub-new-${Date.now()}-${i}`,
        name: s.name,
        maxMarks: s.maxMarks,
      })),
      status: 'draft',
      schoolId: 'sch-green-valley',
      sessionId: 'sess-2627',
    };

    setCreated((prev) => [exam, ...prev]);
    toast.success('Exam created successfully');
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Exams"
          subtitle="Create and manage exams across classes"
          breadcrumb={['Academics', 'Exams']}
        />
        <LoadingState variant="cards" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <PageHeader
          title="Exams"
          subtitle="Create and manage exams across classes"
          breadcrumb={['Academics', 'Exams']}
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load exams. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Exams"
        subtitle="Create and manage exams across classes"
        breadcrumb={['Academics', 'Exams']}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Create Exam
          </Button>
        }
      />

      {exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Create your first exam to start recording results."
          action={{ label: 'Create Exam', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="rounded-lg border bg-white shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">
                    {exam.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {exam.className} — Section {exam.sectionName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={exam.examType} />
                  <StatusBadge status={exam.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4 shrink-0" aria-hidden />
                  <span>{formatDate(exam.date)}</span>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Subjects ({exam.subjects.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exam.subjects.map((subject) => (
                      <span
                        key={subject.id}
                        className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-foreground"
                      >
                        {subject.name} ({subject.maxMarks})
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExamForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
