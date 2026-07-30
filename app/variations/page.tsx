import { Columns3, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { KpiGrid, KpiTile } from '@/components/register/kpi-tile';
import { PageHeader } from '@/components/register/page-header';
import { VariationTable } from '@/components/variations/variation-table';
import { Button } from '@/components/ui/button';
import { getRegister } from '@/lib/db/queries';
import { money } from '@/lib/domain/money';

export const metadata: Metadata = { title: 'Variation orders' };

export default async function VariationsPage() {
  const { project, variations, variationPosition: vos } = await getRegister();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${project.code} · VO log`}
        title="Variation orders"
        description="Every change raised on the package — cost proposals, assessments, agreed values and where each one sits."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/variations/board">
                <Columns3 className="size-3.5" /> Board
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/variations/new">
                <Plus className="size-3.5" /> New variation
              </Link>
            </Button>
          </>
        }
      />

      <KpiGrid>
        <KpiTile
          label="Total submitted"
          unit={project.currency}
          value={money(vos.totalValue)}
          caption={`${vos.valuedCount} valued of ${vos.total} logged`}
        />
        <KpiTile
          label="Additions"
          unit={project.currency}
          value={money(vos.additionsValue)}
          caption="Value added by variations"
          tone="good"
        />
        <KpiTile
          label="Omissions"
          unit={project.currency}
          value={money(vos.omissionsValue)}
          caption="Value taken back out of scope"
          tone="serious"
        />
        <KpiTile
          label="Awaiting assessment"
          unit={project.currency}
          value={money(vos.unassessedProposalValue)}
          caption={`${vos.unassessedCount} cost proposals priced but not yet assessed`}
          tone="warning"
        />
      </KpiGrid>

      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}>
        <VariationTable variations={variations} currency={project.currency} />
      </Suspense>
    </div>
  );
}
