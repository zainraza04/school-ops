'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Download,
  FileSpreadsheet,
  Loader2,
  MessageCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useExams,
  useExamResults,
  useSaveExamResults,
} from '@/hooks/useExams';
import { usePermissions } from '@/hooks/usePermissions';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { AppSelect } from '@/components/common/AppSelect';
import { ResultTable } from '@/components/exams/ResultTable';
import { SendResultsDialog } from '@/components/exams/SendResultsDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { examTypeLabel } from '@/lib/results';
import type { ExamResult } from '@/types/exam.types';

export default function ResultsPage(): ReactNode {
  const { can } = usePermissions();
  const canManage = can('results', 'manage');

  const { data: exams, isLoading: examsLoading, isError: examsError } =
    useExams();
  const saveMutation = useSaveExamResults();

  const [examId, setExamId] = useState('');
  const [loadedExamId, setLoadedExamId] = useState('');
  const [localResults, setLocalResults] = useState<ExamResult[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTargets, setSendTargets] = useState<ExamResult[]>([]);
  const [dirty, setDirty] = useState(false);

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

  const workingResults = localResults ?? fetchedResults ?? [];

  function handleLoadResults(): void {
    if (!examId) {
      toast.error('Select an exam first');
      return;
    }
    setLocalResults(null);
    setSelectedIds([]);
    setDirty(false);
    setLoadedExamId(examId);
  }

  function handleResultsChange(next: ExamResult[]): void {
    setLocalResults(next);
    setDirty(true);
  }

  async function handleSaveMarks(): Promise<void> {
    if (!loadedExamId || workingResults.length === 0) return;
    try {
      await saveMutation.mutateAsync({
        examId: loadedExamId,
        results: workingResults,
      });
      setDirty(false);
      setLocalResults(null);
      toast.success('Marks saved successfully');
      void refetch();
    } catch {
      toast.error('Failed to save marks. Please try again.');
    }
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

  const selectedRows = workingResults.filter((r) =>
    selectedIds.includes(r.id)
  );

  return (
    <div>
      <PageHeader
        title="Exam Results"
        subtitle="Enter marks for monthly tests, mid-terms, mocks, and finals"
        breadcrumb={['Academics', 'Results']}
        action={
          selectedExam ? (
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <Button
                  onClick={() => void handleSaveMarks()}
                  disabled={
                    !dirty ||
                    workingResults.length === 0 ||
                    saveMutation.isPending
                  }
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  Save Marks
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  openSendFor(
                    selectedRows.length > 0 ? selectedRows : workingResults
                  )
                }
                disabled={workingResults.length === 0}
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4 sm:gap-y-2">
          <Label htmlFor="filter-exam" className="sm:col-span-2">
            Exam / Test
          </Label>
          <AppSelect
            id="filter-exam"
            value={examId}
            onValueChange={setExamId}
            placeholder="Select exam"
            disabled={examsLoading}
            aria-label="Exam"
            options={(exams ?? []).map((exam) => ({
              value: exam.id,
              label: `${exam.title} · ${exam.className}-${exam.sectionName} · ${examTypeLabel(exam.examType)}`,
            }))}
          />
          <Button
            className="h-10 w-full sm:w-auto"
            onClick={handleLoadResults}
            disabled={!examId || isFetching}
          >
            {(resultsLoading || isFetching) && loadedExamId === examId ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Load Marks Sheet
          </Button>
        </div>
      </div>

      {!loadedExamId ? (
        <EmptyState
          title="Select an exam"
          description="Choose a monthly test, mid-term, mock, or final exam, then load the marks sheet to enter scores for every student in that class."
        />
      ) : resultsError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load results. Please try again.
        </div>
      ) : resultsLoading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading marks sheet...
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
            <span>{workingResults.length} students</span>
            <span>·</span>
            <span>
              {workingResults.filter((r) => r.deliveryStatus === 'sent').length}/
              {workingResults.length} parents notified
            </span>
            {dirty && (
              <>
                <span>·</span>
                <span className="font-medium text-warning">Unsaved changes</span>
              </>
            )}
          </div>
          <ResultTable
            exam={selectedExam}
            results={workingResults}
            onChange={canManage ? handleResultsChange : undefined}
            readOnly={!canManage}
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
