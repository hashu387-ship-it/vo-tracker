import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DefinitionRow, PageHeader, Section } from '@/components/register/page-header';
import { StatusChip } from '@/components/register/status-chip';
import { StatusPicker } from '@/components/variations/status-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProject, getVariation, getVariations } from '@/lib/db/queries';
import { formatDate, money, moneyWithUnit, signedPercent } from '@/lib/domain/money';
import { VARIATION_STATUS_META } from '@/lib/domain/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const variation = await getVariation(id);
  if (!variation) return { title: 'Variation not found' };
  return { title: `${variation.voNumber ?? `#${variation.serial}`} — ${variation.subject}` };
}

export default async function VariationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [variation, project, all] = await Promise.all([
    getVariation(id),
    getProject(),
    getVariations(),
  ]);

  if (!variation) notFound();

  const index = all.findIndex((row) => row.id === variation.id);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  const delta =
    variation.proposalValue !== null && variation.clientAssessment !== null
      ? variation.clientAssessment - variation.proposalValue
      : null;
  const deltaPercent =
    delta !== null && variation.proposalValue
      ? variation.clientAssessment! / variation.proposalValue - 1
      : null;

  const timeline = [
    { label: 'Raised in Aconex', date: variation.aconexDate, detail: variation.vorRef },
    { label: 'Cost proposal submitted', date: variation.submissionDate, detail: variation.submissionRef },
    { label: 'Response received', date: null, detail: variation.responseRef },
    {
      label: 'Determination issued',
      date: null,
      detail: variation.dvoRef ?? variation.dvoReference,
    },
  ].filter((step) => step.date || step.detail);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="no-print flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/variations">
            <ArrowLeft className="size-3.5" /> VO log
          </Link>
        </Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {previous ? (
            <Button asChild variant="ghost" size="xs">
              <Link href={`/variations/${previous.id}`}>← {previous.voNumber ?? `#${previous.serial}`}</Link>
            </Button>
          ) : null}
          {next ? (
            <Button asChild variant="ghost" size="xs">
              <Link href={`/variations/${next.id}`}>{next.voNumber ?? `#${next.serial}`} →</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <PageHeader
        eyebrow={`${project.code} · variation ${variation.serial} of ${all.length}`}
        title={variation.voNumber ?? `Variation #${variation.serial}`}
        description={variation.subject}
        actions={
          <>
            <StatusPicker id={variation.id} kind="variation" status={variation.status} />
            <Button asChild size="sm">
              <Link href={`/variations/${variation.id}/edit`}>
                <Pencil className="size-3.5" /> Edit
              </Link>
            </Button>
          </>
        }
      />

      {variation.status ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-card">
          <StatusChip status={variation.status} kind="variation" />
          <p className="text-xs text-muted-foreground">
            {VARIATION_STATUS_META[variation.status].description}
          </p>
        </div>
      ) : null}

      <div className="grid gap-[var(--grid-gap)] lg:grid-cols-3">
        <Section title="Commercial position" className="lg:col-span-2">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              <DefinitionRow
                label="Cost proposal value"
                hint={`Priced by ${project.contractor}`}
                value={
                  variation.proposalValue === null
                    ? 'Not priced'
                    : moneyWithUnit(variation.proposalValue, project.currency)
                }
              />
              <DefinitionRow
                label={`${project.client} assessment`}
                value={
                  variation.clientAssessment === null
                    ? 'Not assessed'
                    : moneyWithUnit(variation.clientAssessment, project.currency)
                }
              />
              {delta !== null ? (
                <DefinitionRow
                  label="Assessment movement"
                  hint="Employer assessment against the cost proposal"
                  value={
                    <span className={delta < 0 ? 'text-destructive' : 'text-good'}>
                      {money(delta)}
                      {deltaPercent !== null ? ` (${signedPercent(deltaPercent)})` : ''}
                    </span>
                  }
                />
              ) : null}
              <DefinitionRow
                label="Agreed value"
                hint="Carried into the commercial summary"
                value={
                  variation.agreedValue === null
                    ? 'Not agreed'
                    : moneyWithUnit(variation.agreedValue, project.currency)
                }
                emphasise
              />
            </CardContent>
          </Card>
        </Section>

        <Section title="Record">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              <DefinitionRow label="Submission type" value={variation.submissionType ?? '—'} />
              <DefinitionRow label="Raised in Aconex" value={formatDate(variation.aconexDate)} />
              <DefinitionRow label="Submitted" value={formatDate(variation.submissionDate)} />
              <DefinitionRow label="Owner" value={variation.owner ?? '—'} />
              <DefinitionRow
                label="Last updated"
                value={formatDate(variation.updatedAt.slice(0, 10))}
              />
            </CardContent>
          </Card>
        </Section>
      </div>

      <div className="grid gap-[var(--grid-gap)] lg:grid-cols-2">
        <Section title="References">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              <DefinitionRow label="VOR" value={variation.vorRef ?? '—'} />
              <DefinitionRow label="DVO" value={variation.dvoRef ?? '—'} />
              <DefinitionRow label="DVO short ref" value={variation.dvoReference ?? '—'} />
              <DefinitionRow label="Submission ref" value={variation.submissionRef ?? '—'} />
              <DefinitionRow label="Response ref" value={variation.responseRef ?? '—'} />
              {variation.aconexLink || variation.submissionLink ? (
                <div className="flex flex-wrap gap-2 pt-3">
                  {variation.aconexLink ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={variation.aconexLink} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="size-3.5" /> Open in Aconex
                      </a>
                    </Button>
                  ) : null}
                  {variation.submissionLink ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={variation.submissionLink} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="size-3.5" /> View submission
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Section>

        <Section title="Progress">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              {timeline.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No dates or references recorded yet.
                </p>
              ) : (
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {timeline.map((step) => (
                    <li key={step.label} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-[1.44rem] top-1.5 size-2 rounded-full bg-primary ring-4 ring-card"
                      />
                      <p className="text-xs font-medium">{step.label}</p>
                      {step.date ? (
                        <p className="text-2xs text-muted-foreground">{formatDate(step.date)}</p>
                      ) : null}
                      {step.detail ? (
                        <p className="break-all text-2xs text-muted-foreground">{step.detail}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </Section>
      </div>

      <div className="grid gap-[var(--grid-gap)] lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{project.contractor} remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {variation.contractorRemarks ?? 'No remarks recorded.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{project.client} remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {variation.clientRemarks ?? 'No remarks recorded.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
