import type { Metadata } from 'next';

import { PageHeader } from '@/components/register/page-header';
import { PaymentForm } from '@/components/payments/payment-form';
import { getProject } from '@/lib/db/queries';

export const metadata: Metadata = { title: 'New certificate' };

export default async function NewPaymentPage() {
  const project = await getProject();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={`${project.code} · payment register`}
        title="New payment certificate"
        description="Net certified is calculated from the lines below. Override it only when the certificate itself disagrees with the arithmetic."
      />
      <PaymentForm currency={project.currency} />
    </div>
  );
}
