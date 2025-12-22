import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/vo/stats - Get dashboard statistics
export async function GET() {
  try {
    await requireAuth();

    const whereBase = { isExcludedFromStats: false };

    const [
      total,
      pendingWithFFC,
      pendingWithRSG,
      pendingWithRSGFFC,
      approvedAwaitingDVO,
      dvoRRIssued,
      // Aggregates
      pendingWithFFCFinancials,
      pendingWithRSGFinancials,
      pendingWithRSGFFCFinancials,
      approvedAwaitingDVOFinancials,
      dvoRRIssuedFinancials,
      // Detailed Lists
      pendingWithFFCList,
      pendingWithRSGList,
      pendingWithRSGFFCList,
      approvedAwaitingDVOList,
      dvoRRIssuedList,
    ] = await Promise.all([
      prisma.vO.count({ where: whereBase }),
      prisma.vO.count({ where: { ...whereBase, status: 'PendingWithFFC' } }),
      prisma.vO.count({ where: { ...whereBase, status: 'PendingWithRSG' } }),
      prisma.vO.count({ where: { ...whereBase, status: 'PendingWithRSGFFC' } }),
      prisma.vO.count({ where: { ...whereBase, status: 'ApprovedAwaitingDVO' } }),
      prisma.vO.count({ where: { ...whereBase, status: 'DVORRIssued' } }),

      // Financials per status
      prisma.vO.aggregate({
        where: { ...whereBase, status: 'PendingWithFFC' },
        _sum: { proposalValue: true },
      }),
      prisma.vO.aggregate({
        where: { ...whereBase, status: 'PendingWithRSG' },
        _sum: { proposalValue: true },
      }),
      prisma.vO.aggregate({
        where: { ...whereBase, status: 'PendingWithRSGFFC' },
        _sum: { proposalValue: true },
      }),
      prisma.vO.aggregate({
        where: { ...whereBase, status: 'ApprovedAwaitingDVO' },
        _sum: { approvedAmount: true },
      }),
      prisma.vO.aggregate({
        where: { ...whereBase, status: 'DVORRIssued' },
        _sum: { approvedAmount: true },
      }),

      // Lists for Tooltips (Limit 10)
      prisma.vO.findMany({
        where: { ...whereBase, status: 'PendingWithFFC' },
        select: { id: true, subject: true, proposalValue: true },
        orderBy: { submissionDate: 'desc' },
        take: 10,
      }),
      prisma.vO.findMany({
        where: { ...whereBase, status: 'PendingWithRSG' },
        select: { id: true, subject: true, proposalValue: true },
        orderBy: { submissionDate: 'desc' },
        take: 10,
      }),
      prisma.vO.findMany({
        where: { ...whereBase, status: 'PendingWithRSGFFC' },
        select: { id: true, subject: true, proposalValue: true },
        orderBy: { submissionDate: 'desc' },
        take: 10,
      }),
      prisma.vO.findMany({
        where: { ...whereBase, status: 'ApprovedAwaitingDVO' },
        select: { id: true, subject: true, approvedAmount: true },
        orderBy: { submissionDate: 'desc' },
        take: 10,
      }),
      prisma.vO.findMany({
        where: { ...whereBase, status: 'DVORRIssued' },
        select: { id: true, subject: true, approvedAmount: true },
        orderBy: { submissionDate: 'desc' },
        take: 10,
      }),
    ]);

    const totalSubmittedValue =
      (pendingWithFFCFinancials._sum.proposalValue || 0) +
      (pendingWithRSGFinancials._sum.proposalValue || 0) +
      (pendingWithRSGFFCFinancials._sum.proposalValue || 0) +
      (approvedAwaitingDVOFinancials._sum.approvedAmount || 0) +
      (dvoRRIssuedFinancials._sum.approvedAmount || 0);

    const totalApprovedValue =
      (approvedAwaitingDVOFinancials._sum.approvedAmount || 0) +
      (dvoRRIssuedFinancials._sum.approvedAmount || 0);

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
          totalSubmittedValue,
          totalApprovedValue,
        },
        statusBreakdown: [
          {
            status: 'PendingWithFFC',
            label: 'Pending with FFC',
            count: pendingWithFFC,
            amount: pendingWithFFCFinancials._sum.proposalValue || 0,
            color: 'orange',
            gradient: 'from-orange-500 to-orange-600',
            items: pendingWithFFCList,
          },
          {
            status: 'PendingWithRSG',
            label: 'Pending with RSG',
            count: pendingWithRSG,
            amount: pendingWithRSGFinancials._sum.proposalValue || 0,
            color: 'amber',
            gradient: 'from-amber-500 to-amber-600',
            items: pendingWithRSGList,
          },
          {
            status: 'PendingWithRSGFFC',
            label: 'Pending with RSG/FFC',
            count: pendingWithRSGFFC,
            amount: pendingWithRSGFFCFinancials._sum.proposalValue || 0,
            color: 'yellow',
            gradient: 'from-yellow-400 to-yellow-500',
            items: pendingWithRSGFFCList,
          },
          {
            status: 'ApprovedAwaitingDVO',
            label: 'Approved & Awaiting DVO',
            count: approvedAwaitingDVO,
            amount: approvedAwaitingDVOFinancials._sum.approvedAmount || 0,
            color: 'cyan',
            gradient: 'from-cyan-500 to-cyan-600',
            items: approvedAwaitingDVOList,
          },
          {
            status: 'DVORRIssued',
            label: 'DVO RR Issued',
            count: dvoRRIssued,
            amount: dvoRRIssuedFinancials._sum.approvedAmount || 0,
            color: 'green',
            gradient: 'from-green-500 to-green-600',
            items: dvoRRIssuedList,
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

