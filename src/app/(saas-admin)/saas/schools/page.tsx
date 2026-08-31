'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { FilterBar } from '@/components/common/FilterBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AppSelect } from '@/components/common/AppSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { MOCK_SCHOOLS } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { School, SubscriptionPlan } from '@/types/school.types';

interface RegisterForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerName: string;
  ownerEmail: string;
  plan: SubscriptionPlan;
  trial: boolean;
}

const EMPTY_FORM: RegisterForm = {
  name: '',
  address: '',
  phone: '',
  email: '',
  ownerName: '',
  ownerEmail: '',
  plan: 'basic',
  trial: true,
};

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  basic: 15000,
  professional: 35000,
  premium: 65000,
};

export default function SaasSchoolsPage(): ReactNode {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>(() => [...MOCK_SCHOOLS]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [planSchool, setPlanSchool] = useState<School | null>(null);
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('basic');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schools.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (planFilter !== 'all' && s.plan !== planFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.ownerName ?? '').toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [schools, search, statusFilter, planFilter]);

  const columns = useMemo<LegacyColumnDef<School, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'School',
        cell: ({ row }) => (
          <div>
            <Link
              href={`/saas/schools/${row.original.id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.original.name}
            </Link>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'ownerName',
        header: 'Owner',
        cell: ({ row }) => row.original.ownerName ?? '—',
      },
      {
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ row }) => (
          <span>
            {SUBSCRIPTION_PLANS[row.original.plan]}
            <span className="ml-1 text-xs text-muted-foreground">
              ({formatCurrency(PLAN_PRICES[row.original.plan])}/mo)
            </span>
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'totalStudents',
        header: 'Students',
        cell: ({ row }) =>
          row.original.totalStudents.toLocaleString('en-PK'),
      },
      {
        accessorKey: 'registeredDate',
        header: 'Registered',
        cell: ({ row }) =>
          row.original.registeredDate
            ? formatDate(row.original.registeredDate)
            : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const school = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${school.name}`}
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/saas/schools/${school.id}`)}
                >
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
                {school.status !== 'active' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSchools((prev) =>
                        prev.map((s) =>
                          s.id === school.id ? { ...s, status: 'active' } : s
                        )
                      );
                      toast.success(`${school.name} activated`);
                    }}
                  >
                    <CheckCircle2 className="size-4" />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setPlanSchool(school);
                    setNewPlan(school.plan);
                  }}
                >
                  <RefreshCw className="size-4" />
                  Change plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router]
  );

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.ownerName.trim() ||
      !form.ownerEmail.trim() ||
      !form.email.trim()
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const today = '2026-08-31';
    const newSchool: School = {
      id: `sch-${Date.now()}`,
      name: form.name.trim(),
      logo: null,
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: '',
      plan: form.plan,
      status: form.trial ? 'trial' : 'active',
      planStartDate: today,
      planRenewalDate: form.trial ? '2026-09-30' : '2027-08-31',
      totalStudents: 0,
      totalStaff: 1,
      ownerEmail: form.ownerEmail.trim(),
      ownerName: form.ownerName.trim(),
      registeredDate: today,
    };

    setSchools((prev) => [newSchool, ...prev]);
    setSubmitting(false);
    setSheetOpen(false);
    setForm(EMPTY_FORM);
    toast.success(`${newSchool.name} registered successfully`);
  }

  function confirmPlanChange(): void {
    if (!planSchool) return;
    setSchools((prev) =>
      prev.map((s) =>
        s.id === planSchool.id ? { ...s, plan: newPlan } : s
      )
    );
    toast.success(
      `${planSchool.name} moved to ${SUBSCRIPTION_PLANS[newPlan]}`
    );
    setPlanSchool(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        subtitle="Manage all tenant schools on the platform"
        action={
          <Button
            onClick={() => {
              setForm(EMPTY_FORM);
              setSheetOpen(true);
            }}
            aria-label="Register new school"
          >
            <Plus className="size-4" />
            Register New School
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search schools or owners…"
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Trial', value: 'trial' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
          {
            key: 'plan',
            label: 'Plan',
            value: planFilter,
            onChange: setPlanFilter,
            options: [
              { label: 'All Plans', value: 'all' },
              { label: 'Basic', value: 'basic' },
              { label: 'Professional', value: 'professional' },
              { label: 'Premium', value: 'premium' },
            ],
          },
        ]}
      />

      <DataTable
        data={filtered}
        columns={columns}
        pagination
        pageSize={25}
        emptyTitle="No schools found"
        emptyDescription="Try adjusting filters or register a new school."
      />

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setForm(EMPTY_FORM);
        }}
      >
        <SheetContent side="right" className="overflow-y-auto sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Register New School</SheetTitle>
            <SheetDescription>
              Create a tenant school with an owner account and subscription plan.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={(e) => void handleRegister(e)}
            className="flex flex-1 flex-col"
          >
            <div className="space-y-4 px-4 pb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                School
              </p>
              <div className="space-y-2">
                <Label htmlFor="reg-name">School Name</Label>
                <Input
                  id="reg-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-address">Address</Label>
                <Input
                  id="reg-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="City, Pakistan"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone</Label>
                  <Input
                    id="reg-phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="0XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Owner
              </p>
              <div className="space-y-2">
                <Label htmlFor="reg-owner-name">Owner Name</Label>
                <Input
                  id="reg-owner-name"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownerName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-owner-email">Owner Email</Label>
                <Input
                  id="reg-owner-email"
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownerEmail: e.target.value }))
                  }
                  required
                />
              </div>

              <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Plan
              </p>
              <div className="space-y-2">
                <Label htmlFor="reg-plan">Subscription Plan</Label>
                <AppSelect
                  id="reg-plan"
                  value={form.plan}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      plan: v as SubscriptionPlan,
                    }))
                  }
                  placeholder="Select plan"
                  aria-label="Subscription plan"
                  options={(
                    Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[]
                  ).map((key) => ({
                    value: key,
                    label: `${SUBSCRIPTION_PLANS[key]} — ${formatCurrency(PLAN_PRICES[key])}/mo`,
                  }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.trial}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trial: e.target.checked }))
                  }
                  className="size-4 rounded border"
                  aria-label="Start with 30-day trial"
                />
                Start with 30-day trial
              </label>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Registering…' : 'Register School'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(planSchool)}
        onOpenChange={(open) => {
          if (!open) setPlanSchool(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>
              Update subscription for {planSchool?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="change-plan">New plan</Label>
            <AppSelect
              id="change-plan"
              value={newPlan}
              onValueChange={(v) => setNewPlan(v as SubscriptionPlan)}
              placeholder="Select plan"
              aria-label="New plan"
              options={(
                Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[]
              ).map((key) => ({
                value: key,
                label: `${SUBSCRIPTION_PLANS[key]} — ${formatCurrency(PLAN_PRICES[key])}/mo`,
              }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanSchool(null)}>
              Cancel
            </Button>
            <Button onClick={confirmPlanChange}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
