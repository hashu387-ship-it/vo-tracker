import { NextResponse } from 'next/server';

import { deleteVariation, saveVariation } from '@/lib/actions';
import { getVariation } from '@/lib/db/queries';
import { VARIATION_STATUS_META } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variation = await getVariation(id);
  if (!variation) {
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    ...variation,
    statusLabel: variation.status ? VARIATION_STATUS_META[variation.status].label : null,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getVariation(id);
  if (!existing) {
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, message: 'Expected a JSON body.' }, { status: 400 });
  }

  // PATCH semantics: start from the stored record so partial payloads are safe.
  const merged: Record<string, unknown> = { ...existing, ...(body as Record<string, unknown>) };
  const formData = new FormData();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== null && value !== undefined) formData.set(key, String(value));
  }

  const result = await saveVariation(id, formData);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await deleteVariation(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
