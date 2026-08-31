'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useSendResults } from '@/hooks/useExams';
import { buildResultWhatsAppMessage, examTypeLabel } from '@/lib/results';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Exam, ExamResult } from '@/types/exam.types';

interface SendResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam;
  results: ExamResult[];
  onSent?: () => void;
}

export function SendResultsDialog({
  open,
  onOpenChange,
  exam,
  results,
  onSent,
}: SendResultsDialogProps): ReactNode {
  const sendMutation = useSendResults();
  const [previewIndex, setPreviewIndex] = useState(0);

  const preview = useMemo(() => {
    const result = results[previewIndex] ?? results[0];
    if (!result) return '';
    return buildResultWhatsAppMessage(exam, result);
  }, [exam, results, previewIndex]);

  async function handleSend(): Promise<void> {
    if (results.length === 0) return;
    try {
      const outcome = await sendMutation.mutateAsync({ exam, results });
      if (outcome.failed === 0) {
        toast.success(
          `Results sent to ${outcome.sent} parent${outcome.sent === 1 ? '' : 's'} via WhatsApp`
        );
      } else {
        toast.warning(
          `Sent ${outcome.sent}, failed ${outcome.failed}. Check delivery history.`
        );
      }
      onSent?.();
      onOpenChange(false);
    } catch {
      toast.error('Failed to send results. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="size-5 text-success" />
            Send Results to Parents
          </DialogTitle>
          <DialogDescription>
            WhatsApp messages for{' '}
            <span className="font-medium text-foreground">{exam.title}</span> (
            {examTypeLabel(exam.examType)}) will be sent to guardians.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{results.length} student(s)</Badge>
            <Badge variant="outline">
              {exam.className}-{exam.sectionName}
            </Badge>
            <Badge variant="outline">{formatDate(exam.date)}</Badge>
          </div>

          {results.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {results.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setPreviewIndex(i)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    previewIndex === i
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r.studentName}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Message preview
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {preview}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleSend();
            }}
            disabled={sendMutation.isPending || results.length === 0}
          >
            {sendMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            Send via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
