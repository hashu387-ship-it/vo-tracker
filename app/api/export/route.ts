import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { voQuerySchema, statusConfig, submissionTypeConfig } from '@/lib/validations/vo';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { Prisma } from '@prisma/client';

// GET /api/export - Export VOs to Excel
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const queryResult = voQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      submissionType: searchParams.get('submissionType') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { search, status, submissionType, sortBy, sortOrder } = queryResult.data;

    // Build where clause (same as list endpoint)
    const where: Prisma.VOWhereInput = {};

    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { submissionReference: { contains: search } },
        { responseReference: { contains: search } },
        { vorReference: { contains: search } },
        { dvoReference: { contains: search } },
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

    // Fetch all matching VOs (no pagination for export)
    const vos = await prisma.vO.findMany({
      where,
      orderBy,
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VO Tracker';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Variation Orders', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Subject', key: 'subject', width: 45 },
      { header: 'Type', key: 'submissionType', width: 12 },
      { header: 'Submission Ref', key: 'submissionReference', width: 18 },
      { header: 'Response Ref', key: 'responseReference', width: 18 },
      { header: 'Submission Date', key: 'submissionDate', width: 15 },
      { header: 'Assessment Value (SAR)', key: 'assessmentValue', width: 20 },
      { header: 'Proposal Value (SAR)', key: 'proposalValue', width: 20 },
      { header: 'Approved Amount (SAR)', key: 'approvedAmount', width: 20 },
      { header: 'Status', key: 'status', width: 22 },
      { header: 'VOR Ref', key: 'vorReference', width: 15 },
      { header: 'DVO Ref', key: 'dvoReference', width: 15 },
      { header: 'DVO Issued Date', key: 'dvoIssuedDate', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 35 },
      { header: 'Action Notes', key: 'actionNotes', width: 35 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows with colorful status
    vos.forEach((vo) => {
      const row = worksheet.addRow({
        id: vo.id,
        subject: vo.subject,
        submissionType: submissionTypeConfig[vo.submissionType as keyof typeof submissionTypeConfig]?.label || vo.submissionType,
        submissionReference: vo.submissionReference || '',
        responseReference: vo.responseReference || '',
        submissionDate: vo.submissionDate ? format(new Date(vo.submissionDate), 'yyyy-MM-dd') : '',
        assessmentValue: vo.assessmentValue,
        proposalValue: vo.proposalValue,
        approvedAmount: vo.approvedAmount,
        status: statusConfig[vo.status as keyof typeof statusConfig]?.label || vo.status,
        vorReference: vo.vorReference || '',
        dvoReference: vo.dvoReference || '',
        dvoIssuedDate: vo.dvoIssuedDate ? format(new Date(vo.dvoIssuedDate), 'yyyy-MM-dd') : '',
        remarks: vo.remarks || '',
        actionNotes: vo.actionNotes || '',
      });

      // Apply colorful background to status cell
      const statusCell = row.getCell('status');
      const statusConfigEntry = statusConfig[vo.status as keyof typeof statusConfig];
      if (statusConfigEntry) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${statusConfigEntry.hexColor}` },
        };
        // Set text color based on status (white for dark backgrounds, black for light)
        const useWhiteText = ['PendingWithFFC', 'PendingWithRSG', 'ApprovedAwaitingDVO', 'DVORRIssued'].includes(vo.status);
        statusCell.font = {
          color: { argb: useWhiteText ? 'FFFFFFFF' : 'FF000000' },
          bold: true
        };
        statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Format currency columns with SAR
      ['assessmentValue', 'proposalValue', 'approvedAmount'].forEach((key) => {
        const cell = row.getCell(key);
        if (cell.value) {
          cell.numFmt = '"SAR "#,##0.00';
        }
      });
    });

    // Add totals row
    const totalsRow = worksheet.addRow({
      id: '',
      subject: 'TOTALS',
      submissionType: '',
      submissionReference: '',
      responseReference: '',
      submissionDate: '',
      assessmentValue: vos.reduce((sum, vo) => sum + (vo.assessmentValue || 0), 0),
      proposalValue: vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0),
      approvedAmount: vos.reduce((sum, vo) => sum + (vo.approvedAmount || 0), 0),
      status: '',
      vorReference: '',
      dvoReference: '',
      dvoIssuedDate: '',
      remarks: '',
      actionNotes: '',
    });

    totalsRow.font = { bold: true };
    totalsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };

    ['assessmentValue', 'proposalValue', 'approvedAmount'].forEach((key) => {
      const cell = totalsRow.getCell(key);
      cell.numFmt = '"SAR "#,##0.00';
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', wrapText: true };
        }
      });
    });

    // Calculate status summary
    const statusCounts: Record<string, number> = {
      PendingWithFFC: 0,
      PendingWithRSG: 0,
      PendingWithRSGFFC: 0,
      ApprovedAwaitingDVO: 0,
      DVORRIssued: 0,
    };
    vos.forEach((vo) => {
      if (statusCounts.hasOwnProperty(vo.status)) {
        statusCounts[vo.status]++;
      }
    });

    // Add summary section
    const summaryStartRow = worksheet.rowCount + 3;

    // Summary title
    const summaryTitleRow = worksheet.getRow(summaryStartRow);
    worksheet.mergeCells(summaryStartRow, 1, summaryStartRow, 3);
    summaryTitleRow.getCell(1).value = 'STATUS SUMMARY';
    summaryTitleRow.getCell(1).font = { bold: true, size: 14 };
    summaryTitleRow.getCell(1).alignment = { horizontal: 'center' };
    summaryTitleRow.height = 25;

    // Summary headers
    const summaryHeaderRow = worksheet.getRow(summaryStartRow + 1);
    summaryHeaderRow.getCell(1).value = 'Status';
    summaryHeaderRow.getCell(2).value = 'Count';
    summaryHeaderRow.font = { bold: true };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' },
    };
    summaryHeaderRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.getCell(1).alignment = { horizontal: 'center' };
    summaryHeaderRow.getCell(2).alignment = { horizontal: 'center' };

    // Add each status row with colors
    const statusOrder: Array<keyof typeof statusConfig> = [
      'PendingWithFFC',
      'PendingWithRSG',
      'PendingWithRSGFFC',
      'ApprovedAwaitingDVO',
      'DVORRIssued',
    ];

    statusOrder.forEach((statusKey, index) => {
      const config = statusConfig[statusKey];
      const row = worksheet.getRow(summaryStartRow + 2 + index);
      row.getCell(1).value = config.label;
      row.getCell(2).value = statusCounts[statusKey];

      // Apply status color to the row
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${config.hexColor}` },
      };
      row.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${config.hexColor}` },
      };

      // Text color
      const useWhiteText = ['PendingWithFFC', 'PendingWithRSG', 'ApprovedAwaitingDVO', 'DVORRIssued'].includes(statusKey);
      row.getCell(1).font = { bold: true, color: { argb: useWhiteText ? 'FFFFFFFF' : 'FF000000' } };
      row.getCell(2).font = { bold: true, color: { argb: useWhiteText ? 'FFFFFFFF' : 'FF000000' } };
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

      // Add borders
      [1, 2].forEach((col) => {
        row.getCell(col).border = {
          top: { style: 'thin', color: { argb: 'FF333333' } },
          left: { style: 'thin', color: { argb: 'FF333333' } },
          bottom: { style: 'thin', color: { argb: 'FF333333' } },
          right: { style: 'thin', color: { argb: 'FF333333' } },
        };
      });
    });

    // Add total row
    const totalSummaryRow = worksheet.getRow(summaryStartRow + 2 + statusOrder.length);
    totalSummaryRow.getCell(1).value = 'Total Submitted VO';
    totalSummaryRow.getCell(2).value = vos.length;
    totalSummaryRow.getCell(1).font = { bold: true, size: 12 };
    totalSummaryRow.getCell(2).font = { bold: true, size: 12 };
    totalSummaryRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Blue
    };
    totalSummaryRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Blue
    };
    totalSummaryRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    totalSummaryRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    totalSummaryRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    totalSummaryRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    [1, 2].forEach((col) => {
      totalSummaryRow.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FF333333' } },
        left: { style: 'thin', color: { argb: 'FF333333' } },
        bottom: { style: 'thin', color: { argb: 'FF333333' } },
        right: { style: 'thin', color: { argb: 'FF333333' } },
      };
    });

    // Set column widths for summary (reuse existing columns)
    worksheet.getColumn(1).width = Math.max(worksheet.getColumn(1).width || 8, 45);
    worksheet.getColumn(2).width = Math.max(worksheet.getColumn(2).width || 45, 15);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    const filename = `VO_Export_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('GET /api/export error:', error);
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
