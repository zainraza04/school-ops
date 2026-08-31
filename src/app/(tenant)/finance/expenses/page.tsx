'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import { CalendarDays, Plus, Receipt, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { AppSelect } from '@/components/common/AppSelect';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { MOCK_EXPENSES } from '@/lib/mockData';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  Salary: 'bg-blue-50 text-blue-700 border-blue-200',
  Rent: 'bg-violet-50 text-violet-700 border-violet-200',
  Electricity: 'bg-amber-50 text-amber-700 border-amber-200',
  Stationery: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
};

const TODAY = '2026-08-31';
const MONTH_PREFIX = '2026-08';

interface ExpenseFormState {
  title: string;
  category: ExpenseCategory | '';
  amount: string;
  date: string;
  description: string;
}

const EMPTY_FORM: ExpenseFormState = {
  title: '',
  category: '',
  amount: '',
  date: TODAY,
  description: '',
};

export default function ExpensesPage(): ReactNode {
  const [expenses, setExpenses] = useState<Expense[]>(() => [...MOCK_EXPENSES]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<ExpenseFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => {
    const today = expenses
      .filter((e) => e.date === TODAY)
      .reduce((sum, e) => sum + e.amount, 0);
    const month = expenses
      .filter((e) => e.date.startsWith(MONTH_PREFIX))
      .reduce((sum, e) => sum + e.amount, 0);
    const session = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { today, month, session };
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
        return false;
      }
      if (dateFrom && expense.date < dateFrom) return false;
      if (dateTo && expense.date > dateTo) return false;
      return true;
    });
  }, [expenses, categoryFilter, dateFrom, dateTo]);

  const columns = useMemo<LegacyColumnDef<Expense, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              'border font-medium',
              CATEGORY_STYLES[row.original.category]
            )}
          >
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="max-w-[240px] truncate text-muted-foreground">
            {row.original.description || '—'}
          </span>
        ),
      },
    ],
    []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.amount || !form.date) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const newExpense: Expense = {
      id: `ex-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      amount,
      date: form.date,
      description: form.description.trim(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setSubmitting(false);
    setSheetOpen(false);
    setForm(EMPTY_FORM);
    toast.success('Expense recorded successfully');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Track school operating expenses for session 2026-27"
        breadcrumb={['Finance', 'Expenses']}
        action={
          <Button
            onClick={() => {
              setForm(EMPTY_FORM);
              setSheetOpen(true);
            }}
            aria-label="Add expense"
          >
            <Plus className="size-4" />
            Add Expense
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Today's Expenses"
          value={formatCurrency(totals.today)}
          icon={CalendarDays}
          iconColor="text-primary"
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(totals.month)}
          icon={Wallet}
          iconColor="text-warning"
        />
        <MetricCard
          title="Session Total"
          value={formatCurrency(totals.session)}
          icon={Receipt}
          iconColor="text-success"
        />
      </div>

      <FilterBar
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'all' },
              ...EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c })),
            ],
          },
        ]}
      >
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="sr-only">From date</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="From date"
            className="h-8 w-auto"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="sr-only">To date</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="To date"
            className="h-8 w-auto"
          />
        </label>
      </FilterBar>

      <DataTable
        data={filtered}
        columns={columns}
        pagination
        pageSize={25}
        emptyTitle="No expenses found"
        emptyDescription="Try adjusting your filters, or add a new expense."
      />

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setForm(EMPTY_FORM);
        }}
      >
        <SheetContent side="right" className="sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Add Expense</SheetTitle>
            <SheetDescription>
              Record a new school operating expense.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-1 flex-col">
            <div className="space-y-4 px-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="expense-title">Title</Label>
                <Input
                  id="expense-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. LESCO Bill"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <AppSelect
                  id="expense-category"
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      category: v as ExpenseCategory,
                    }))
                  }
                  placeholder="Select category"
                  aria-label="Category"
                  options={EXPENSE_CATEGORIES.map((c) => ({
                    value: c,
                    label: c,
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (PKR)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  min={1}
                  step={1}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="12000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Textarea
                  id="expense-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional notes"
                  rows={3}
                />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Saving…' : 'Save Expense'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
