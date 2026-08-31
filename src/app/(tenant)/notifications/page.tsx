'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  AlertCircle,
  Banknote,
  Bell,
  GraduationCap,
  Megaphone,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AppSelect } from '@/components/common/AppSelect';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CLASSES } from '@/lib/constants';
import {
  MOCK_NOTIFICATION_HISTORY,
  MOCK_RESULT_DELIVERIES,
  MOCK_STUDENTS,
} from '@/lib/mockData';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { examTypeLabel } from '@/lib/results';

type NotificationKind =
  | 'fee_reminder'
  | 'payment_confirmation'
  | 'absence_alert'
  | 'exam_result'
  | 'general';

interface NotificationTypeCard {
  id: NotificationKind;
  title: string;
  description: string;
  icon: typeof Bell;
  color: string;
}

const TYPE_CARDS: NotificationTypeCard[] = [
  {
    id: 'fee_reminder',
    title: 'Fee Reminder',
    description: 'Remind parents about pending monthly fees.',
    icon: Banknote,
    color: 'text-warning bg-amber-50',
  },
  {
    id: 'payment_confirmation',
    title: 'Payment Confirmation',
    description: 'Confirm fee payment received.',
    icon: Send,
    color: 'text-success bg-emerald-50',
  },
  {
    id: 'absence_alert',
    title: 'Absence Alert',
    description: 'Notify guardians when a student is absent.',
    icon: AlertCircle,
    color: 'text-danger bg-rose-50',
  },
  {
    id: 'exam_result',
    title: 'Exam Result',
    description: 'Send monthly, mid-term, or mock results to parents.',
    icon: GraduationCap,
    color: 'text-primary bg-primary/10',
  },
  {
    id: 'general',
    title: 'General Announcement',
    description: 'Broadcast a message to selected parents or a class.',
    icon: Megaphone,
    color: 'text-primary bg-primary/10',
  },
];

interface HistoryRow {
  id: string;
  recipient: string;
  phone: string;
  type: string;
  status: 'Sent' | 'Failed';
  date: string;
}

function buildPreview(
  kind: NotificationKind,
  studentName: string,
  amount: number,
  month: string,
  customMessage: string
): string {
  const name = studentName || 'Ahmed Ali';
  switch (kind) {
    case 'fee_reminder':
      return `Dear Parent, ${name}'s fee for ${month || 'August 2026'} is ${formatCurrency(amount || 8000)}. Please pay at your earliest convenience. — Green Valley Academy`;
    case 'payment_confirmation':
      return `Payment of ${formatCurrency(amount || 8000)} has been received for ${name}. Thank you. — Green Valley Academy`;
    case 'absence_alert':
      return `${name} was absent today (${formatDate('2026-08-31')}). Please contact the school office if needed. — Green Valley Academy`;
    case 'exam_result':
      return `Dear Parent, ${name}'s result for Mid Term Exam 2026 (Mid Term) — Class 8-A. Total: 315/400 (79%, Grade B+). Subjects: English 78/100, Math 85/100, Physics 72/100, Urdu 80/100. — Green Valley Academy`;
    case 'general':
      return (
        customMessage.trim() ||
        'Assalam-o-Alaikum. Please note: Parent-teacher meeting on Saturday 10:00 AM. — Green Valley Academy'
      );
  }
}

