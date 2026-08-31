'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  Pencil,
  Phone,
  Printer,
  UserRound,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuardian, useStudent } from '@/hooks/useStudents';
import {
  useResultDeliveries,
  useStudentResults,
} from '@/hooks/useExams';
import { StudentStatusBadge } from '@/components/students/StudentStatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SendResultsDialog } from '@/components/exams/SendResultsDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_FEES } from '@/lib/mockData';
import { examTypeLabel, toWhatsAppLink } from '@/lib/results';
import {
  formatCurrency,
  formatDate,
  getInitials,
} from '@/lib/utils';
import type { AttendanceStatus } from '@/types/attendance.types';
import type { Exam, ExamResult } from '@/types/exam.types';

interface StudentProfileProps {
  studentId: string;
}

interface MockAttendanceDay {
  date: string;
  status: AttendanceStatus;
}

function buildMockAttendanceLog(seed: string): MockAttendanceDay[] {
  const statuses: AttendanceStatus[] = [
    'present',
    'present',
    'present',
    'absent',
    'present',
    'present',
    'absent',
    'present',
  ];
  const offset = seed.charCodeAt(seed.length - 1) % 3;
  return Array.from({ length: 8 }, (_, i) => {
    const day = 25 - i;
    return {
      date: `2026-08-${String(day).padStart(2, '0')}`,
      status: statuses[(i + offset) % statuses.length] ?? 'present',
    };
  });
}

function toWhatsAppUrl(phone: string): string {
  return toWhatsAppLink(phone);
}

