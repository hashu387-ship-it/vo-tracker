import { NextResponse } from 'next/server';

import { saveVariation } from '@/lib/actions';
import { getVariations } from '@/lib/db/queries';
import { VARIATION_STATUS_META, type VariationStatus } from '@/lib/domain/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const query = searchParams.get('q')?.toLowerCase();

  let variations = await getVariations();
  if (status) variations = variations.filter((variation) => variation.status === status);
  if (query) {
    variations = variations.filter((variation) =>
      [variation.voNumber, variation.subject, variation.vorRef, variation.dvoRef]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query)),
    );
  }

  return NextResponse.json({
    count: variations.length,
    variations: variations.map((variation) => ({
      ...variation,
      statusLabel: variation.status ? VARIATION_STATUS_META[variation.status].label : null,
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

  const result = await saveVariation(null, formData);
  return NextResponse.json(result, { status: result.ok ? 201 : 422 });
}

export type VariationApiStatus = VariationStatus;
