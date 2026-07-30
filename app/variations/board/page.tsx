import { List } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/register/page-header';
import { VariationBoard } from '@/components/variations/variation-board';
import { Button } from '@/components/ui/button';
import { getRegister } from '@/lib/db/queries';

export const metadata: Metadata = { title: 'VO board' };

export default async function VariationBoardPage() {
  const { project, variations } = await getRegister();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${project.code} · VO log`}
        title="Variation board"
        description="Drag a card to change its status, or use the select on the card. Every move is written to the register and the activity log immediately."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/variations">
              <List className="size-3.5" /> Table view
            </Link>
          </Button>
        }
      />

      <VariationBoard variations={variations} currency={project.currency} />
    </div>
  );
}
