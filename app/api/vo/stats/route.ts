import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/vo/stats - Get dashboard statistics
export async function GET() {
  try {
    await requireAuth();

    const [
      total,
      pendingWithFFC,
      pendingWithRSG,
      pendingWithRSGFFC,
      approvedAwaitingDVO,
      dvoRRIssued,
      financials,
    ] = await Promise.all([
      prisma.vO.count(),
      prisma.vO.count({ where: { status: 'PendingWithFFC' } }),
      prisma.vO.count({ where: { status: 'PendingWithRSG' } }),
      prisma.vO.count({ where: { status: 'PendingWithRSGFFC' } }),
      prisma.vO.count({ where: { status: 'ApprovedAwaitingDVO' } }),
      prisma.vO.count({ where: { status: 'DVORRIssued' } }),
      prisma.vO.aggregate({
        _sum: {
          proposalValue: true,
          approvedAmount: true,
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        counts: {
          total,
          pendingWithFFC,
          pendingWithRSG,
          pendingWithRSGFFC,
          approvedAwaitingDVO,
          dvoRRIssued,
        },
        financials: {
          totalSubmittedValue: financials._sum.proposalValue || 0,
          totalApprovedValue: financials._sum.approvedAmount || 0,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/vo/stats error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
