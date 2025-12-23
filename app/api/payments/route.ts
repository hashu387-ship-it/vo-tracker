
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema for creating a payment
const createPaymentSchema = z.object({
    paymentNo: z.string().min(1, 'Payment number is required'),
    description: z.string().min(1, 'Description is required'),
    grossAmount: z.number().min(0),
    advancePaymentRecovery: z.number().default(0),
    retention: z.number().default(0),
    vatRecovery: z.number().default(0),
    vat: z.number().default(0),
    netPayment: z.number(),
    submittedDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
    invoiceDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
    paymentStatus: z.string().default('Draft'),
    ffcLiveAction: z.string().optional().nullable(),
    rsgLiveAction: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
});

// GET /api/payments - List all payments
export async function GET(request: NextRequest) {
    try {
        await requireAuth();

        const payments = await prisma.paymentApplication.findMany({
            orderBy: { id: 'asc' }, // Or createdAt desc, but spreadsheet implies sequential ID order
        });

        return NextResponse.json({ data: payments });
    } catch (error) {
        console.error('GET /api/payments error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const validationResult = createPaymentSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const payment = await prisma.paymentApplication.create({
            data: validationResult.data,
        });

        return NextResponse.json({ data: payment }, { status: 201 });
    } catch (error) {
        console.error('POST /api/payments error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
