
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const projectDetailsSchema = z.object({
    projectCode: z.string().min(1, 'Project code is required'),
    projectName: z.string().default(''),
    contractor: z.string().min(1, 'Contractor is required'),
    contractDate: z.string().transform((val) => new Date(val)),
    originalContractValue: z.number().min(0),
    revisedContractValue: z.number().min(0),
    advancePaymentTotal: z.number().min(0),
    advancePaymentPercent: z.number().default(32.0),
    advanceDeductedTillDate: z.number().default(0),
    advanceDeductedPercent: z.number().default(0),
    advanceBalance: z.number().default(0),
    advanceBalancePercent: z.number().default(0),
    totalRetention: z.number().default(0),
    retentionPercent: z.number().default(5.0),
    retentionDeductedTillDate: z.number().default(0),
    retentionDeductedPercent: z.number().default(0),
    retentionBalance: z.number().default(0),
    retentionBalancePercent: z.number().default(0),
    totalWorkDone: z.number().default(0),
    totalWorkDonePercent: z.number().default(0),
    balanceWorkDone: z.number().default(0),
    balanceWorkDonePercent: z.number().default(0),
    receivedAmount: z.number().default(0),
    receivedPercent: z.number().default(0),
});

// GET /api/project-details - Get project details
export async function GET(request: NextRequest) {
    try {
        await requireAuth();

        const projectDetails = await prisma.projectDetails.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ data: projectDetails });
    } catch (error) {
        console.error('GET /api/project-details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/project-details - Create or update project details
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const validationResult = projectDetailsSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        // Check if project details already exist
        const existing = await prisma.projectDetails.findUnique({
            where: { projectCode: validationResult.data.projectCode },
        });

        let projectDetails;
        if (existing) {
            projectDetails = await prisma.projectDetails.update({
                where: { projectCode: validationResult.data.projectCode },
                data: validationResult.data,
            });
        } else {
            projectDetails = await prisma.projectDetails.create({
                data: validationResult.data,
            });
        }

        return NextResponse.json({ data: projectDetails }, { status: existing ? 200 : 201 });
    } catch (error) {
        console.error('POST /api/project-details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
