'use client';

import { Download, Search, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { StatusChip } from '@/components/register/status-chip';
import { EmptyState } from '@/components/register/page-header';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { formatDate, money } from '@/lib/domain/money';
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_META,
  type Payment,
  type PaymentStatus,
} from '@/lib/domain/types';
import { cn, downloadBlob, matches, toCsv } from '@/lib/utils';

/**
 * The payment register in full. It keeps the workbook's column order so the
 * commercial team can read it exactly the way they read the spreadsheet, with
 * the totals row pinned at the bottom.
 */
export function PaymentTable({ payments, currency }: { payments: Payment[]; currency: string }) {
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<PaymentStatus | 'all'>('all');
  const [kind, setKind] = React.useState<'all' | 'interim' | 'advance'>('all');
  const [outstandingOnly, setOutstandingOnly] = React.useState(false);

  const filtered = React.useMemo(
    () =>
      payments.filter((payment) => {
        if (status !== 'all' && payment.status !== status) return false;
        if (kind !== 'all' && payment.kind !== kind) return false;
        if (outstandingOnly && (payment.received ?? 0) >= payment.netCertified - 0.005) return false;
        if (!query) return true;
        return (
          matches(payment.ref, query) ||
          matches(payment.period, query) ||
          matches(payment.paymentNote, query) ||
          matches(payment.contractorAction, query) ||
          matches(payment.clientAction, query)
        );
      }),
    [payments, query, status, kind, outstandingOnly],
  );

  const totals = React.useMemo(
    () =>
      filtered.reduce(
        (acc, payment) => ({
          gross: acc.gross + payment.grossCertified,
          advance: acc.advance + payment.advanceRecovery,
          backCharge: acc.backCharge + payment.backCharge,
          retention: acc.retention + payment.retention,
          vatAdvance: acc.vatAdvance + payment.vatOnAdvanceRecovery,
          vat: acc.vat + payment.vat,
          net: acc.net + payment.netCertified,
          received: acc.received + (payment.received ?? 0),
        }),
        {
          gross: 0,
          advance: 0,
          backCharge: 0,
          retention: 0,
          vatAdvance: 0,
          vat: 0,
          net: 0,
          received: 0,
        },
      ),
    [filtered],
  );

  const exportCsv = () => {
    const columns = [
      'Ref',
      'Period',
      'Type',
      `Gross certified (${currency})`,
      `Advance recovery (${currency})`,
      `Back charge (${currency})`,
      `Retention (${currency})`,
      `VAT on advance (${currency})`,
      `VAT (${currency})`,
      `Net certified (${currency})`,
      `Received (${currency})`,
      `Balance due (${currency})`,
      'Submitted',
      'Tax invoice',
      'Due',
      'Status',
      'Payment note',
    ];
    const csv = toCsv(
      filtered.map((payment) => ({
        Ref: payment.ref,
        Period: payment.period ?? '',
        Type: payment.kind === 'advance' ? 'Advance payment' : 'Interim',
        [`Gross certified (${currency})`]: payment.grossCertified,
        [`Advance recovery (${currency})`]: payment.advanceRecovery,
        [`Back charge (${currency})`]: payment.backCharge,
        [`Retention (${currency})`]: payment.retention,
        [`VAT on advance (${currency})`]: payment.vatOnAdvanceRecovery,
        [`VAT (${currency})`]: payment.vat,
        [`Net certified (${currency})`]: payment.netCertified,
        [`Received (${currency})`]: payment.received ?? '',
        [`Balance due (${currency})`]: payment.netCertified - (payment.received ?? 0),
        Submitted: payment.submittedDate ?? '',
        'Tax invoice': payment.taxInvoiceDate ?? '',
        Due: payment.dueDate ?? '',
        Status: PAYMENT_STATUS_META[payment.status].label,
        'Payment note': payment.paymentNote ?? '',
      })),
      columns,
    );
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'hw2c05-payment-register.csv');
  };

  const hasFilters = query !== '' || status !== 'all' || kind !== 'all' || outstandingOnly;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, period or note…"
            className="pl-9"
            aria-label="Search certificates"
          />
        </div>

        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as PaymentStatus | 'all')}
          className="w-auto min-w-[170px]"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {PAYMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {PAYMENT_STATUS_META[value].label}
            </option>
          ))}
        </Select>

        <Select
          value={kind}
          onChange={(event) => setKind(event.target.value as 'all' | 'interim' | 'advance')}
          className="w-auto min-w-[150px]"
          aria-label="Filter by certificate type"
        >
          <option value="all">All certificates</option>
          <option value="interim">Interim only</option>
          <option value="advance">Advance payments</option>
        </Select>

        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-xs">
          <input
            type="checkbox"
            checked={outstandingOnly}
            onChange={(event) => setOutstandingOnly(event.target.checked)}
            className="size-3.5 accent-[hsl(var(--primary))]"
          />
          Outstanding only
        </label>

        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
          <Download className="size-3.5" /> CSV
        </Button>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setStatus('all');
              setKind('all');
              setOutstandingOnly(false);
            }}
            className="gap-1.5"
          >
            <X className="size-3.5" /> Clear
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No certificates match these filters"
          description="Widen the status filter or clear the search box."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <div className="data-scroll max-h-[70vh] overflow-y-auto">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH className="w-24">Ref</TH>
                  <TH className="min-w-[190px]">Period</TH>
                  <TH numeric>Gross certified</TH>
                  <TH numeric>Advance recovery</TH>
                  <TH numeric>Back charge</TH>
                  <TH numeric>Retention</TH>
                  <TH numeric>VAT on advance</TH>
                  <TH numeric>VAT 15%</TH>
                  <TH numeric>Net certified</TH>
                  <TH numeric>Received</TH>
                  <TH numeric>Balance due</TH>
                  <TH className="w-28">Submitted</TH>
                  <TH className="w-28">Tax invoice</TH>
                  <TH className="w-44">Status</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((payment) => {
                  const balance = payment.netCertified - (payment.received ?? 0);
                  return (
                    <TR key={payment.id}>
                      <TD>
                        <Link
                          href={`/payments/${payment.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {payment.ref}
                        </Link>
                        {payment.kind === 'advance' ? (
                          <span className="ml-1.5 text-2xs uppercase tracking-wider text-muted-foreground">
                            AP
                          </span>
                        ) : null}
                      </TD>
                      <TD className="text-xs text-muted-foreground">{payment.period ?? '—'}</TD>
                      <TD numeric>{money(payment.grossCertified)}</TD>
                      <TD numeric className={payment.advanceRecovery ? 'text-muted-foreground' : ''}>
                        {payment.advanceRecovery ? money(payment.advanceRecovery) : '—'}
                      </TD>
                      <TD numeric className={payment.backCharge ? 'text-destructive' : ''}>
                        {payment.backCharge ? money(payment.backCharge) : '—'}
                      </TD>
                      <TD numeric className="text-muted-foreground">
                        {payment.retention ? money(payment.retention) : '—'}
                      </TD>
                      <TD numeric className="text-muted-foreground">
                        {payment.vatOnAdvanceRecovery ? money(payment.vatOnAdvanceRecovery) : '—'}
                      </TD>
                      <TD numeric className="text-muted-foreground">
                        {payment.vat ? money(payment.vat) : '—'}
                      </TD>
                      <TD numeric className="font-medium">
                        {money(payment.netCertified)}
                      </TD>
                      <TD numeric>{payment.received === null ? '—' : money(payment.received)}</TD>
                      <TD numeric className={cn(balance > 0.005 && 'font-medium text-warning')}>
                        {balance > 0.005 ? money(balance) : '—'}
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(payment.submittedDate)}
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(payment.taxInvoiceDate)}
                      </TD>
                      <TD>
                        <StatusChip status={payment.status} kind="payment" short />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
              <tfoot className="sticky bottom-0 border-t-2 border-border bg-muted/90 backdrop-blur">
                <tr className="text-xs font-semibold">
                  <td className="px-3 py-2.5" colSpan={2}>
                    Total · {filtered.length} certificate{filtered.length === 1 ? '' : 's'}
                  </td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.gross)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.advance)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.backCharge)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.retention)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.vatAdvance)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.vat)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.net)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.received)}</td>
                  <td className="tnum px-3 py-2.5 text-right">{money(totals.net - totals.received)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}

      <p className="text-2xs text-muted-foreground">
        Negative figures are deductions from the gross certified value. All amounts in {currency}.
      </p>
    </div>
  );
}
