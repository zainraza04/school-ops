'use client';

import { useRef, type ReactNode } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PaymentMethod, Receipt } from '@/types/fee.types';

interface ReceiptPreviewProps {
  receipt: Receipt;
  showPrintButton?: boolean;
  className?: string;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  other: 'Other',
};

export function ReceiptPreview({
  receipt,
  showPrintButton = false,
  className,
}: ReceiptPreviewProps): ReactNode {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint(): void {
    const node = printRef.current;
    if (!node) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${receipt.receiptNumber}</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; margin: 24px; color: #0f172a; }
        .wrap { max-width: 420px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 24px; }
        .school { text-align: center; font-size: 20px; font-weight: 700; color: #166534; }
        .title { text-align: center; letter-spacing: 0.12em; font-size: 12px; margin: 8px 0 16px; font-weight: 700; }
        .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
        .label { color: #64748b; }
        .amount { font-size: 22px; font-weight: 700; text-align: center; margin: 16px 0; }
        .thanks { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; }
      </style></head><body>${node.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className={className}>
      <div
        ref={printRef}
        className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-sm"
      >
        <div className="wrap">
          <p className="school text-center text-xl font-bold text-emerald-800">
            {receipt.schoolName}
          </p>
          <p className="title text-center text-xs font-bold tracking-[0.15em] text-slate-700">
            FEE RECEIPT
          </p>
          <div className="mt-4 space-y-0">
            <ReceiptRow label="Receipt No." value={receipt.receiptNumber} />
            <ReceiptRow label="Date" value={formatDate(receipt.date)} />
            <ReceiptRow label="Student" value={receipt.studentName} />
            <ReceiptRow label="Student ID" value={receipt.studentId} />
            <ReceiptRow
              label="Class"
              value={`${receipt.className}-${receipt.sectionName}`}
            />
            <ReceiptRow label="Fee Month" value={receipt.feeMonth} />
            <ReceiptRow
              label="Payment Method"
              value={METHOD_LABELS[receipt.paymentMethod]}
            />
            <ReceiptRow label="Received By" value={receipt.receivedBy} />
          </div>
          <p className="amount my-4 text-center text-2xl font-bold text-slate-900">
            {formatCurrency(receipt.amount)}
          </p>
          <p className="thanks text-center text-xs text-slate-500">
            Thank you for your payment.
          </p>
        </div>
      </div>
      {showPrintButton && (
        <div className="mt-4 flex justify-center">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="size-4" />
            Print Receipt
          </Button>
        </div>
      )}
    </div>
  );
}

interface ReceiptRowProps {
  label: string;
  value: string;
}

function ReceiptRow({ label, value }: ReceiptRowProps): ReactNode {
  return (
    <div className="row flex items-center justify-between gap-3 border-b border-dashed border-slate-200 py-1.5 text-sm">
      <span className="label text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

interface ReceiptPreviewDialogProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptPreviewDialog({
  receipt,
  open,
  onOpenChange,
}: ReceiptPreviewDialogProps): ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Fee Receipt</DialogTitle>
        </DialogHeader>
        {receipt && (
          <ReceiptPreview receipt={receipt} showPrintButton className="py-2" />
        )}
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
