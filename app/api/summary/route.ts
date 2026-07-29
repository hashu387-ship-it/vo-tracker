import { NextResponse } from 'next/server';

import { getRegister } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

/** Machine-readable snapshot of the whole commercial position. */
export async function GET() {
  const register = await getRegister();

  return NextResponse.json({
    project: register.project,
    asOf: register.asOf,
    payments: {
      ...register.paymentPosition,
      count: register.payments.length,
    },
    variations: {
      ...register.variationPosition,
    },
    forecast: {
      runRate: register.forecast.runRate,
      monthsToComplete: register.forecast.monthsToComplete,
      projectedCompletion: register.forecast.projectedCompletion,
      projectedFinalAccount: register.forecast.projectedFinalAccount,
    },
    ageing: register.ageing,
    dataQuality: register.issues,
  });
}
