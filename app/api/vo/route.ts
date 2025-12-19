import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { createVOSchema, voQuerySchema } from '@/lib/validations/vo';
import { Prisma } from '@prisma/client';

// GET /api/vo - List all VOs with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const queryResult = voQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      submissionType: searchParams.get('submissionType') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { search, status, submissionType, sortBy, sortOrder, page, limit } = queryResult.data;

    // Build where clause
    const where: Prisma.VOWhereInput = {};

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { submissionReference: { contains: search, mode: 'insensitive' } },
        { responseReference: { contains: search, mode: 'insensitive' } },
        { vorReference: { contains: search, mode: 'insensitive' } },
        { dvoReference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (submissionType) {
      where.submissionType = submissionType;
    }

    // Build orderBy
    const orderBy: Prisma.VOOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [vos, total] = await Promise.all([
      prisma.vO.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.vO.count({ where }),
    ]);

    return NextResponse.json({
      data: vos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/vo error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vo - Create a new VO
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validationResult = createVOSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const vo = await prisma.vO.create({
      data: validationResult.data,
    });

    return NextResponse.json({ data: vo }, { status: 201 });
  } catch (error) {
    console.error('POST /api/vo error:', error);
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
