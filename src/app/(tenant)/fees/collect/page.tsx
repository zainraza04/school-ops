import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { FeeCollectionForm } from '@/components/fees/FeeCollectionForm';

export default function FeeCollectPage(): ReactNode {
  return (
    <div>
      <PageHeader
        title="Collect Fee"
        subtitle="Search a student and record payment"
        breadcrumb={['Fees', 'Collect']}
      />
      <Suspense fallback={<LoadingState variant="cards" />}>
        <FeeCollectionForm />
      </Suspense>
    </div>
  );
}
