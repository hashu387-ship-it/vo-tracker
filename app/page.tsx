import { ArrowUpRight, Banknote, FileWarning, Landmark, Wallet } from 'lucide-react';
import Link from 'next/link';

import {
  AgeingChart,
  CertifiedVsCollected,
  ProgressRing,
  StatusStackedBar,
  VariationStatusChart,
} from '@/components/charts/figures';
import { KpiGrid, KpiTile } from '@/components/register/kpi-tile';
import { DefinitionRow, PageHeader, Section } from '@/components/register/page-header';
import { StatusChip } from '@/components/register/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRegister } from '@/lib/db/queries';
import {
  compactMoney,
  formatDate,
  money,
  moneyWithUnit,
  percent,
  signedPercent,
} from '@/lib/domain/money';
import { VARIATION_STATUS_META } from '@/lib/domain/types';

export default async function CommandCentre() {
  const {
    project,
    variations,
    payments,
    asOf,
    paymentPosition: pos,
    variationPosition: vos,
    cashflow,
    ageing,
  } = await getRegister();

  const contractUplift =
    project.originalContractValue > 0
      ? project.revisedContractValue / project.originalContractValue - 1
      : 0;

  const openCertificates = payments
    .filter((payment) => (payment.received ?? 0) < payment.netCertified - 0.005)
    .sort((a, b) => b.sequence - a.sequence);

  const actionVariations = variations
    .filter((variation) => variation.status === 'pending_contractor')
    .sort((a, b) => (b.aconexDate ?? '').localeCompare(a.aconexDate ?? ''))
    .slice(0, 6);

  const latestCertificate = payments
    .filter((payment) => payment.kind === 'interim')
    .sort((a, b) => b.sequence - a.sequence)[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${project.code} · ${project.client}`}
        title="Command centre"
        description={
          <>
            {project.name} — {project.contractor}. Every figure below is derived live from the
            register and reconciles to the source workbook as of {formatDate(asOf)}.
          </>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/report">
              Printable report <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        }
      />

      {/* ---- Headline position ---- */}
      <KpiGrid>
        <KpiTile
          label="Revised contract"
          unit={project.currency}
          value={money(project.revisedContractValue)}
          caption={
            <>
              {signedPercent(contractUplift)} against the original{' '}
              {compactMoney(project.originalContractValue)}
            </>
          }
        />
        <KpiTile
          label="Work done"
          unit={project.currency}
          value={money(pos.totalWorkDone)}
          meter={pos.percentComplete}
          meterLabel={`${percent(pos.percentComplete)} of the revised contract certified`}
          caption={`${money(pos.balanceToComplete)} left to certify`}
        />
        <KpiTile
          label="Cash received"
          unit={project.currency}
          value={money(pos.cashReceivedTotal)}
          caption={`Across ${pos.interimCount} interim certificates and ${pos.advanceCount} advance payments`}
          tone="good"
        />
        <KpiTile
          label="Outstanding"
          unit={project.currency}
          value={money(pos.outstanding)}
          caption={`${pos.outstandingCount} certificate${pos.outstandingCount === 1 ? '' : 's'} certified but not collected`}
          tone={pos.outstanding > 0 ? 'warning' : 'good'}
          href="/cashflow"
        />
      </KpiGrid>

      {/* ---- Second row: VOs and securities ---- */}
      <KpiGrid>
        <KpiTile
          label="Variations submitted"
          unit={project.currency}
          value={money(vos.totalValue)}
          caption={`${vos.valuedCount} valued of ${vos.total} logged`}
          href="/variations"
        />
        <KpiTile
          label="Secured in contract"
          unit={project.currency}
          value={money(vos.settledValue)}
          caption={`${vos.settledCount} with a DVO issued`}
          tone="good"
          href="/variations?status=dvo_issued"
        />
        <KpiTile
          label="Advance outstanding"
          unit={project.currency}
          value={money(pos.advanceBalance)}
          meter={pos.advanceRecoveredPercent}
          meterLabel={`${percent(pos.advanceRecoveredPercent)} of ${compactMoney(pos.advanceTotal)} recovered`}
          tone="accent"
        />
        <KpiTile
          label="Retention held"
          unit={project.currency}
          value={money(pos.retentionDeducted)}
          meter={pos.retentionReleasedPercent}
          meterLabel={`${percent(pos.retentionReleasedPercent)} of the ${percent(project.retentionCapPercent, 0)} cap deducted`}
          tone="accent"
        />
      </KpiGrid>

      {/* ---- Charts ---- */}
      <div className="grid gap-4 xl:grid-cols-3">
        <CertifiedVsCollected data={cashflow} className="xl:col-span-2" />

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Contract completion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-5">
            <div className="flex justify-center pt-2">
              <ProgressRing
                value={pos.percentComplete}
                label="Certified"
                caption={`${money(pos.balanceToComplete)} of work still to certify`}
              />
            </div>
            <StatusStackedBar
              segments={[
                { label: 'Received', value: pos.received, status: 'received' },
                { label: 'Approved', value: pos.approved, status: 'approved_aconex' },
                { label: 'Submitted', value: pos.submitted, status: 'submitted_aconex' },
                { label: 'Under review', value: pos.underReview, status: 'under_review' },
                { label: 'Balance', value: pos.balanceToComplete, status: 'balance' },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VariationStatusChart data={vos.byStatus} />
        <AgeingChart data={ageing} />
      </div>

      {/* ---- Action lists ---- */}
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" />
              Certificates awaiting cash
            </CardTitle>
            <Button asChild variant="ghost" size="xs">
              <Link href="/payments">Open register</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-1">
            {openCertificates.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Every certificate has been collected in full.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {openCertificates.map((payment) => (
                  <li key={payment.id}>
                    <Link
                      href={`/payments/${payment.id}`}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate text-sm font-medium">{payment.ref}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {payment.period ?? '—'}
                        </p>
                      </div>
                      <StatusChip status={payment.status} kind="payment" short />
                      <span className="tnum ml-auto shrink-0 text-right text-sm font-medium">
                        {money(payment.netCertified - (payment.received ?? 0))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="size-4 text-serious" />
              Waiting on {project.contractor}
            </CardTitle>
            <Button asChild variant="ghost" size="xs">
              <Link href="/variations?status=pending_contractor">All {vos.pendingContractorCount}</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-1">
            {actionVariations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing sitting with the contractor.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {actionVariations.map((variation) => (
                  <li key={variation.id}>
                    <Link
                      href={`/variations/${variation.id}`}
                      className="block py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <p className="truncate text-sm font-medium">
                        {variation.voNumber ?? `#${variation.serial}`}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {variation.subject}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---- Contract particulars ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Contract" description="As recorded in the payment register header">
          <Card>
            <CardContent className="pt-5">
              <DefinitionRow label="Project" value={project.code} />
              <DefinitionRow label="Contractor" value={project.contractor} />
              <DefinitionRow label="Employer" value={project.client} />
              <DefinitionRow label="Contract date" value={formatDate(project.contractDate)} />
              <DefinitionRow
                label="Original contract"
                value={moneyWithUnit(project.originalContractValue, project.currency)}
              />
              <DefinitionRow
                label="Revised contract"
                value={moneyWithUnit(project.revisedContractValue, project.currency)}
                emphasise
              />
            </CardContent>
          </Card>
        </Section>

        <Section title="Securities" description="Advance payment recovery and retention">
          <Card>
            <CardContent className="pt-5">
              <DefinitionRow
                label="Advance payment"
                hint={`${percent(project.advancePaymentPercent, 0)} of the original contract`}
                value={money(pos.advanceTotal)}
              />
              <DefinitionRow label="Recovered to date" value={money(pos.advanceDeducted)} />
              <DefinitionRow label="Advance balance" value={money(pos.advanceBalance)} emphasise />
              <DefinitionRow
                label="Retention cap"
                hint={`${percent(project.retentionCapPercent, 0)} of the revised contract`}
                value={money(pos.retentionCap)}
              />
              <DefinitionRow label="Deducted to date" value={money(pos.retentionDeducted)} />
              <DefinitionRow label="Still to deduct" value={money(pos.retentionBalance)} emphasise />
            </CardContent>
          </Card>
        </Section>

        <Section
          title="Latest certificate"
          description={latestCertificate ? latestCertificate.ref : 'No certificates yet'}
        >
          <Card>
            <CardContent className="pt-5">
              {latestCertificate ? (
                <>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {latestCertificate.period ?? '—'}
                    </span>
                    <StatusChip status={latestCertificate.status} kind="payment" />
                  </div>
                  <DefinitionRow
                    label="Gross certified"
                    value={money(latestCertificate.grossCertified)}
                  />
                  <DefinitionRow
                    label="Advance recovery"
                    value={money(latestCertificate.advanceRecovery)}
                  />
                  <DefinitionRow label="Retention" value={money(latestCertificate.retention)} />
                  <DefinitionRow label="VAT" value={money(latestCertificate.vat)} />
                  <DefinitionRow
                    label="Net certified"
                    value={money(latestCertificate.netCertified)}
                    emphasise
                  />
                  <div className="pt-3">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/payments/${latestCertificate.id}`}>
                        <Banknote className="size-3.5" /> Open certificate
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Raise the first certificate to start the register.
                </p>
              )}
            </CardContent>
          </Card>
        </Section>
      </div>

      {/* ---- Variation status legend ---- */}
      <Section
        title="What each variation status means"
        description="The vocabulary used throughout the register"
      >
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {vos.byStatus.map((row) => (
            <Link
              key={row.status}
              href={`/variations?status=${row.status}`}
              className="rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-lift"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <StatusChip status={row.status} kind="variation" short />
                <span className="tnum text-sm font-semibold">{row.count}</span>
              </div>
              <p className="text-2xs leading-relaxed text-muted-foreground">
                {VARIATION_STATUS_META[row.status].description}
              </p>
              <p className="tnum mt-2 text-xs font-medium">
                {money(row.value)} <span className="font-normal text-muted-foreground">{project.currency}</span>
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <p className="flex items-center gap-1.5 text-2xs text-muted-foreground">
        <Landmark className="size-3" />
        Source: {project.sourceWorkbook ?? 'manual entry'} · all values {project.currency} ·{' '}
        {variations.length} variations · {payments.length} certificates
      </p>
    </div>
  );
}
