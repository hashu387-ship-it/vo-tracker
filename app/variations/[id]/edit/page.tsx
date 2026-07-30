import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/register/page-header';
import { VariationForm } from '@/components/variations/variation-form';
import { getProject, getVariation } from '@/lib/db/queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const variation = await getVariation(id);
  return { title: variation ? `Edit ${variation.voNumber ?? `#${variation.serial}`}` : 'Not found' };
}

export default async function EditVariationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [variation, project] = await Promise.all([getVariation(id), getProject()]);
  if (!variation) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={`${project.code} · VO log`}
        title={`Edit ${variation.voNumber ?? `variation #${variation.serial}`}`}
        description={variation.subject}
      />
      <VariationForm variation={variation} currency={project.currency} />
    </div>
  );
}
