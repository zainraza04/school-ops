'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CLASSES, EXAM_TYPES, SECTIONS } from '@/lib/constants';
import { AppSelect } from '@/components/common/AppSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ExamType } from '@/types/exam.types';

export interface ExamFormSubjectInput {
  name: string;
  maxMarks: number;
}

export interface ExamFormValues {
  title: string;
  examType: ExamType;
  classId: string;
  sectionId: string;
  date: string;
  subjects: ExamFormSubjectInput[];
}

interface ExamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ExamFormValues) => void | Promise<void>;
}

interface SubjectDraft {
  key: string;
  name: string;
  maxMarks: string;
}

function emptySubject(): SubjectDraft {
  return {
    key: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    maxMarks: '100',
  };
}

export function ExamForm({
  open,
  onOpenChange,
  onSubmit,
}: ExamFormProps): ReactNode {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<ExamType | ''>('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState('');
  const [subjects, setSubjects] = useState<SubjectDraft[]>([emptySubject()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setExamType('');
    setClassId('');
    setSectionId('');
    setDate('');
    setSubjects([emptySubject()]);
    setErrors({});
    setSubmitting(false);
  }, [open]);

  const sectionOptions = useMemo(() => {
    if (!classId) return [];
    return SECTIONS.filter((s) => s.classId === classId);
  }, [classId]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!examType) next.examType = 'Exam type is required';
    if (!classId) next.classId = 'Class is required';
    if (!sectionId) next.sectionId = 'Section is required';
    if (!date) next.date = 'Date is required';
    if (subjects.length === 0) {
      next.subjects = 'Add at least one subject';
    } else {
      subjects.forEach((s, i) => {
        if (!s.name.trim()) next[`subject-name-${i}`] = 'Subject name required';
        const marks = Number(s.maxMarks);
        if (!Number.isFinite(marks) || marks <= 0) {
          next[`subject-marks-${i}`] = 'Max marks must be greater than 0';
        }
      });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        examType: examType as ExamType,
        classId,
        sectionId,
        date,
        subjects: subjects.map((s) => ({
          name: s.name.trim(),
          maxMarks: Number(s.maxMarks),
        })),
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Create Exam</SheetTitle>
          <SheetDescription>
            Set exam details and subjects with maximum marks.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="exam-title">Title</Label>
            <Input
              id="exam-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mid Term Exam 2026"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exam-type">Exam / Test Type</Label>
            <AppSelect
              id="exam-type"
              value={examType}
              onValueChange={(v) => setExamType(v as ExamType)}
              placeholder="Select type"
              aria-label="Exam type"
              options={Object.entries(EXAM_TYPES).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            {errors.examType && (
              <p className="text-xs text-destructive">{errors.examType}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exam-class">Class</Label>
              <AppSelect
                id="exam-class"
                value={classId}
                onValueChange={(v) => {
                  setClassId(v);
                  setSectionId('');
                }}
                placeholder="Select class"
                aria-label="Class"
                options={CLASSES.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              {errors.classId && (
                <p className="text-xs text-destructive">{errors.classId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exam-section">Section</Label>
              <AppSelect
                id="exam-section"
                value={sectionId}
                onValueChange={setSectionId}
                placeholder="Select section"
                disabled={!classId}
                aria-label="Section"
                options={sectionOptions.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
              {errors.sectionId && (
                <p className="text-xs text-destructive">{errors.sectionId}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exam-date">Date</Label>
            <Input
              id="exam-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Subjects</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubjects((prev) => [...prev, emptySubject()])}
              >
                <Plus className="size-4" />
                Add Subject
              </Button>
            </div>
            {errors.subjects && (
              <p className="text-xs text-destructive">{errors.subjects}</p>
            )}
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div
                  key={subject.key}
                  className="flex items-start gap-2 rounded-lg border bg-muted/30 p-2"
                >
                  <div className="flex-1 space-y-1">
                    <Input
                      value={subject.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSubjects((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, name: value } : s
                          )
                        );
                      }}
                      placeholder="Subject name"
                      aria-label={`Subject ${index + 1} name`}
                      aria-invalid={Boolean(errors[`subject-name-${index}`])}
                    />
                    {errors[`subject-name-${index}`] && (
                      <p className="text-xs text-destructive">
                        {errors[`subject-name-${index}`]}
                      </p>
                    )}
                  </div>
                  <div className="w-24 space-y-1">
                    <Input
                      type="number"
                      min={1}
                      value={subject.maxMarks}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSubjects((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, maxMarks: value } : s
                          )
                        );
                      }}
                      placeholder="Max"
                      aria-label={`Subject ${index + 1} max marks`}
                      aria-invalid={Boolean(errors[`subject-marks-${index}`])}
                    />
                    {errors[`subject-marks-${index}`] && (
                      <p className="text-xs text-destructive">
                        {errors[`subject-marks-${index}`]}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove subject ${index + 1}`}
                    disabled={subjects.length === 1}
                    onClick={() =>
                      setSubjects((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Create Exam
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
