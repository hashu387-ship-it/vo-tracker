import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import ExcelJS from 'exceljs';

// Red Sea Global Theme Colors
const THEME_COLORS = {
  primary: {
    blue: 'FF0891B2', // Cyan-600
    teal: 'FF14B8A6', // Teal-500
    ocean: 'FF0E7490', // Cyan-700
  },
  status: {
    orange: 'FFF97316', // Orange-500
    amber: 'FFF59E0B', // Amber-500
    yellow: 'FFEAB308', // Yellow-400
    cyan: 'FF06B6D4', // Cyan-500
    green: 'FF10B981', // Green-500
  },
  light: {
    orange: 'FFFED7AA', // Orange-200
    amber: 'FFFDE68A', // Amber-200
    yellow: 'FFFEF08A', // Yellow-200
    cyan: 'FFA5F3FC', // Cyan-200
    green: 'FFA7F3D0', // Green-200
  },
  accent: {
    gold: 'FFF59E0B',
    sand: 'FFFBBF24',
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; lightColor: string }> = {
  PendingWithFFC: {
    label: 'Pending with FFC',
    color: THEME_COLORS.status.orange,
    lightColor: THEME_COLORS.light.orange,
  },
  PendingWithRSG: {
    label: 'Pending with RSG',
    color: THEME_COLORS.status.amber,
    lightColor: THEME_COLORS.light.amber,
  },
  PendingWithRSGFFC: {
    label: 'Pending with RSG/FFC',
    color: THEME_COLORS.status.yellow,
    lightColor: THEME_COLORS.light.yellow,
  },
  ApprovedAwaitingDVO: {
    label: 'Approved & Awaiting DVO',
    color: THEME_COLORS.status.cyan,
    lightColor: THEME_COLORS.light.cyan,
  },
  DVORRIssued: {
    label: 'DVO RR Issued',
    color: THEME_COLORS.status.green,
    lightColor: THEME_COLORS.light.green,
  },
};

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Fetch all VOs and statistics
    const [vos, stats] = await Promise.all([
      prisma.vO.findMany({
        orderBy: { submissionDate: 'desc' },
      }),
      prisma.vO.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: {
          proposalValue: true,
          approvedAmount: true,
        },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VO Tracker';
    workbook.created = new Date();

    // ===== SUMMARY SHEET =====
    const summarySheet = workbook.addWorksheet('Executive Summary', {
      properties: { tabColor: { argb: THEME_COLORS.primary.blue } },
      views: [{ showGridLines: false }],
    });

    // Title
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'R06-HW2 SW Hotel 02-First Fix-VO Log';
    titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.primary.blue },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 35;

    // Report date
    summarySheet.mergeCells('A2:F2');
    const dateCell = summarySheet.getCell('A2');
    const now = new Date();
    dateCell.value = `${now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    dateCell.font = { name: 'Calibri', size: 11, italic: true };
    dateCell.alignment = { horizontal: 'center' };
    summarySheet.getRow(2).height = 20;

    // Add spacing
    summarySheet.getRow(3).height = 15;

    // Original Contract Amount
    const originalContractRow = summarySheet.getRow(4);
    summarySheet.mergeCells('A4:D4');
    originalContractRow.getCell(1).value = 'Original Contract Value';
    originalContractRow.getCell(1).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    originalContractRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.status.orange },
    };
    originalContractRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

    summarySheet.mergeCells('E4:F4');
    originalContractRow.getCell(5).value = 217501556.12;
    originalContractRow.getCell(5).numFmt = '"SAR "#,##0.00';
    originalContractRow.getCell(5).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    originalContractRow.getCell(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.status.orange },
    };
    originalContractRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    originalContractRow.height = 30;

    // Add spacing
    summarySheet.getRow(5).height = 10;

    // Summary table header
    summarySheet.getRow(6).values = ['Status', 'Count', 'Submitted Value (SAR)', 'Approved/Issued (SAR)', 'Stage Amount (SAR)', 'Percentage'];
    const headerRow = summarySheet.getRow(6);
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.primary.ocean },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Column widths
    summarySheet.columns = [
      { key: 'status', width: 30 },
      { key: 'count', width: 12 },
      { key: 'proposalValue', width: 22 },
      { key: 'approvedValue', width: 22 },
      { key: 'stageAmount', width: 22 },
      { key: 'percentage', width: 15 },
    ];

    // Add status data
    const totalVOs = vos.length;
    let currentRow = 7;

    // Calculate stage-specific amounts
    // For pending statuses: use proposal value
    // For approved/issued statuses: use approved amount
    stats.forEach((stat) => {
      const config = STATUS_CONFIG[stat.status];
      if (!config) return;

      const stageAmount =
        stat.status === 'ApprovedAwaitingDVO' || stat.status === 'DVORRIssued'
          ? stat._sum.approvedAmount || 0
          : stat._sum.proposalValue || 0;

      const row = summarySheet.getRow(currentRow);
      row.values = [
        config.label,
        stat._count.id,
        stat._sum.proposalValue || 0,
        stat._sum.approvedAmount || 0,
        stageAmount,
        totalVOs > 0 ? (stat._count.id / totalVOs) * 100 : 0,
      ];

      // Style with status colors
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: config.lightColor },
      };
      row.getCell(1).font = { bold: true, color: { argb: config.color } };

      // Center count
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(2).font = { bold: true, size: 12 };

      // Currency format
      row.getCell(3).numFmt = '"SAR "#,##0.00';
      row.getCell(3).font = { bold: true };
      row.getCell(4).numFmt = '"SAR "#,##0.00';
      row.getCell(4).font = { bold: true };
      row.getCell(5).numFmt = '"SAR "#,##0.00';
      row.getCell(5).font = { bold: true, color: { argb: 'FF059669' } }; // Green for stage amount

      // Percentage
      row.getCell(6).numFmt = '0.0"%"';
      row.getCell(6).alignment = { horizontal: 'center' };

      row.height = 22;
      currentRow++;
    });

    // Calculate totals
    const totalProposal = vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0);
    const totalApproved = vos.reduce((sum, vo) => sum + (vo.approvedAmount || 0), 0);

    // Revised Amount = Contract Amount + Sum of (Approved Awaiting DVO + DVO RR Issued + DVO Issued amounts)
    const approvedAwaitingTotal = stats.find(s => s.status === 'ApprovedAwaitingDVO')?._sum.approvedAmount || 0;
    const dvoRRIssuedTotal = stats.find(s => s.status === 'DVORRIssued')?._sum.approvedAmount || 0;
    const totalStageAmount = approvedAwaitingTotal + dvoRRIssuedTotal;

    const totalRow = summarySheet.getRow(currentRow);
    totalRow.values = ['TOTAL', totalVOs, totalProposal, totalApproved, totalStageAmount, '100.0%'];
    totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.primary.blue },
    };
    totalRow.alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.getCell(3).numFmt = '"SAR "#,##0.00';
    totalRow.getCell(4).numFmt = '"SAR "#,##0.00';
    totalRow.getCell(5).numFmt = '"SAR "#,##0.00';
    totalRow.height = 28;
    currentRow++;

    // Add Revised Contract Amount
    summarySheet.getRow(currentRow).height = 10;
    currentRow++;

    const revisedContractAmount = 217501556.12 + totalStageAmount;
    const revisedRow = summarySheet.getRow(currentRow);
    summarySheet.mergeCells(`A${currentRow}:D${currentRow}`);
    revisedRow.getCell(1).value = 'Revised Contract Value';
    revisedRow.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
    revisedRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.status.green },
    };
    revisedRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };

    summarySheet.mergeCells(`E${currentRow}:F${currentRow}`);
    revisedRow.getCell(5).value = revisedContractAmount;
    revisedRow.getCell(5).numFmt = '"SAR "#,##0.00';
    revisedRow.getCell(5).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    revisedRow.getCell(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.status.green },
    };
    revisedRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    revisedRow.height = 30;

    // Add borders to summary table
    for (let i = 6; i <= currentRow; i++) {
      for (let j = 1; j <= 6; j++) {
        const cell = summarySheet.getRow(i).getCell(j);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      }
    }

    // ===== DETAILED DATA SHEET =====
    const dataSheet = workbook.addWorksheet('All Variation Orders', {
      properties: { tabColor: { argb: THEME_COLORS.primary.teal } },
    });

    // Headers
    const headers = [
      'VO ID',
      'Subject',
      'Status',
      'Type',
      'Submission Date',
      'Submission Ref',
      'Response Ref',
      'Assessment Value',
      'Proposal Value',
      'Approved Amount',
      'VOR Ref',
      'DVO Ref',
      'DVO Issued Date',
      'Remarks',
    ];

    dataSheet.getRow(1).values = headers;
    const dataHeaderRow = dataSheet.getRow(1);
    dataHeaderRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    dataHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME_COLORS.primary.blue },
    };
    dataHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dataHeaderRow.height = 25;

    // Set column widths
    dataSheet.columns = [
      { key: 'id', width: 10 },
      { key: 'subject', width: 40 },
      { key: 'status', width: 25 },
      { key: 'type', width: 15 },
      { key: 'submissionDate', width: 15 },
      { key: 'submissionRef', width: 20 },
      { key: 'responseRef', width: 20 },
      { key: 'assessmentValue', width: 18 },
      { key: 'proposalValue', width: 18 },
      { key: 'approvedAmount', width: 18 },
      { key: 'vorRef', width: 20 },
      { key: 'dvoRef', width: 20 },
      { key: 'dvoIssuedDate', width: 15 },
      { key: 'remarks', width: 35 },
    ];

    // Add data rows
    vos.forEach((vo, index) => {
      const rowNum = index + 2;
      const row = dataSheet.getRow(rowNum);

      row.values = [
        vo.id,
        vo.subject,
        STATUS_CONFIG[vo.status]?.label || vo.status,
        vo.submissionType,
        vo.submissionDate ? new Date(vo.submissionDate) : null,
        vo.submissionReference,
        vo.responseReference,
        vo.assessmentValue,
        vo.proposalValue,
        vo.approvedAmount,
        vo.vorReference,
        vo.dvoReference,
        vo.dvoIssuedDate ? new Date(vo.dvoIssuedDate) : null,
        vo.remarks,
      ];

      // Apply status color to entire row
      const config = STATUS_CONFIG[vo.status];
      if (config) {
        for (let i = 1; i <= headers.length; i++) {
          const cell = row.getCell(i);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: config.lightColor },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };
        }

        // Bold status cell with darker color
        row.getCell(3).font = { bold: true, color: { argb: config.color } };
      }

      // Format dates
      if (row.getCell(5).value) {
        row.getCell(5).numFmt = 'dd/mm/yyyy';
      }
      if (row.getCell(13).value) {
        row.getCell(13).numFmt = 'dd/mm/yyyy';
      }

      // Format currency
      row.getCell(8).numFmt = '"SAR "#,##0.00';
      row.getCell(9).numFmt = '"SAR "#,##0.00';
      row.getCell(10).numFmt = '"SAR "#,##0.00';

      // Bold financial values
      row.getCell(8).font = { bold: true };
      row.getCell(9).font = { bold: true };
      row.getCell(10).font = { bold: true };

      row.height = 20;
    });

    // Freeze header row
    dataSheet.views = [{ state: 'frozen', ySplit: 1 }];

    // ===== STATUS-GROUPED SHEETS =====
    Object.entries(STATUS_CONFIG).forEach(([statusKey, config]) => {
      const statusVOs = vos.filter((vo) => vo.status === statusKey);
      if (statusVOs.length === 0) return;

      const sanitizedName = config.label.replace(/[*?:\\\/\[\]]/g, '-').substring(0, 30);
      const statusSheet = workbook.addWorksheet(sanitizedName, {
        properties: { tabColor: { argb: config.color } },
      });

      // Add headers
      statusSheet.getRow(1).values = headers;
      const statusHeaderRow = statusSheet.getRow(1);
      statusHeaderRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      statusHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: config.color },
      };
      statusHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
      statusHeaderRow.height = 25;

      // Set columns
      statusSheet.columns = dataSheet.columns;

      // Add filtered data
      statusVOs.forEach((vo, index) => {
        const rowNum = index + 2;
        const row = statusSheet.getRow(rowNum);

        row.values = [
          vo.id,
          vo.subject,
          config.label,
          vo.submissionType,
          vo.submissionDate ? new Date(vo.submissionDate) : null,
          vo.submissionReference,
          vo.responseReference,
          vo.assessmentValue,
          vo.proposalValue,
          vo.approvedAmount,
          vo.vorReference,
          vo.dvoReference,
          vo.dvoIssuedDate ? new Date(vo.dvoIssuedDate) : null,
          vo.remarks,
        ];

        // Light background for all cells
        for (let i = 1; i <= headers.length; i++) {
          const cell = row.getCell(i);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: config.lightColor },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };
        }

        // Format dates
        if (row.getCell(5).value) row.getCell(5).numFmt = 'dd/mm/yyyy';
        if (row.getCell(13).value) row.getCell(13).numFmt = 'dd/mm/yyyy';

        // Format currency
        row.getCell(8).numFmt = '"SAR "#,##0.00';
        row.getCell(9).numFmt = '"SAR "#,##0.00';
        row.getCell(10).numFmt = '"SAR "#,##0.00';

        row.getCell(8).font = { bold: true };
        row.getCell(9).font = { bold: true };
        row.getCell(10).font = { bold: true };

        row.height = 20;
      });

      statusSheet.views = [{ state: 'frozen', ySplit: 1 }];
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="VO_Dashboard_Export_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Dashboard export error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
