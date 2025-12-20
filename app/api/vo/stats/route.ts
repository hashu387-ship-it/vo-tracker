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
      pendingWithFFCFinancials,
      pendingWithRSGFinancials,
      pendingWithRSGFFCFinancials,
      approvedAwaitingDVOFinancials,
      dvoRRIssuedFinancials,
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
      prisma.vO.aggregate({
        where: { status: 'PendingWithFFC' },
        _sum: { proposalValue: true },
      }),
      prisma.vO.aggregate({
        where: { status: 'PendingWithRSG' },
        _sum: { proposalValue: true },
      }),
      prisma.vO.aggregate({
        where: { status: 'PendingWithRSGFFC' },
        _sum: { proposalValue: true },
      }),
      prisma.vO.aggregate({
        where: { status: 'ApprovedAwaitingDVO' },
        _sum: { approvedAmount: true },
      }),
      prisma.vO.aggregate({
        where: { status: 'DVORRIssued' },
        _sum: { approvedAmount: true },
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
        statusBreakdown: [
          {
            status: 'PendingWithFFC',
            label: 'Pending with FFC',
            count: pendingWithFFC,
            amount: pendingWithFFCFinancials._sum.proposalValue || 0,
            color: 'orange',
            gradient: 'from-orange-500 to-orange-600',
          },
          {
            status: 'PendingWithRSG',
            label: 'Pending with RSG',
            count: pendingWithRSG,
            amount: pendingWithRSGFinancials._sum.proposalValue || 0,
            color: 'amber',
            gradient: 'from-amber-500 to-amber-600',
          },
          {
            status: 'PendingWithRSGFFC',
            label: 'Pending with RSG/FFC',
            count: pendingWithRSGFFC,
            amount: pendingWithRSGFFCFinancials._sum.proposalValue || 0,
            color: 'yellow',
            gradient: 'from-yellow-400 to-yellow-500',
          },
          {
            status: 'ApprovedAwaitingDVO',
            label: 'Approved & Awaiting DVO',
            count: approvedAwaitingDVO,
            amount: approvedAwaitingDVOFinancials._sum.approvedAmount || 0,
            color: 'cyan',
            gradient: 'from-cyan-500 to-cyan-600',
          },
          {
            status: 'DVORRIssued',
            label: 'DVO RR Issued',
            count: dvoRRIssued,
            amount: dvoRRIssuedFinancials._sum.approvedAmount || 0,
            color: 'green',
            gradient: 'from-green-500 to-green-600',
          },
        ],
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
