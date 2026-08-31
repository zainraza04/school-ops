'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Download,
  FileSpreadsheet,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useExams, useExamResults } from '@/hooks/useExams';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { AppSelect } from '@/components/common/AppSelect';
import { ResultTable } from '@/components/exams/ResultTable';
import { SendResultsDialog } from '@/components/exams/SendResultsDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CLASSES, SECTIONS } from '@/lib/constants';
import { examTypeLabel } from '@/lib/results';
import type { ExamResult } from '@/types/exam.types';

export default function ResultsPage(): ReactNode {
  const { data: exams, isLoading: examsLoading, isError: examsError } =
    useExams();

  const [examId, setExamId] = useState('');
  const [classId, setClassId] = useState('all');
  const [sectionId, setSectionId] = useState('all');
  const [loadedExamId, setLoadedExamId] = useState('');
  const [localResults, setLocalResults] = useState<ExamResult[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTargets, setSendTargets] = useState<ExamResult[]>([]);

  const {
    data: fetchedResults,
    isLoading: resultsLoading,
    isFetching,
    isError: resultsError,
    refetch,
  } = useExamResults(loadedExamId);

  const selectedExam = useMemo(
    () => exams?.find((e) => e.id === loadedExamId),
    [exams, loadedExamId]
  );

  const sectionOptions = useMemo(() => {
    if (classId === 'all') return SECTIONS;
    return SECTIONS.filter((s) => s.classId === classId);
  }, [classId]);

  const displayResults = useMemo(() => {
    const source = localResults ?? fetchedResults ?? [];
    return source.filter((r) => {
      if (!selectedExam) return true;
      if (classId !== 'all' && selectedExam.classId !== classId) return false;
      if (sectionId !== 'all' && selectedExam.sectionId !== sectionId) {
        return false;
      }
      return true;
    });
  }, [localResults, fetchedResults, selectedExam, classId, sectionId]);

  function handleLoadResults(): void {
    if (!examId) {
      toast.error('Select an exam first');
      return;
    }
    setLocalResults(null);
    setSelectedIds([]);
    setLoadedExamId(examId);
  }

  function handleResultsChange(next: ExamResult[]): void {
    setLocalResults(next);
  }

  function openSendFor(results: ExamResult[]): void {
    if (!selectedExam || results.length === 0) {
      toast.error('Select at least one student');
      return;
    }
    setSendTargets(results);
    setSendOpen(true);
  }

  if (examsError) {
    return (
      <div>
        <PageHeader
          title="Exam Results"
          subtitle="Enter marks, keep history, and notify parents"
          breadcrumb={['Academics', 'Results']}
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load exams. Please try again.
        </div>
      </div>
    );
  }

  const selectedRows = displayResults.filter((r) =>
    selectedIds.includes(r.id)
  );

  return (
    <div>
      <PageHeader
        title="Exam Results"
        subtitle="Enter marks, keep permanent records, and send results to parents on WhatsApp"
        breadcrumb={['Academics', 'Results']}
        action={
          selectedExam ? (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  openSendFor(
                    selectedRows.length > 0 ? selectedRows : displayResults
                  )
                }
                disabled={displayResults.length === 0}
              >
                <MessageCircle className="size-4" />
                {selectedRows.length > 0
                  ? `Send Selected (${selectedRows.length})`
                  : 'Send All to Parents'}
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success('Export started')}
              >
                <Download className="size-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success('Export started')}
              >
                <FileSpreadsheet className="size-4" />
                Export Excel
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-4 rounded-xl border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-exam">Exam / Test</Label>
            <AppSelect
              id="filter-exam"
              value={examId}
              onValueChange={setExamId}
              placeholder="Select exam"
              disabled={examsLoading}
              aria-label="Exam"
              options={(exams ?? []).map((exam) => ({
                value: exam.id,
                label: `${exam.title} · ${examTypeLabel(exam.examType)}`,
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-class">Class</Label>
            <AppSelect
              id="filter-class"
              value={classId}
              onValueChange={(v) => {
                setClassId(v);
                setSectionId('all');
              }}
              placeholder="All Classes"
              aria-label="Class"
              options={[
                { value: 'all', label: 'All Classes' },
                ...CLASSES.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-section">Section</Label>
            <AppSelect
              id="filter-section"
              value={sectionId}
              onValueChange={setSectionId}
              placeholder="All Sections"
              aria-label="Section"
              options={[
                { value: 'all', label: 'All Sections' },
                ...sectionOptions.map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
            />
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={handleLoadResults}
              disabled={!examId || isFetching}
            >
              {(resultsLoading || isFetching) && loadedExamId === examId ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Load Results
            </Button>
          </div>
        </div>
      </div>

      {!loadedExamId ? (
        <EmptyState
          title="Select an exam"
          description="Choose a monthly test, mid-term, mock, or any exam, then load results to mark and notify parents."
        />
      ) : resultsError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load results. Please try again.
        </div>
      ) : resultsLoading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading results...
        </div>
      ) : selectedExam ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedExam.title}
            </span>
            <span>·</span>
            <span>{examTypeLabel(selectedExam.examType)}</span>
            <span>·</span>
            <span>
              {selectedExam.className}-{selectedExam.sectionName}
            </span>
            <span>·</span>
            <span>
              {displayResults.filter((r) => r.deliveryStatus === 'sent').length}/
              {displayResults.length} parents notified
            </span>
          </div>
          <ResultTable
            exam={selectedExam}
            results={displayResults}
            onChange={handleResultsChange}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onSendOne={(result) => openSendFor([result])}
          />
        </>
      ) : null}

      {selectedExam && (
        <SendResultsDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          exam={selectedExam}
          results={sendTargets}
          onSent={() => {
            setSelectedIds([]);
            setLocalResults(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
