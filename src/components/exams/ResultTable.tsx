'use client';

import { useState, type ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
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
import { calculateGrade, cn, formatDate } from '@/lib/utils';
import type { Exam, ExamResult } from '@/types/exam.types';

interface ResultTableProps {
  exam: Exam;
  results: ExamResult[];
  onChange?: (results: ExamResult[]) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSendOne?: (result: ExamResult) => void;
}

interface EditingCell {
  resultId: string;
  subjectId: string;
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
}: ResultTableProps): ReactNode {
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const editable = Boolean(onChange);
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
        title="No results found"
        description="Load results for an exam to enter or review marks."
      />
    );
  }

  const allSelected =
    results.length > 0 && results.every((r) => selectedIds.includes(r.id));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleAll(v === true)}
                  aria-label="Select all students"
                />
              </TableHead>
            )}
            <TableHead className="sticky left-0 z-10 min-w-[160px] bg-card">
              Student
            </TableHead>
            {exam.subjects.map((subject) => (
              <TableHead key={subject.id} className="min-w-[100px] text-center">
                <div>{subject.name}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  / {subject.maxMarks}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Obtained</TableHead>
            <TableHead className="text-center">%</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="min-w-[120px]">Parent Notify</TableHead>
            {onSendOne && <TableHead className="w-12" />}
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
              <TableCell className="sticky left-0 z-10 bg-card font-medium">
                {result.studentName}
              </TableCell>
              {exam.subjects.map((subject) => {
                const isEditing =
                  editing?.resultId === result.id &&
                  editing.subjectId === subject.id;
                const value = result.marks[subject.id] ?? 0;

                return (
                  <TableCell
                    key={subject.id}
                    className={cn(
                      'p-1 text-center',
                      editable && 'cursor-pointer hover:bg-muted/50'
                    )}
                    onClick={() => {
                      if (!editable) return;
                      setEditing({
                        resultId: result.id,
                        subjectId: subject.id,
                      });
                    }}
                  >
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0}
                        max={subject.maxMarks}
                        autoFocus
                        className="mx-auto h-8 w-20 text-center"
                        defaultValue={value}
                        aria-label={`${result.studentName} ${subject.name} marks`}
                        onBlur={(e) => {
                          updateMark(result.id, subject.id, e.target.value);
                          setEditing(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateMark(
                              result.id,
                              subject.id,
                              (e.target as HTMLInputElement).value
                            );
                            setEditing(null);
                          }
                          if (e.key === 'Escape') {
                            setEditing(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="inline-flex h-8 min-w-12 items-center justify-center rounded-md px-2 text-sm">
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
              <TableCell className="text-center font-semibold">
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
  );
}
