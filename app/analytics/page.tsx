import type { Metadata } from 'next';
import Link from 'next/link';

import { VariationStatusChart } from '@/components/charts/figures';
import { KpiGrid, KpiTile } from '@/components/register/kpi-tile';
import { DefinitionRow, PageHeader, Section } from '@/components/register/page-header';
import { StatusChip } from '@/components/register/status-chip';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getRegister } from '@/lib/db/queries';
import { compactMoney, money, percent, signedPercent } from '@/lib/domain/money';
import { VARIATION_STATUS_META, type Variation } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'Analytics' };

function byYear(variations: Variation[]) {
  const map = new Map<string, { count: number; value: number }>();
  for (const variation of variations) {
    const year = (variation.aconexDate ?? variation.submissionDate ?? '').slice(0, 4) || 'Undated';
    const entry = map.get(year) ?? { count: 0, value: 0 };
    entry.count += 1;
    entry.value += variation.agreedValue ?? 0;
    map.set(year, entry);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function AnalyticsPage() {
  const { project, variations, variationPosition: vos, paymentPosition: pos } = await getRegister();

  const topAdditions = variations
    .filter((variation) => (variation.agreedValue ?? 0) > 0)
    .sort((a, b) => (b.agreedValue ?? 0) - (a.agreedValue ?? 0))
    .slice(0, 10);

  const topOmissions = variations
    .filter((variation) => (variation.agreedValue ?? 0) < 0)
    .sort((a, b) => (a.agreedValue ?? 0) - (b.agreedValue ?? 0))
    .slice(0, 8);

  const assessed = variations
    .filter((v) => v.proposalValue !== null && v.clientAssessment !== null)
    .map((v) => ({
      ...v,
      delta: (v.clientAssessment ?? 0) - (v.proposalValue ?? 0),
      ratio: v.proposalValue ? (v.clientAssessment ?? 0) / v.proposalValue - 1 : null,
    }))
    .sort((a, b) => a.delta - b.delta);

  const proposalTotal = assessed.reduce((sum, v) => sum + (v.proposalValue ?? 0), 0);
  const assessmentTotal = assessed.reduce((sum, v) => sum + (v.clientAssessment ?? 0), 0);
  const acceptanceRate = proposalTotal ? assessmentTotal / proposalTotal : null;

  const byType = ['VO', 'RFI', 'Gen CORR'].map((type) => {
    const rows = variations.filter((variation) => variation.submissionType === type);
    return {
      type,
      count: rows.length,
      value: rows.reduce((sum, variation) => sum + (variation.agreedValue ?? 0), 0),
    };
  });

  const owners = Array.from(
    variations.reduce((map, variation) => {
      if (!variation.owner) return map;
      const entry = map.get(variation.owner) ?? { count: 0, open: 0 };
      entry.count += 1;
      if (
        variation.status &&
        ['pending_contractor', 'pending_client', 'pending_joint'].includes(variation.status)
      ) {
        entry.open += 1;
      }
      map.set(variation.owner, entry);
      return map;
    }, new Map<string, { count: number; open: number }>()),
  ).sort((a, b) => b[1].count - a[1].count);

  const years = byYear(variations);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${project.code} · analysis`}
        title="Analytics"
        description="Where the variation value sits, how the Employer's assessments compare to the cost proposals, and who is carrying the open items."
      />

      <KpiGrid>
        <KpiTile
          label="Variation uplift"
          value={percent(
            project.originalContractValue
              ? vos.totalValue / project.originalContractValue
              : 0,
          )}
          caption={`${money(vos.totalValue)} against an original contract of ${compactMoney(project.originalContractValue)}`}
        />
        <KpiTile
          label="Assessment acceptance"
          value={acceptanceRate === null ? '—' : percent(acceptanceRate)}
          caption={`${assessed.length} variations where both a proposal and an assessment exist`}
          tone={acceptanceRate !== null && acceptanceRate < 0.9 ? 'warning' : 'good'}
        />
        <KpiTile
          label="Assessment movement"
          unit={project.currency}
          value={money(vos.assessmentDelta)}
          caption="Total difference between assessed and proposed values"
          tone={vos.assessmentDelta < 0 ? 'serious' : 'good'}
        />
        <KpiTile
          label="Open with a party"
          value={String(vos.openCount)}
          caption={`${vos.pendingContractorCount} with ${project.contractor} · ${vos.pendingClientCount} with ${project.client}`}
          tone="warning"
        />
      </KpiGrid>

      <div className="grid gap-[var(--grid-gap)] xl:grid-cols-2">
        <VariationStatusChart data={vos.byStatus} />

        <Section title="Value by status" description="Agreed value carried by each status">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              {vos.byStatus.map((row) => (
                <DefinitionRow
                  key={row.status}
                  label={VARIATION_STATUS_META[row.status].label}
                  hint={`${row.count} variation${row.count === 1 ? '' : 's'}`}
                  value={
                    <span className={row.value < 0 ? 'text-destructive' : undefined}>
                      {money(row.value)}
                    </span>
                  }
                />
              ))}
              <DefinitionRow label="Total submitted" value={money(vos.totalValue)} emphasise />
            </CardContent>
          </Card>
        </Section>
      </div>

      <div className="grid gap-[var(--grid-gap)] xl:grid-cols-2">
        <Section title="Largest additions" description="The ten variations adding the most value">
          <Card>
            <CardContent className="p-0">
              <div className="data-scroll">
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>VO</TH>
                      <TH>Subject</TH>
                      <TH numeric>Agreed value</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {topAdditions.map((variation) => (
                      <TR key={variation.id}>
                        <TD>
                          <Link
                            href={`/variations/${variation.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {variation.voNumber ?? `#${variation.serial}`}
                          </Link>
                        </TD>
                        <TD className="max-w-xs">
                          <span className="line-clamp-1 text-xs">{variation.subject}</span>
                        </TD>
                        <TD numeric className="font-medium">
                          {money(variation.agreedValue)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="Largest omissions" description="Scope taken back out of the contract">
          <Card>
            <CardContent className="p-0">
              <div className="data-scroll">
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>VO</TH>
                      <TH>Subject</TH>
                      <TH numeric>Agreed value</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {topOmissions.map((variation) => (
                      <TR key={variation.id}>
                        <TD>
                          <Link
                            href={`/variations/${variation.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {variation.voNumber ?? `#${variation.serial}`}
                          </Link>
                        </TD>
                        <TD className="max-w-xs">
                          <span className="line-clamp-1 text-xs">{variation.subject}</span>
                        </TD>
                        <TD numeric className="font-medium text-destructive">
                          {money(variation.agreedValue)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>

      <Section
        title="Cost proposal against Employer assessment"
        description="Sorted by the largest reduction — these are the variations where the commercial argument matters most"
      >
        <Card>
          <CardContent className="p-0">
            <div className="data-scroll max-h-[420px] overflow-y-auto">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>VO</TH>
                    <TH>Subject</TH>
                    <TH>Status</TH>
                    <TH numeric>Cost proposal</TH>
                    <TH numeric>{project.client} assessment</TH>
                    <TH numeric>Movement</TH>
                    <TH numeric>%</TH>
                  </TR>
                </THead>
                <TBody>
                  {assessed.map((variation) => (
                    <TR key={variation.id}>
                      <TD>
                        <Link
                          href={`/variations/${variation.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {variation.voNumber ?? `#${variation.serial}`}
                        </Link>
                      </TD>
                      <TD className="max-w-sm">
                        <span className="line-clamp-1 text-xs">{variation.subject}</span>
                      </TD>
                      <TD>
                        <StatusChip status={variation.status} kind="variation" short />
                      </TD>
                      <TD numeric>{money(variation.proposalValue)}</TD>
                      <TD numeric>{money(variation.clientAssessment)}</TD>
                      <TD
                        numeric
                        className={
                          variation.delta < 0 ? 'font-medium text-destructive' : 'font-medium text-good'
                        }
                      >
                        {money(variation.delta)}
                      </TD>
                      <TD numeric className="text-xs text-muted-foreground">
                        {variation.ratio === null ? '—' : signedPercent(variation.ratio, 0)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Section>

      <div className="grid gap-[var(--grid-gap)] lg:grid-cols-3">
        <Section title="By submission route" description="How each change was raised">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              {byType.map((row) => (
                <DefinitionRow
                  key={row.type}
                  label={row.type}
                  hint={`${row.count} submission${row.count === 1 ? '' : 's'}`}
                  value={money(row.value)}
                />
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section title="By year raised" description="Volume and value of change over time">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              {years.map(([year, entry]) => (
                <DefinitionRow
                  key={year}
                  label={year}
                  hint={`${entry.count} variation${entry.count === 1 ? '' : 's'}`}
                  value={money(entry.value)}
                />
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section title="Workload" description="Who is named against each variation">
          <Card>
            <CardContent className="pt-[var(--card-padding)]">
              {owners.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No owners recorded.</p>
              ) : (
                owners.map(([owner, entry]) => (
                  <DefinitionRow
                    key={owner}
                    label={owner}
                    hint={`${entry.open} still open`}
                    value={String(entry.count)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </Section>
      </div>

      <p className="text-2xs text-muted-foreground">
        Work certified to date {money(pos.totalWorkDone)} {project.currency} ·{' '}
        {percent(pos.percentComplete)} of the revised contract.
      </p>
    </div>
  );
}
