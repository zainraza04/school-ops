'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Briefcase,
  Receipt,
  Command,
} from 'lucide-react';
import {
  MOCK_RECEIPTS,
  MOCK_STAFF,
  MOCK_STUDENTS,
} from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  group: 'Students' | 'Staff' | 'Receipts';
  title: string;
  subtitle: string;
  href: string;
}

interface GlobalSearchProps {
  className?: string;
}

function buildResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const students: SearchResult[] = MOCK_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q)
  )
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      group: 'Students' as const,
      title: s.name,
      subtitle: `${s.studentId} · ${s.className}-${s.sectionName}`,
      href: `/students/${s.id}`,
    }));

  const staff: SearchResult[] = MOCK_STAFF.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      s.phone.includes(q)
  )
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      group: 'Staff' as const,
      title: s.name,
      subtitle: `${s.designation} · ${s.phone}`,
      href: '/staff',
    }));

  const receipts: SearchResult[] = MOCK_RECEIPTS.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(q) ||
      r.studentName.toLowerCase().includes(q) ||
      r.studentId.toLowerCase().includes(q)
  )
    .slice(0, 5)
    .map((r) => ({
      id: r.receiptNumber,
      group: 'Receipts' as const,
      title: r.receiptNumber,
      subtitle: `${r.studentName} · ${formatCurrency(r.amount)} · ${r.feeMonth}`,
      href: '/fees/receipts',
    }));

  return [...students, ...staff, ...receipts];
}

const GROUP_ICONS = {
  Students: Users,
  Staff: Briefcase,
  Receipts: Receipt,
} as const;

export function GlobalSearch({ className }: GlobalSearchProps): ReactNode {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = buildResults(query);
  const groups = (['Students', 'Staff', 'Receipts'] as const).filter((g) =>
    results.some((r) => r.group === g)
  );

  const handleSelect = (href: string): void => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Open global search"
      >
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <span className="hidden text-muted-foreground sm:inline">
          Search students, staff, receipts…
        </span>
        <kbd className="pointer-events-none ml-auto hidden h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          <Command className="size-2.5" aria-hidden />K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-lg"
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Global search</DialogTitle>
            <DialogDescription>
              Search students, staff, and receipts
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, staff, receipts…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              autoFocus
              aria-label="Search query"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {query.trim() && results.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
            {!query.trim() && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Type to search across students, staff, and receipts
              </p>
            )}
            {groups.map((group) => {
              const Icon = GROUP_ICONS[group];
              const items = results.filter((r) => r.group === group);
              return (
                <div key={group} className="mb-3">
                  <p className="mb-1 flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
                    <Icon className="size-3.5" aria-hidden />
                    {group}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item.href)}
                          className="flex w-full flex-col rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
