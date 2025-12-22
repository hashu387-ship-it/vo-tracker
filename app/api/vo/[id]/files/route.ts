
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { fileType, fileUrl } = body;

        // Validate fileType
        const validFileTypes = [
            'proposedFileUrl',
            'assessmentFileUrl',
            'approvalFileUrl',
            'dvoFileUrl'
        ];

        if (!validFileTypes.includes(fileType)) {
            return NextResponse.json(
                { error: 'Invalid file type' },
                { status: 400 }
            );
        }

        const updatedVO = await prisma.vO.update({
            where: { id },
            data: {
                [fileType]: fileUrl
            }
        });

        return NextResponse.json(updatedVO);
    } catch (error) {
        console.error('Error updating VO file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
