import { ArrowLeft, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DefinitionRow, PageHeader, Section } from '@/components/register/page-header';
import { StatusChip } from '@/components/register/status-chip';
import { StatusPicker } from '@/components/variations/status-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPayment, getPayments, getProject } from '@/lib/db/queries';
import { formatDate, money, moneyWithUnit, relativeDays } from '@/lib/domain/money';
import { PAYMENT_STATUS_META } from '@/lib/domain/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const payment = await getPayment(id);
  return { title: payment ? payment.ref : 'Certificate not found' };
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [payment, project, all] = await Promise.all([getPayment(id), getProject(), getPayments()]);
  if (!payment) notFound();

  const asOf = project.dataAsOf ?? new Date().toISOString().slice(0, 10);
  const balance = Math.round((payment.netCertified - (payment.received ?? 0)) * 100) / 100;

  const index = all.findIndex((row) => row.id === payment.id);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  // Cumulative gross at this certificate, computed from the register itself.
  const cumulative = all
    .filter((row) => row.kind === 'interim' && row.sequence <= payment.sequence)
    .reduce((sum, row) => sum + row.grossCertified, 0);

  const lines = [
    { label: 'Gross certified (work executed)', value: payment.grossCertified, emphasise: true },
    { label: 'Advance payment recovery', value: payment.advanceRecovery },
    { label: 'Back charge', value: payment.backCharge },
    { label: `Retention`, value: payment.retention },
    { label: 'VAT recovery on advance payment', value: payment.vatOnAdvanceRecovery },
    { label: `VAT ${(project.vatRate * 100).toFixed(0)}%`, value: payment.vat },
  ].filter((line) => line.value !== 0 || line.emphasise);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="no-print flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/payments">
            <ArrowLeft className="size-3.5" /> Payment register
          </Link>
        </Button>
        <div className="flex items-center gap-1">
          {previous ? (
            <Button asChild variant="ghost" size="xs">
              <Link href={`/payments/${previous.id}`}>← {previous.ref}</Link>
            </Button>
          ) : null}
          {next ? (
            <Button asChild variant="ghost" size="xs">
              <Link href={`/payments/${next.id}`}>{next.ref} →</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <PageHeader
        eyebrow={`${project.code} · ${payment.kind === 'advance' ? 'advance payment' : 'interim payment application'}`}
        title={payment.ref}
        description={payment.period ?? 'No claim period recorded'}
        actions={
          <>
            <StatusPicker id={payment.id} kind="payment" status={payment.status} />
            <Button asChild size="sm">
              <Link href={`/payments/${payment.id}/edit`}>
                <Pencil className="size-3.5" /> Edit
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card">
        <StatusChip status={payment.status} kind="payment" />
        <p className="text-xs text-muted-foreground">
          {PAYMENT_STATUS_META[payment.status].description}
        </p>
        {balance > 0.005 ? (
          <span className="tnum ml-auto text-sm font-semibold text-warning">
            {money(balance)} {project.currency} outstanding
          </span>
        ) : (
          <span className="ml-auto text-sm font-medium text-good">Settled in full</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Valuation" className="lg:col-span-2">
          <Card>
            <CardContent className="pt-5">
              {lines.map((line) => (
                <DefinitionRow
                  key={line.label}
                  label={line.label}
                  value={
                    <span className={line.value < 0 ? 'text-muted-foreground' : undefined}>
                      {money(line.value)}
                    </span>
                  }
                  emphasise={line.emphasise}
                />
              ))}
              <DefinitionRow
                label="Net payment certified"
                value={moneyWithUnit(payment.netCertified, project.currency)}
                emphasise
              />
              <DefinitionRow
                label="Received from client"
                value={payment.received === null ? 'Not collected' : money(payment.received)}
              />
              <DefinitionRow
                label="Balance due"
                value={
                  <span className={balance > 0.005 ? 'text-warning' : 'text-good'}>
                    {money(balance)}
                  </span>
                }
                emphasise
              />
            </CardContent>
          </Card>
        </Section>

        <Section title="Dates">
          <Card>
            <CardContent className="pt-5">
              <DefinitionRow
                label="Submitted"
                hint={relativeDays(payment.submittedDate, asOf) ?? undefined}
                value={formatDate(payment.submittedDate)}
              />
              <DefinitionRow
                label="Tax invoice"
                hint={relativeDays(payment.taxInvoiceDate, asOf) ?? undefined}
                value={formatDate(payment.taxInvoiceDate)}
              />
              <DefinitionRow
                label="Due"
                hint={relativeDays(payment.dueDate, asOf) ?? undefined}
                value={formatDate(payment.dueDate)}
              />
              <DefinitionRow label="Collected" value={formatDate(payment.collectedDate)} />
              <DefinitionRow
                label="Cumulative gross"
                hint="Certified to and including this certificate"
                value={money(cumulative)}
              />
            </CardContent>
          </Card>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{project.contractor} — next action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {payment.contractorAction ?? 'Nothing outstanding.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{project.client} — next action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {payment.clientAction ?? 'Nothing outstanding.'}
            </p>
            {payment.paymentNote ? (
              <p className="mt-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs">
                {payment.paymentNote}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
