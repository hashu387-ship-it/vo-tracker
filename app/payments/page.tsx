import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CertifiedPerPeriod } from '@/components/charts/figures';
import { PaymentTable } from '@/components/payments/payment-table';
import { KpiGrid, KpiTile } from '@/components/register/kpi-tile';
import { PageHeader } from '@/components/register/page-header';
import { Button } from '@/components/ui/button';
import { getRegister } from '@/lib/db/queries';
import { compactMoney, money, percent } from '@/lib/domain/money';

export const metadata: Metadata = { title: 'Payment register' };

export default async function PaymentsPage() {
  const { project, payments, paymentPosition: pos, cashflow } = await getRegister();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${project.code} · payment register`}
        title="Payment register"
        description={`Advance payments and interim payment applications for ${project.name}. Deductions are shown as negatives, exactly as they appear on the certificate.`}
        actions={
          <Button asChild size="sm">
            <Link href="/payments/new">
              <Plus className="size-3.5" /> New certificate
            </Link>
          </Button>
        }
      />

      <KpiGrid>
        <KpiTile
          label="Gross certified"
          unit={project.currency}
          value={money(pos.totalWorkDone)}
          meter={pos.percentComplete}
          meterLabel={`${percent(pos.percentComplete)} of the revised contract`}
          caption={`Plus ${compactMoney(pos.underReview)} still under assessment`}
        />
        <KpiTile
          label="Net certified"
          unit={project.currency}
          value={money(pos.netCertifiedTotal)}
          caption="After recovery, retention and VAT"
        />
        <KpiTile
          label="Cash received"
          unit={project.currency}
          value={money(pos.cashReceivedTotal)}
          caption={`${pos.interimCount} interim · ${pos.advanceCount} advance`}
          tone="good"
        />
        <KpiTile
          label="Balance due"
          unit={project.currency}
          value={money(pos.outstanding)}
          caption={`${pos.outstandingCount} certificate${pos.outstandingCount === 1 ? '' : 's'} awaiting transfer`}
          tone={pos.outstanding > 0 ? 'warning' : 'good'}
        />
      </KpiGrid>

      <CertifiedPerPeriod data={cashflow} />

      <PaymentTable payments={payments} currency={project.currency} />
    </div>
  );
}