export default function NotificationsPage(): ReactNode {
  const [activeType, setActiveType] = useState<NotificationKind>('fee_reminder');
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('all');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('8000');
  const [month, setMonth] = useState('August 2026');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const selectedStudent = MOCK_STUDENTS.find((s) => s.id === studentId);
  const preview = buildPreview(
    activeType,
    selectedStudent?.name ?? '',
    Number(amount) || 0,
    month,
    message
  );

  const historyColumns = useMemo<LegacyColumnDef<HistoryRow, unknown>[]>(
    () => [
      {
        accessorKey: 'recipient',
        header: 'Recipient',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.recipient}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.phone}</span>
        ),
      },
      { accessorKey: 'type', header: 'Type' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'date',
        header: 'Date & Time',
        cell: ({ row }) => {
          const d = new Date(row.original.date);
          return (
            <span>
              {formatDate(row.original.date)}{' '}
              <span className="text-muted-foreground">
                {d.toLocaleTimeString('en-PK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          );
        },
      },
    ],
    []
  );

  async function handleSend(): Promise<void> {
    if (activeType === 'general') {
      if (!message.trim() && classId === 'all' && !phone.trim()) {
        toast.error('Enter a message and select recipients.');
        return;
      }
    } else if (!studentId && !phone.trim()) {
      toast.error('Select a student or enter a phone number.');
      return;
    }

    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    toast.success('WhatsApp notification queued successfully');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Send WhatsApp messages and view delivery history"
        breadcrumb={['Notifications']}
      />

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {TYPE_CARDS.map((card) => {
              const Icon = card.icon;
              const selected = activeType === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveType(card.id)}
                  aria-label={card.title}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40',
                    selected && 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 flex size-9 items-center justify-center rounded-lg',
                      card.color
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>
                  {TYPE_CARDS.find((c) => c.id === activeType)?.title ?? 'Message'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeType === 'exam_result' ? (
                  <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm text-foreground">
                      Exam and test results (monthly, bi-monthly, mid-term, mock,
                      class test, final) are sent from the Results page so each
                      student keeps a permanent marks record and a WhatsApp
                      delivery log.
                    </p>
                    <Link
                      href="/academics/results"
                      className={cn(buttonVariants())}
                    >
                      <GraduationCap className="size-4" />
                      Open Exam Results
                    </Link>
                  </div>
                ) : (
                  <>
                {activeType !== 'general' && (
                  <div className="space-y-2">
                    <Label htmlFor="notif-student">Student</Label>
                    <AppSelect
                      id="notif-student"
                      value={studentId}
                      onValueChange={(v) => {
                        setStudentId(v);
                        const student = MOCK_STUDENTS.find((s) => s.id === v);
                        if (student) {
                          setPhone(student.phone);
                          setAmount(String(student.monthlyFee - student.discount));
                        }
                      }}
                      placeholder="Select student"
                      aria-label="Student"
                      options={MOCK_STUDENTS.filter(
                        (s) => s.status === 'active'
                      ).map((s) => ({
                        value: s.id,
                        label: `${s.name} (${s.studentId})`,
                      }))}
                    />
                  </div>
                )}

                {activeType === 'general' && (
                  <div className="space-y-2">
                    <Label htmlFor="notif-class">Class (broadcast)</Label>
                    <AppSelect
                      id="notif-class"
                      value={classId}
                      onValueChange={setClassId}
                      placeholder="Select class"
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
                )}

                <div className="space-y-2">
                  <Label htmlFor="notif-phone">WhatsApp Phone (+92)</Label>
                  <Input
                    id="notif-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    aria-label="WhatsApp phone"
                  />
                </div>

                {(activeType === 'fee_reminder' ||
                  activeType === 'payment_confirmation') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="notif-month">Fee Month</Label>
                      <Input
                        id="notif-month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        placeholder="August 2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notif-amount">Amount (PKR)</Label>
                      <Input
                        id="notif-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={1}
                      />
                    </div>
                  </>
                )}

                {activeType === 'general' && (
                  <div className="space-y-2">
                    <Label htmlFor="notif-message">Message</Label>
                    <Textarea
                      id="notif-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Write your announcement…"
                    />
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={sending}
                  onClick={() => void handleSend()}
                  aria-label="Send notification"
                >
                  <Send className="size-4" />
                  {sending ? 'Sending…' : 'Send via WhatsApp'}
                </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg border bg-white shadow-sm ring-0">
              <CardHeader>
                <CardTitle>Message Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mx-auto max-w-sm rounded-2xl rounded-bl-sm bg-[#DCF8C6] px-3 py-2 text-sm text-slate-800 shadow-sm">
                    {preview}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Preview only — messages are sent to +92 numbers via WhatsApp.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <DataTable
            data={
              [
                ...MOCK_RESULT_DELIVERIES.map((d) => ({
                  id: d.id,
                  recipient: d.guardianName,
                  phone: d.phone,
                  type: `Exam Result · ${examTypeLabel(d.examType)}`,
                  status: d.status,
                  date: d.sentAt,
                })),
                ...(MOCK_NOTIFICATION_HISTORY as HistoryRow[]),
              ].sort((a, b) => b.date.localeCompare(a.date)) as HistoryRow[]
            }
            columns={historyColumns}
            pagination
            pageSize={25}
            emptyTitle="No notifications yet"
            emptyDescription="Sent WhatsApp messages will appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
