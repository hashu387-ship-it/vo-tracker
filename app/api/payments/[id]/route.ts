import { NextResponse } from 'next/server';

import { deletePayment, savePayment } from '@/lib/actions';
import { getPayment } from '@/lib/db/queries';
import { PAYMENT_STATUS_META } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPayment(id);
  if (!payment) {
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    ...payment,
    statusLabel: PAYMENT_STATUS_META[payment.status].label,
    balanceDue: Math.round((payment.netCertified - (payment.received ?? 0)) * 100) / 100,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getPayment(id);
  if (!existing) {
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, message: 'Expected a JSON body.' }, { status: 400 });
  }

  const merged: Record<string, unknown> = { ...existing, ...(body as Record<string, unknown>) };
  const formData = new FormData();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== null && value !== undefined) formData.set(key, String(value));
  }

  const result = await savePayment(id, formData);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await deletePayment(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
