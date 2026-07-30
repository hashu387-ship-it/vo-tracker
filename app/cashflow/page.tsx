import { CalendarClock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AgeingChart,
  CertifiedVsCollected,
  DeductionsWaterfall,
  ForecastChart,
} from '@/components/charts/figures';
import { KpiGrid, KpiTile } from '@/components/register/kpi-tile';
import { DefinitionRow, PageHeader, Section } from '@/components/register/page-header';
import { StatusChip } from '@/components/register/status-chip';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getRegister } from '@/lib/db/queries';
import { formatDate, formatMonth, money, percent, relativeDays } from '@/lib/domain/money';

export const metadata: Metadata = { title: 'Cash flow' };

export default async function CashflowPage() {
  const {
    project,
    payments,
    asOf,
    paymentPosition: pos,
    cashflow,
    ageing,
    forecast,
  } = await getRegister();

  const outstanding = payments
    .filter((payment) => payment.netCertified - (payment.received ?? 0) > 0.005)
    .sort((a, b) => (a.taxInvoiceDate ?? '').localeCompare(b.taxInvoiceDate ?? ''));

  const totals = payments.reduce(
    (acc, payment) => ({
      gross: acc.gross + payment.grossCertified,
      advance: acc.advance + payment.advanceRecovery,
      backCharge: acc.backCharge + payment.backCharge,
      retention: acc.retention + payment.retention,
      vatAdvance: acc.vatAdvance + payment.vatOnAdvanceRecovery,
      vat: acc.vat + payment.vat,
    }),
    { gross: 0, advance: 0, backCharge: 0, retention: 0, vatAdvance: 0, vat: 0 },
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${project.code} · cash position`}
        title="Cash flow"
        description="How certified work has converted into cash, what is still outstanding, and where the contract lands at the current run rate."
      />

      <KpiGrid>
        <KpiTile
          label="Certified to date"
          unit={project.currency}
          value={money(pos.totalWorkDone)}
          meter={pos.percentComplete}
          meterLabel={`${percent(pos.percentComplete)} of the revised contract`}
        />
        <KpiTile
          label="Collected"
          unit={project.currency}
          value={money(pos.cashReceivedTotal)}
          caption="Including advance payments"
          tone="good"
        />
        <KpiTile
          label="Outstanding"
          unit={project.currency}
          value={money(pos.outstanding)}
          caption={`${pos.outstandingCount} certificate${pos.outstandingCount === 1 ? '' : 's'}`}
          tone={pos.outstanding > 0 ? 'warning' : 'good'}
        />
        <KpiTile
          label="Retention to release"
          unit={project.currency}
          value={money(pos.retentionDeducted)}
          caption="Held against the works, released on completion and defects"
          tone="accent"
        />
      </KpiGrid>

      <CertifiedVsCollected data={cashflow} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ForecastChart forecast={forecast} contractValue={project.revisedContractValue} />
        <AgeingChart data={ageing} />
      </div>

      <DeductionsWaterfall
        gross={totals.gross}
        advanceRecovery={totals.advance}
        retention={totals.retention}
        backCharge={totals.backCharge}
        vat={totals.vat}
        vatOnAdvance={totals.vatAdvance}
        net={pos.netCertifiedTotal}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Section
          title="Outstanding certificates"
          description="Certified value awaiting transfer, oldest invoice first"
          className="lg:col-span-2"
        >
          <Card>
            <CardContent className="p-0">
              {outstanding.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Nothing outstanding — every certificate has been collected.
                </p>
              ) : (
                <div className="data-scroll">
                  <Table>
                    <THead>
                      <TR className="hover:bg-transparent">
                        <TH>Certificate</TH>
                        <TH>Period</TH>
                        <TH>Tax invoice</TH>
                        <TH>Status</TH>
                        <TH numeric>Outstanding</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {outstanding.map((payment) => (
                        <TR key={payment.id}>
                          <TD>
                            <Link
                              href={`/payments/${payment.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {payment.ref}
                            </Link>
                          </TD>
                          <TD className="text-xs text-muted-foreground">{payment.period ?? '—'}</TD>
                          <TD className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(payment.taxInvoiceDate)}
                            {payment.taxInvoiceDate ? (
                              <span className="ml-1.5 text-2xs">
                                ({relativeDays(payment.taxInvoiceDate, asOf)})
                              </span>
                            ) : null}
                          </TD>
                          <TD>
                            <StatusChip status={payment.status} kind="payment" short />
                          </TD>
                          <TD numeric className="font-medium">
                            {money(payment.netCertified - (payment.received ?? 0))}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>

        <Section title="Completion outlook" description="Straight-line from the recent run rate">
          <Card>
            <CardContent className="pt-5">
              <DefinitionRow
                label="Run rate"
                hint={`Mean of the last ${forecast.basisCount} certificates`}
                value={money(forecast.runRate)}
              />
              <DefinitionRow
                label="Left to certify"
                value={money(pos.balanceToComplete)}
              />
              <DefinitionRow
                label="Certificates remaining"
                value={forecast.monthsToComplete === null ? '—' : String(forecast.monthsToComplete)}
              />
              <DefinitionRow
                label="Projected completion"
                value={
                  forecast.projectedCompletion ? formatMonth(forecast.projectedCompletion) : '—'
                }
                emphasise
              />
              <DefinitionRow
                label="Projected final account"
                hint="Revised contract plus probability-weighted open variations"
                value={money(forecast.projectedFinalAccount)}
                emphasise
              />
              <p className="flex items-start gap-1.5 pt-3 text-2xs leading-relaxed text-muted-foreground">
                <CalendarClock className="mt-0.5 size-3 shrink-0" />
                Open variations are weighted by how far through the commercial cycle they are —
                agreed 100%, with the Employer 60%, joint 50%, with the contractor 30%.
              </p>
            </CardContent>
          </Card>
        </Section>
      </div>
    </div>
  );
}
