import { NextResponse } from 'next/server';

import { getRegister } from '@/lib/db/queries';
import { buildWorkbook } from '@/lib/excel/export';
import { PAYMENT_STATUS_META, VARIATION_STATUS_META } from '@/lib/domain/types';
import { toCsv } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'xlsx';
  const sheet = searchParams.get('sheet') ?? 'all';

  const register = await getRegister();
  const stamp = register.asOf.replace(/-/g, '');
  const code = register.project.code.replace(/[^A-Za-z0-9-]/g, '');
  const currency = register.project.currency;

  if (format === 'csv') {
    if (sheet === 'payments') {
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
      ];
      const csv = toCsv(
        register.payments.map((payment) => ({
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
          [`Balance due (${currency})`]:
            Math.round((payment.netCertified - (payment.received ?? 0)) * 100) / 100,
          Submitted: payment.submittedDate ?? '',
          'Tax invoice': payment.taxInvoiceDate ?? '',
          Due: payment.dueDate ?? '',
          Status: PAYMENT_STATUS_META[payment.status].label,
        })),
        columns,
      );
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${code}-payment-register-${stamp}.csv"`,
        },
      });
    }

    const columns = [
      '#',
      'VO number',
      'Subject',
      'Status',
      'Raised',
      'Submitted',
      'Type',
      'VOR reference',
      'DVO reference',
      `Cost proposal (${currency})`,
      `Assessment (${currency})`,
      `Agreed value (${currency})`,
      'Contractor remarks',
      'Employer remarks',
      'Owner',
    ];
    const csv = toCsv(
      register.variations.map((variation) => ({
        '#': variation.serial,
        'VO number': variation.voNumber ?? '',
        Subject: variation.subject,
        Status: variation.status ? VARIATION_STATUS_META[variation.status].label : '',
        Raised: variation.aconexDate ?? '',
        Submitted: variation.submissionDate ?? '',
        Type: variation.submissionType ?? '',
        'VOR reference': variation.vorRef ?? '',
        'DVO reference': variation.dvoRef ?? '',
        [`Cost proposal (${currency})`]: variation.proposalValue ?? '',
        [`Assessment (${currency})`]: variation.clientAssessment ?? '',
        [`Agreed value (${currency})`]: variation.agreedValue ?? '',
        'Contractor remarks': variation.contractorRemarks ?? '',
        'Employer remarks': variation.clientRemarks ?? '',
        Owner: variation.owner ?? '',
      })),
      columns,
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${code}-vo-log-${stamp}.csv"`,
      },
    });
  }

  const buffer = await buildWorkbook(register);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${code}-commercial-register-${stamp}.xlsx"`,
      'Content-Length': String(buffer.byteLength),
    },
  });
}
