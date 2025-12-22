import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { updateVOSchema } from '@/lib/validations/vo';
import { logActivity } from '@/lib/actions/activity';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vo/:id - Get a single VO
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();

    const { id } = await params;
    const voId = parseInt(id, 10);

    if (isNaN(voId)) {
      return NextResponse.json({ error: 'Invalid VO ID' }, { status: 400 });
    }

    const vo = await prisma.vO.findUnique({
      where: { id: voId },
    });

    if (!vo) {
      return NextResponse.json({ error: 'VO not found' }, { status: 404 });
    }

    return NextResponse.json({ data: vo });
  } catch (error) {
    console.error('GET /api/vo/:id error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vo/:id - Update a VO
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const voId = parseInt(id, 10);

    if (isNaN(voId)) {
      return NextResponse.json({ error: 'Invalid VO ID' }, { status: 400 });
    }

    const existingVO = await prisma.vO.findUnique({
      where: { id: voId },
    });

    if (!existingVO) {
      return NextResponse.json({ error: 'VO not found' }, { status: 404 });
    }

    const body = await request.json();
    const validationResult = updateVOSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Sanitize data: convert empty strings to null for nullable fields
    const sanitizedData = {
      ...data,
      assessmentValue: data.assessmentValue === '' ? null : data.assessmentValue,
      proposalValue: data.proposalValue === '' ? null : data.proposalValue,
      approvedAmount: data.approvedAmount === '' ? null : data.approvedAmount,
      dvoIssuedDate: data.dvoIssuedDate === '' ? null : data.dvoIssuedDate,
    };

    const vo = await prisma.vO.update({
      where: { id: voId },
      data: sanitizedData as any,
    });

    await logActivity('UPDATE', 'VO', vo.id.toString(), `Updated VO: ${vo.subject}`);

    return NextResponse.json({ data: vo });
  } catch (error) {
    console.error('PUT /api/vo/:id error:', error);
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vo/:id - Delete a VO
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const voId = parseInt(id, 10);

    if (isNaN(voId)) {
      return NextResponse.json({ error: 'Invalid VO ID' }, { status: 400 });
    }

    const existingVO = await prisma.vO.findUnique({
      where: { id: voId },
    });

    if (!existingVO) {
      return NextResponse.json({ error: 'VO not found' }, { status: 404 });
    }

    await prisma.vO.delete({
      where: { id: voId },
    });

    await logActivity('DELETE', 'VO', voId.toString(), `Deleted VO: ${existingVO.subject}`);

    return NextResponse.json({ message: 'VO deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/vo/:id error:', error);
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
