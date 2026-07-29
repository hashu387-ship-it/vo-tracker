import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/register/page-header';
import { PaymentForm } from '@/components/payments/payment-form';
import { getPayment, getProject } from '@/lib/db/queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const payment = await getPayment(id);
  return { title: payment ? `Edit ${payment.ref}` : 'Not found' };
}

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [payment, project] = await Promise.all([getPayment(id), getProject()]);
  if (!payment) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={`${project.code} · payment register`}
        title={`Edit ${payment.ref}`}
        description={payment.period ?? undefined}
      />
      <PaymentForm payment={payment} currency={project.currency} />
    </div>
  );
}
