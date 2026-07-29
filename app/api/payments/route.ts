import { NextResponse } from 'next/server';

import { savePayment } from '@/lib/actions';
import { getPayments } from '@/lib/db/queries';
import { PAYMENT_STATUS_META } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const outstanding = searchParams.get('outstanding') === 'true';

  let payments = await getPayments();
  if (status) payments = payments.filter((payment) => payment.status === status);
  if (outstanding) {
    payments = payments.filter(
      (payment) => payment.netCertified - (payment.received ?? 0) > 0.005,
    );
  }

  return NextResponse.json({
    count: payments.length,
    payments: payments.map((payment) => ({
      ...payment,
      statusLabel: PAYMENT_STATUS_META[payment.status].label,
      balanceDue: Math.round((payment.netCertified - (payment.received ?? 0)) * 100) / 100,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, message: 'Expected a JSON body.' }, { status: 400 });
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (value !== null && value !== undefined) formData.set(key, String(value));
  }

  const result = await savePayment(null, formData);
  return NextResponse.json(result, { status: result.ok ? 201 : 422 });
}
