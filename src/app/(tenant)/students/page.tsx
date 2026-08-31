import type { ReactNode } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { StudentTable } from '@/components/students/StudentTable';
import { buttonVariants } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudentsPage(): ReactNode {
  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage enrolled students across all classes"
        breadcrumb={['Students']}
        action={
          <Link
            href="/students/admissions"
            className={cn(buttonVariants())}
          >
            <UserPlus className="size-4" />
            Add Student
          </Link>
        }
      />
      <StudentTable />
    </div>
  );
}
