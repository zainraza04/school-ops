import type { ReactNode } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { AdmissionForm } from '@/components/students/AdmissionForm';

export default function AdmissionsPage(): ReactNode {
  return (
    <div>
      <PageHeader
        title="New Admission"
        subtitle="Enroll a student in three short steps"
        breadcrumb={['Students', 'Admissions']}
      />
      <AdmissionForm />
    </div>
  );
}
