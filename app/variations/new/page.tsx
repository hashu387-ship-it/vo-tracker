import type { Metadata } from 'next';

import { PageHeader } from '@/components/register/page-header';
import { VariationForm } from '@/components/variations/variation-form';
import { getProject } from '@/lib/db/queries';

export const metadata: Metadata = { title: 'New variation' };

export default async function NewVariationPage() {
  const project = await getProject();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={`${project.code} · VO log`}
        title="New variation order"
        description="Log a change as soon as the VOR lands, even before it is priced — an unpriced entry still shows up as an action."
      />
      <VariationForm currency={project.currency} />
    </div>
  );
}
