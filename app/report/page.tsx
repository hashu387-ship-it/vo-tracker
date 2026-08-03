import type { Metadata } from 'next';
import Image from 'next/image';

import { PrintButton } from '@/components/register/print-button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getRegister } from '@/lib/db/queries';
import { formatDate, money, percent, signedPercent } from '@/lib/domain/money';
import { PAYMENT_STATUS_META, VARIATION_STATUS_META } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'Commercial report' };

/**
 * A single-page commercial report, laid out for A4 print. It deliberately uses
 * no charts — this is the version that gets attached to an email.
 */
export default async function ReportPage() {
  const {
    project,
    variations,
    payments,
    asOf,
    paymentPosition: pos,
    variationPosition: vos,
    forecast,
  } = await getRegister();

  const uplift =
    project.originalContractValue > 0
      ? project.revisedContractValue / project.originalContractValue - 1
      : 0;

  const outstanding = payments
    .filter((payment) => payment.netCertified - (payment.received ?? 0) > 0.005)
    .sort((a, b) => a.sequence - b.sequence);

  const openVariations = variations
    .filter(
      (variation) =>
        variation.status &&
        ['pending_contractor', 'pending_client', 'pending_joint', 'approved_pending_dvo'].includes(
          variation.status,
        ),
    )
    .sort((a, b) => (b.agreedValue ?? b.proposalValue ?? 0) - (a.agreedValue ?? a.proposalValue ?? 0))
    .slice(0, 15);

  const block = (heading: string, rows: Array<[string, string]>) => (
    <div className="surface p-4">
      <h2 className="eyebrow mb-2">{heading}</h2>
      <dl className="space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 text-xs">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tnum font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <header className="flex items-start justify-between gap-4 border-b-2 border-accent pb-3">
        <div className="flex items-center gap-3">
          <Image src="/rsg-logo.png" alt="" width={44} height={44} className="h-11 w-auto" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {project.code} — Commercial Report
            </h1>
            <p className="text-xs text-muted-foreground">
              {project.name} · {project.contractor} for {project.client}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xs uppercase tracking-wider text-muted-foreground">As of</p>
          <p className="text-sm font-medium">{formatDate(asOf)}</p>
          <PrintButton />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {block('I. Contract', [
          ['Original contract', money(project.originalContractValue)],
          ['Revised contract', money(project.revisedContractValue)],
          ['Uplift', signedPercent(uplift)],
          ['Contract date', formatDate(project.contractDate)],
        ])}
        {block('II. Work done', [
          ['Received', money(pos.received)],
          ['Approved via Aconex', money(pos.approved)],
          ['Total work done', money(pos.totalWorkDone)],
          ['Percent complete', percent(pos.percentComplete)],
          ['Balance to complete', money(pos.balanceToComplete)],
        ])}
        {block('III. Cash', [
          ['Net certified', money(pos.netCertifiedTotal)],
          ['Cash received', money(pos.cashReceivedTotal)],
          ['Outstanding', money(pos.outstanding)],
          ['Under review', money(pos.underReview)],
        ])}
        {block('IV. Advance payment', [
          ['Total advance', money(pos.advanceTotal)],
          ['Recovered to date', money(pos.advanceDeducted)],
          ['Balance', money(pos.advanceBalance)],
          ['Recovered %', percent(pos.advanceRecoveredPercent)],
        ])}
        {block('V. Retention', [
          [`Cap (${percent(project.retentionCapPercent, 0)})`, money(pos.retentionCap)],
          ['Deducted to date', money(pos.retentionDeducted)],
          ['Still to deduct', money(pos.retentionBalance)],
        ])}
        {block('VI. Variations', [
          ['Total submitted', money(vos.totalValue)],
          ['Secured (DVO issued)', money(vos.settledValue)],
          ['Open with a party', money(vos.openValue)],
          ['Variations logged', String(vos.total)],
        ])}
      </div>

      <div className="surface p-4">
        <h2 className="eyebrow mb-2">Variation status summary</h2>
        <div className="data-scroll">
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Status</TH>
              <TH numeric>Count</TH>
              <TH numeric>Agreed value ({project.currency})</TH>
            </TR>
          </THead>
          <TBody>
            {vos.byStatus.map((row) => (
              <TR key={row.status}>
                <TD className="text-xs">{VARIATION_STATUS_META[row.status].label}</TD>
                <TD numeric className="text-xs">
                  {row.count}
                </TD>
                <TD numeric className="text-xs">
                  {money(row.value)}
                </TD>
              </TR>
            ))}
            <TR className="font-semibold">
              <TD className="text-xs">Total submitted</TD>
              <TD numeric className="text-xs">
                {vos.valuedCount}
              </TD>
              <TD numeric className="text-xs">
                {money(vos.totalValue)}
              </TD>
            </TR>
          </TBody>
        </Table>
        </div>
      </div>

      {outstanding.length > 0 ? (
        <div className="surface p-4">
          <h2 className="eyebrow mb-2">Certificates awaiting payment</h2>
          <div className="data-scroll">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Ref</TH>
                <TH>Period</TH>
                <TH>Status</TH>
                <TH numeric>Net certified</TH>
                <TH numeric>Outstanding</TH>
              </TR>
            </THead>
            <TBody>
              {outstanding.map((payment) => (
                <TR key={payment.id}>
                  <TD className="text-xs font-medium">{payment.ref}</TD>
                  <TD className="text-xs text-muted-foreground">{payment.period ?? '—'}</TD>
                  <TD className="text-xs">{PAYMENT_STATUS_META[payment.status].label}</TD>
                  <TD numeric className="text-xs">
                    {money(payment.netCertified)}
                  </TD>
                  <TD numeric className="text-xs font-medium">
                    {money(payment.netCertified - (payment.received ?? 0))}
                  </TD>
                </TR>
              ))}
              <TR className="font-semibold">
                <TD className="text-xs" colSpan={4}>
                  Total outstanding
                </TD>
                <TD numeric className="text-xs">
                  {money(pos.outstanding)}
                </TD>
              </TR>
            </TBody>
          </Table>
          </div>
        </div>
      ) : null}

      <div className="surface p-4">
        <h2 className="eyebrow mb-2">Open variations by value</h2>
        <div className="data-scroll">
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>VO</TH>
              <TH>Subject</TH>
              <TH>Status</TH>
              <TH numeric>Value ({project.currency})</TH>
            </TR>
          </THead>
          <TBody>
            {openVariations.map((variation) => (
              <TR key={variation.id}>
                <TD className="text-xs font-medium">{variation.voNumber ?? `#${variation.serial}`}</TD>
                <TD className="max-w-sm text-xs">
                  <span className="line-clamp-1">{variation.subject}</span>
                </TD>
                <TD className="text-xs">
                  {variation.status ? VARIATION_STATUS_META[variation.status].label : '—'}
                </TD>
                <TD numeric className="text-xs">
                  {money(variation.agreedValue ?? variation.proposalValue)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        </div>
      </div>

      <div className="surface p-4">
        <h2 className="eyebrow mb-2">Outlook</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          At the current run rate of {money(forecast.runRate)} {project.currency} per certificate
          (mean of the last {forecast.basisCount}), the remaining{' '}
          {money(pos.balanceToComplete)} of measured work takes approximately{' '}
          {forecast.monthsToComplete ?? '—'} further certificates, putting completion around{' '}
          {forecast.projectedCompletion ? formatDate(forecast.projectedCompletion) : '—'}. Including
          open variations weighted by their position in the commercial cycle, the projected final
          account is {money(forecast.projectedFinalAccount)} {project.currency}. Retention of{' '}
          {money(pos.retentionDeducted)} is held against the works.
        </p>
      </div>

      <footer className="border-t border-border pt-2 text-2xs text-muted-foreground">
        Prepared from the {project.code} commercial register · source{' '}
        {project.sourceWorkbook ?? 'manual entry'} · {variations.length} variations ·{' '}
        {payments.length} certificates · all values {project.currency}. Internal use only.
      </footer>
    </div>
  );
}
