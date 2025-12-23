
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updatePaymentSchema = z.object({
    paymentNo: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    grossAmount: z.number().min(0).optional(),
    advancePaymentRecovery: z.number().optional(),
    retention: z.number().optional(),
    vatRecovery: z.number().optional(),
    vat: z.number().optional(),
    netPayment: z.number().optional(),
    paymentStatus: z.string().optional(),
    submittedDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
    invoiceDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
    ffcLiveAction: z.string().optional().nullable(),
    rsgLiveAction: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/payments/:id - Update payment
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin();

        const { id } = await params;
        const paymentId = parseInt(id, 10);

        if (isNaN(paymentId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const validationResult = updatePaymentSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const payment = await prisma.paymentApplication.update({
            where: { id: paymentId },
            data: validationResult.data,
        });

        return NextResponse.json({ data: payment });
    } catch (error) {
        console.error('PUT /api/payments/:id error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/payments/:id - Delete payment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin();

        const { id } = await params;
        const paymentId = parseInt(id, 10);

        if (isNaN(paymentId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await prisma.paymentApplication.delete({
            where: { id: paymentId },
        });

        return NextResponse.json({ message: 'Payment deleted' });
    } catch (error) {
        console.error('DELETE /api/payments/:id error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
