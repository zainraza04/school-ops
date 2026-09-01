'use client';

import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useExams } from '@/hooks/useExams';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import {
  ExamForm,
  type ExamFormValues,
} from '@/components/exams/ExamForm';
import { ExamCard } from '@/components/exams/ExamCard';
import { Button } from '@/components/ui/button';
import { CLASSES, SECTIONS } from '@/lib/constants';
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
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
