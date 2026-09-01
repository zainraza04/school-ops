'use client';

import type { ReactNode } from 'react';
import { MessageCircle, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { calculateGrade, formatDate } from '@/lib/utils';
import type { Exam, ExamResult } from '@/types/exam.types';

interface ResultTableProps {
  exam: Exam;
  results: ExamResult[];
  onChange?: (results: ExamResult[]) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSendOne?: (result: ExamResult) => void;
  readOnly?: boolean;
}

function recomputeResult(
  exam: Exam,
  result: ExamResult,
  marks: Record<string, number>
): ExamResult {
  const total = exam.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const obtained = exam.subjects.reduce(
    (sum, s) => sum + (marks[s.id] ?? 0),
    0
  );
  const percentage = total === 0 ? 0 : Math.round((obtained / total) * 100);
  return {
    ...result,
    marks,
    total,
    obtained,
    percentage,
    grade: calculateGrade(percentage),
  };
}

export function ResultTable({
  exam,
  results,
  onChange,
  selectedIds = [],
  onSelectionChange,
  onSendOne,
  readOnly = false,
}: ResultTableProps): ReactNode {
  const editable = Boolean(onChange) && !readOnly;
  const selectable = Boolean(onSelectionChange);

  function updateMark(
    resultId: string,
    subjectId: string,
    rawValue: string
  ): void {
    if (!onChange) return;
    const subject = exam.subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const parsed = rawValue === '' ? 0 : Number(rawValue);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.max(0, Math.min(subject.maxMarks, Math.round(parsed)));

    const next = results.map((result) => {
      if (result.id !== resultId) return result;
      const marks = { ...result.marks, [subjectId]: clamped };
      return recomputeResult(exam, result, marks);
    });
    onChange(next);
  }

  function toggleAll(checked: boolean): void {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? results.map((r) => r.id) : []);
  }

  function toggleOne(id: string, checked: boolean): void {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...new Set([...selectedIds, id])]);
    } else {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    }
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="No students in this class"
        description="No active students were found for this exam's class and section."
      />
    );
  }

  const allSelected =
    results.length > 0 && results.every((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-3">
      {editable && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <Pencil className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Enter marks in the boxes below. Totals, percentage, and grade update
            automatically.
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label="Select all students"
                  />
                </TableHead>
              )}
              <TableHead className="sticky left-0 z-10 min-w-[180px] bg-slate-50/95 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                Student
              </TableHead>
              {exam.subjects.map((subject) => (
                <TableHead
                  key={subject.id}
                  className="min-w-[120px] text-center normal-case"
                >
                  <div>{subject.name}</div>
                  <div className="mt-0.5 text-[11px] font-medium tracking-normal text-muted-foreground normal-case">
                    Max {subject.maxMarks}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-center normal-case">Total</TableHead>
              <TableHead className="text-center normal-case">Obtained</TableHead>
              <TableHead className="text-center normal-case">%</TableHead>
              <TableHead className="text-center normal-case">Grade</TableHead>
              <TableHead className="min-w-[130px] normal-case">Parent Notify</TableHead>
              {onSendOne && <TableHead className="w-14 normal-case" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(result.id)}
                      onCheckedChange={(v) => toggleOne(result.id, v === true)}
                      aria-label={`Select ${result.studentName}`}
                    />
                  </TableCell>
                )}
                <TableCell className="sticky left-0 z-10 bg-inherit font-medium shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  {result.studentName}
                </TableCell>
                {exam.subjects.map((subject) => {
                  const value = result.marks[subject.id] ?? 0;

                  return (
                    <TableCell key={subject.id} className="p-1.5 text-center">
                      {editable ? (
                        <Input
                          type="number"
                          min={0}
                          max={subject.maxMarks}
                          inputMode="numeric"
                          value={value === 0 ? '' : String(value)}
                          placeholder="0"
                          className="mx-auto h-9 w-[4.5rem] text-center tabular-nums"
                          aria-label={`${result.studentName} ${subject.name} marks`}
                          onChange={(e) =>
                            updateMark(result.id, subject.id, e.target.value)
                          }
                        />
                      ) : (
                        <span className="inline-flex h-9 min-w-12 items-center justify-center text-sm font-medium">
                          {value}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center text-muted-foreground">
                  {result.total}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {result.obtained}
                </TableCell>
                <TableCell className="text-center">{result.percentage}%</TableCell>
                <TableCell className="text-center font-semibold text-primary">
                  {result.grade}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <StatusBadge status={result.deliveryStatus} />
                    {result.lastSentAt && (
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(result.lastSentAt)}
                      </p>
                    )}
                  </div>
                </TableCell>
                {onSendOne && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Send result to ${result.studentName}'s parent`}
                      onClick={() => onSendOne(result)}
                    >
                      <MessageCircle className="size-4 text-success" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
