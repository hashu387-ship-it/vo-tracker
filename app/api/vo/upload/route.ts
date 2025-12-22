import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadVOFile, FileUploadType } from '@/lib/supabase';
import { logActivity } from '@/lib/actions/activity';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as FileUploadType;
    const voId = formData.get('voId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType || !['ffcRsgProposed', 'rsgAssessed', 'dvoRrApproved'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (!voId) {
      return NextResponse.json(
        { error: 'No VO ID provided' },
        { status: 400 }
      );
    }

    // Upload file to Supabase storage
    const fileUrl = await uploadVOFile(parseInt(voId), file, fileType);

    // Update VO record with file URL
    const fieldMap: Record<FileUploadType, string> = {
      ffcRsgProposed: 'ffcRsgProposedFile',
      rsgAssessed: 'rsgAssessedFile',
      dvoRrApproved: 'dvoRrApprovedFile',
    };

    const updateData = {
      [fieldMap[fileType]]: fileUrl,
    };

    const updatedVO = await prisma.vO.update({
      where: { id: parseInt(voId) },
      data: updateData,
    });

    await logActivity('UPLOAD', 'VO', voId, `Uploaded ${fileType} for VO #${voId}`);

    return NextResponse.json({
      success: true,
      fileUrl,
      vo: updatedVO,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