export function StudentProfile({ studentId }: StudentProfileProps): ReactNode {
  const { data: student, isLoading, isError } = useStudent(studentId);
  const { data: guardian } = useGuardian(student?.id ?? '');
  const { data: results = [], refetch: refetchResults } = useStudentResults(
    student?.id ?? ''
  );
  const { data: deliveries = [] } = useResultDeliveries(student?.id);
  const [editOpen, setEditOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendPayload, setSendPayload] = useState<{
    exam: Exam;
    results: ExamResult[];
  } | null>(null);

  const attendanceLog = useMemo(
    () => (student ? buildMockAttendanceLog(student.id) : []),
    [student]
  );

  const attendanceSummary = useMemo(() => {
    const present = attendanceLog.filter((d) => d.status === 'present').length;
    const absent = attendanceLog.filter((d) => d.status === 'absent').length;
    const total = attendanceLog.length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
    return { present, absent, total, percentage };
  }, [attendanceLog]);

  const fees = useMemo(() => {
    if (!student) return [];
    return MOCK_FEES.filter((f) => f.studentId === student.id);
  }, [student]);

  function openSendResult(exam: Exam, result: ExamResult): void {
    setSendPayload({ exam, results: [result] });
    setSendOpen(true);
  }

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isError || !student) {
    return (
      <EmptyState
        icon={UserRound}
        title="Student not found"
        description="This student may have been removed or the ID is invalid."
      />
    );
  }

  const guardianInfo = guardian ?? {
    name: student.fatherName,
    phone: student.phone,
    cnic: '—',
    address: student.address,
  };

  const phone = student.phone;

  function handlePrint(): void {
    window.print();
  }

  function handleWhatsApp(): void {
    window.open(toWhatsAppUrl(phone), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            size="lg"
            className="size-16 text-base data-[size=lg]:size-16"
          >
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {student.name}
              </h1>
              <StudentStatusBadge status={student.status} />
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {student.studentId}
            </Badge>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>
                {student.className} — Section {student.sectionName}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" aria-hidden />
                {student.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden />
                Admitted {formatDate(student.admissionDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            aria-label="Edit student"
          >
            <Pencil />
            Edit
          </Button>
          <Button variant="outline" onClick={handlePrint} aria-label="Print profile">
            <Printer />
            Print
          </Button>
          <Button onClick={handleWhatsApp} aria-label="Open WhatsApp">
            <MessageCircle />
            WhatsApp
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Student personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Full Name" value={student.name} />
                <InfoRow label="Father Name" value={student.fatherName} />
                <InfoRow label="Date of Birth" value={formatDate(student.dateOfBirth)} />
                <InfoRow
                  label="Gender"
                  value={student.gender === 'male' ? 'Male' : 'Female'}
                />
                <InfoRow label="Phone" value={student.phone} mono />
                <InfoRow label="Address" value={student.address} />
                <InfoRow
                  label="Monthly Fee"
                  value={formatCurrency(student.monthlyFee)}
                />
                <InfoRow
                  label="Discount"
                  value={formatCurrency(student.discount)}
                />
                <InfoRow
                  label="Net Fee"
                  value={formatCurrency(student.monthlyFee - student.discount)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
                <CardDescription>Primary contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Guardian Name" value={guardianInfo.name} />
                <InfoRow label="Phone" value={guardianInfo.phone} mono />
                <InfoRow label="CNIC" value={guardianInfo.cnic} mono />
                <InfoRow label="Address" value={guardianInfo.address} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Present Days"
              value={String(attendanceSummary.present)}
              tone="success"
            />
            <SummaryCard
              label="Absent Days"
              value={String(attendanceSummary.absent)}
              tone="danger"
            />
            <SummaryCard
              label="Days Logged"
              value={String(attendanceSummary.total)}
              tone="neutral"
            />
            <SummaryCard
              label="Attendance %"
              value={`${attendanceSummary.percentage}%`}
              tone="primary"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Last 8 recorded school days</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y rounded-lg border">
                {attendanceLog.map((day) => (
                  <li
                    key={day.date}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span>{formatDate(day.date)}</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      {day.status === 'present' ? (
                        <>
                          <CheckCircle2
                            className="size-4 text-emerald-600"
                            aria-hidden
                          />
                          <span className="text-emerald-700">Present</span>
                        </>
                      ) : (
                        <>
                          <XCircle
                            className="size-4 text-rose-600"
                            aria-hidden
                          />
                          <span className="text-rose-700">Absent</span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          {fees.length === 0 ? (
            <EmptyState
              title="No fee records"
              description="Fee history for this student will appear here."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Fee History</CardTitle>
                <CardDescription>Monthly fee records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Month</th>
                        <th className="px-4 py-2.5 font-medium">Total</th>
                        <th className="px-4 py-2.5 font-medium">Paid</th>
                        <th className="px-4 py-2.5 font-medium">Remaining</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => (
                        <tr key={fee.id} className="border-t">
                          <td className="px-4 py-2.5">{fee.month}</td>
                          <td className="px-4 py-2.5">
                            {formatCurrency(fee.totalAmount)}
                          </td>
                          <td className="px-4 py-2.5">
                            {formatCurrency(fee.paidAmount)}
                          </td>
                          <td className="px-4 py-2.5">
                            {formatCurrency(fee.remainingAmount)}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={fee.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-4 space-y-6">
          {results.length === 0 ? (
            <EmptyState
              title="No exam results on record"
              description="Results from monthly tests, mid-terms, mocks, and finals will appear here permanently once marked."
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">Results history</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanent record of every test and exam for this student
                  </p>
                </div>
                <Badge variant="secondary">
                  {results.length} result{results.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {results.map(({ result, exam }) => (
                <Card
                  key={result.id}
                  className="rounded-xl border shadow-sm ring-1 ring-border/60"
                >
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">
                          {exam?.title ?? 'Exam Result'}
                        </CardTitle>
                        {exam && <StatusBadge status={exam.examType} />}
                        <StatusBadge status={result.deliveryStatus} />
                      </div>
                      <CardDescription>
                        {exam
                          ? `${examTypeLabel(exam.examType)} · ${formatDate(exam.date)} · ${exam.className}-${exam.sectionName}`
                          : 'Exam details unavailable'}
                      </CardDescription>
                      <p className="text-sm font-medium text-foreground">
                        {result.obtained}/{result.total} — {result.percentage}% —
                        Grade {result.grade}
                      </p>
                    </div>
                    {exam && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSendResult(exam, result)}
                      >
                        <MessageCircle className="size-4" />
                        {result.deliveryStatus === 'sent'
                          ? 'Resend to Parent'
                          : 'Send to Parent'}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {exam ? (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {exam.subjects.map((subject) => (
                          <li
                            key={subject.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                          >
                            <span>{subject.name}</span>
                            <span className="font-medium">
                              {result.marks[subject.id] ?? 0}/{subject.maxMarks}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Subject breakdown unavailable.
                      </p>
                    )}
                    {result.lastSentAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Last WhatsApp send: {formatDate(result.lastSentAt)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="rounded-xl border shadow-sm ring-1 ring-border/60">
            <CardHeader>
              <CardTitle className="text-base">Parent notification log</CardTitle>
              <CardDescription>
                History of result messages sent to the guardian
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deliveries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No result notifications sent yet for this student.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-2 py-2 font-medium">Exam</th>
                        <th className="px-2 py-2 font-medium">Type</th>
                        <th className="px-2 py-2 font-medium">Phone</th>
                        <th className="px-2 py-2 font-medium">Status</th>
                        <th className="px-2 py-2 font-medium">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((d) => (
                        <tr key={d.id} className="border-b last:border-0">
                          <td className="px-2 py-2.5 font-medium">
                            {d.examTitle}
                          </td>
                          <td className="px-2 py-2.5">
                            <StatusBadge status={d.examType} />
                          </td>
                          <td className="px-2 py-2.5 font-mono text-xs">
                            {d.phone}
                          </td>
                          <td className="px-2 py-2.5">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="px-2 py-2.5 text-muted-foreground">
                            {formatDate(d.sentAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {sendPayload && (
        <SendResultsDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          exam={sendPayload.exam}
          results={sendPayload.results}
          onSent={() => {
            void refetchResults();
          }}
        />
      )}

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Edit Student</SheetTitle>
            <SheetDescription>
              Update details for {student.name}.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{student.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {student.studentId}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                toast.success('Student details saved');
                setEditOpen(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function InfoRow({ label, value, mono = false }: InfoRowProps): ReactNode {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`max-w-[60%] text-right font-medium text-foreground ${
          mono ? 'font-mono text-xs sm:text-sm' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  tone: 'success' | 'danger' | 'neutral' | 'primary';
}

function SummaryCard({ label, value, tone }: SummaryCardProps): ReactNode {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'danger'
        ? 'text-rose-700'
        : tone === 'primary'
          ? 'text-primary'
          : 'text-foreground';

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
