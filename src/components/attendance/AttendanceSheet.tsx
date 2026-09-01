'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { CheckCheck, Loader2, Users } from 'lucide-react';
import { useAttendanceSheet, useSaveAttendance } from '@/hooks/useAttendance';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { AppSelect } from '@/components/common/AppSelect';
import { CLASSES, SECTIONS } from '@/lib/constants';
import { cn, formatDate, getInitials } from '@/lib/utils';
import type { AttendanceRecord, AttendanceStatus } from '@/types/attendance.types';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AttendanceSheet(): ReactNode {
  const [date, setDate] = useState(todayIso);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const { isFetching, isError, refetch } = useAttendanceSheet(
    classId,
    sectionId,
    date,
    loaded
  );
  const saveMutation = useSaveAttendance();

  const sectionsForClass = useMemo(
    () => SECTIONS.filter((s) => s.classId === classId),
    [classId]
  );

  const className = CLASSES.find((c) => c.id === classId)?.name ?? '';
  const sectionName = sectionsForClass.find((s) => s.id === sectionId)?.name ?? '';

  async function handleLoad(): Promise<void> {
    if (!classId || !sectionId || !date) {
      toast.error('Select date, class, and section first');
      return;
    }
    setLoaded(true);
    const result = await refetch();
    if (result.data?.records) {
      setRecords(result.data.records.map((r) => ({ ...r })));
    }
  }

  function setStatus(studentId: string, status: AttendanceStatus): void {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  }

  function markAllPresent(): void {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
  }

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;

  async function handleSave(): Promise<void> {
    try {
      await saveMutation.mutateAsync({
        date,
        classId,
        sectionId,
        records,
      });
      toast.success('Attendance saved successfully');
    } catch {
      toast.error('Failed to save attendance. Please try again.');
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
        <CardContent className="p-5">
          {/* Mobile: stacked label + field pairs */}
          <div className="flex flex-col gap-4 sm:hidden">
            <div className="space-y-2">
              <Label htmlFor="attendance-date-mobile">Date</Label>
              <Input
                id="attendance-date-mobile"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setLoaded(false);
                  setRecords([]);
                }}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-class-mobile">Class</Label>
              <AppSelect
                id="attendance-class-mobile"
                value={classId}
                onValueChange={(v) => {
                  setClassId(v);
                  setSectionId('');
                  setLoaded(false);
                  setRecords([]);
                }}
                placeholder="Select class"
                options={CLASSES.map((c) => ({ value: c.id, label: c.name }))}
                aria-label="Class"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-section-mobile">Section</Label>
              <AppSelect
                id="attendance-section-mobile"
                value={sectionId}
                onValueChange={(v) => {
                  setSectionId(v);
                  setLoaded(false);
                  setRecords([]);
                }}
                placeholder="Select section"
                disabled={!classId}
                options={sectionsForClass.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                aria-label="Section"
              />
            </div>
            <Button
              type="button"
              className="h-10 w-full"
              onClick={() => {
                void handleLoad();
              }}
              disabled={isFetching || !classId || !sectionId || !date}
            >
              {isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <Users className="size-4" />
                  Load Students
                </>
              )}
            </Button>
          </div>

          {/* Desktop: labels row + controls row (button aligns with inputs) */}
          <div className="hidden gap-x-4 gap-y-2 sm:grid sm:grid-cols-[11rem_11rem_10rem_auto]">
            <Label htmlFor="attendance-date" className="col-start-1 row-start-1">
              Date
            </Label>
            <Label htmlFor="attendance-class" className="col-start-2 row-start-1">
              Class
            </Label>
            <Label htmlFor="attendance-section" className="col-start-3 row-start-1">
              Section
            </Label>

            <Input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setLoaded(false);
                setRecords([]);
              }}
              className="col-start-1 row-start-2 h-10"
            />
            <div className="col-start-2 row-start-2 min-w-0">
              <AppSelect
                id="attendance-class"
                value={classId}
                onValueChange={(v) => {
                  setClassId(v);
                  setSectionId('');
                  setLoaded(false);
                  setRecords([]);
                }}
                placeholder="Select class"
                options={CLASSES.map((c) => ({ value: c.id, label: c.name }))}
                aria-label="Class"
              />
            </div>
            <div className="col-start-3 row-start-2 min-w-0">
              <AppSelect
                id="attendance-section"
                value={sectionId}
                onValueChange={(v) => {
                  setSectionId(v);
                  setLoaded(false);
                  setRecords([]);
                }}
                placeholder="Select section"
                disabled={!classId}
                options={sectionsForClass.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                aria-label="Section"
              />
            </div>
            <Button
              type="button"
              className="col-start-4 row-start-2 h-10 w-auto"
              onClick={() => {
                void handleLoad();
              }}
              disabled={isFetching || !classId || !sectionId || !date}
            >
              {isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <Users className="size-4" />
                  Load Students
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isFetching && loaded && <LoadingState variant="table" rows={6} />}

      {isError && loaded && !isFetching && (
        <EmptyState
          title="Failed to load attendance"
          description="Could not load students for this class. Please try again."
          action={{
            label: 'Retry',
            onClick: () => {
              void handleLoad();
            },
          }}
        />
      )}

      {!isFetching && loaded && records.length === 0 && !isError && (
        <EmptyState
          title="No students found"
          description="There are no active students in this class and section."
        />
      )}

      {!isFetching && records.length > 0 && (
        <>
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground">
              {className}-{sectionName} | {formatDate(date)} | {records.length}{' '}
              Students
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
              onClick={markAllPresent}
            >
              <CheckCheck className="size-4" />
              Mark All Present
            </Button>
          </div>

          <ul className="space-y-2">
            {records.map((record) => (
              <li
                key={record.studentId}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between',
                  record.status === 'present'
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-rose-200 bg-rose-50/60'
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(record.studentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {record.studentName}
                    </p>
                    {record.fatherName && (
                      <p className="truncate text-sm text-muted-foreground">
                        S/O {record.fatherName}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="flex gap-2"
                  role="radiogroup"
                  aria-label={`Attendance for ${record.studentName}`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={record.status === 'present'}
                    onClick={() => setStatus(record.studentId, 'present')}
                    className={cn(
                      'min-h-11 min-w-[5.5rem] rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      record.status === 'present'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={record.status === 'absent'}
                    onClick={() => setStatus(record.studentId, 'absent')}
                    className={cn(
                      'min-h-11 min-w-[5.5rem] rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      record.status === 'absent'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    Absent
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-emerald-700">
                Present: {presentCount}
              </span>
              <span className="mx-2 text-border">|</span>
              <span className="font-semibold text-rose-700">
                Absent: {absentCount}
              </span>
            </p>
            <Button
              type="button"
              onClick={() => {
                void handleSave();
              }}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Attendance'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
