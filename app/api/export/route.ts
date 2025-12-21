import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { voQuerySchema, statusConfig, submissionTypeConfig } from '@/lib/validations/vo';
import ExcelJS from 'exceljs';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Export options schema
interface ExportOptions {
  includeCharts?: boolean;
  includeSummary?: boolean;
  includeTimeline?: boolean;
  includeFinancialAnalysis?: boolean;
  groupByStatus?: boolean;
  template?: 'standard' | 'detailed' | 'executive' | 'financial';
}

// GET /api/export - Export VOs to Excel with advanced features
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

    // Parse export options
    const exportOptions: ExportOptions = {
      includeCharts: searchParams.get('includeCharts') !== 'false',
      includeSummary: searchParams.get('includeSummary') !== 'false',
      includeTimeline: searchParams.get('includeTimeline') === 'true',
      includeFinancialAnalysis: searchParams.get('includeFinancialAnalysis') !== 'false',
      groupByStatus: searchParams.get('groupByStatus') === 'true',
      template: (searchParams.get('template') as any) || 'detailed',
    };

    // Build where clause
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

    // Fetch all matching VOs
    const vos = await prisma.vO.findMany({
      where,
      orderBy,
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VO Tracker';
    workbook.created = new Date();
    workbook.company = 'Your Company';
    workbook.properties.date1904 = false;

    // Add main data sheet
    await createMainDataSheet(workbook, vos, exportOptions);

    // Add summary dashboard sheet
    if (exportOptions.includeSummary) {
      await createSummarySheet(workbook, vos, exportOptions);
    }

    // Add financial analysis sheet
    if (exportOptions.includeFinancialAnalysis) {
      await createFinancialAnalysisSheet(workbook, vos);
    }

    // Add timeline sheet
    if (exportOptions.includeTimeline) {
      await createTimelineSheet(workbook, vos);
    }

    // Add grouped by status sheets
    if (exportOptions.groupByStatus) {
      await createGroupedStatusSheets(workbook, vos);
    }

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

// Create main data sheet
async function createMainDataSheet(workbook: ExcelJS.Workbook, vos: any[], options: ExportOptions) {
  const worksheet = workbook.addWorksheet('All Variation Orders', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { tabColor: { argb: 'FF4472C4' } },
  });

  // Define columns based on template
  const columns = getColumnsForTemplate(options.template || 'detailed');
  worksheet.columns = columns;

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 30;

  // Add data rows with enhanced styling
  vos.forEach((vo, index) => {
    const rowData = getRowDataForTemplate(vo, options.template || 'detailed');
    const row = worksheet.addRow(rowData);

    // Alternate row colors
    if (index % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' },
      };
    }

    // Apply colorful status styling
    const statusCell = row.getCell('status');
    const statusConfigEntry = statusConfig[vo.status as keyof typeof statusConfig];
    if (statusConfigEntry) {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${statusConfigEntry.hexColor}` },
      };
      const useWhiteText = ['PendingWithFFC', 'PendingWithRSG', 'ApprovedAwaitingDVO', 'DVORRIssued'].includes(vo.status);
      statusCell.font = {
        color: { argb: useWhiteText ? 'FFFFFFFF' : 'FF000000' },
        bold: true,
      };
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    // Format currency columns (only if they exist in the template)
    const currencyColumns = ['assessmentValue', 'proposalValue', 'approvedAmount', 'variance'];
    currencyColumns.forEach((key) => {
      try {
        const cell = row.getCell(key);
        if (cell && cell.value !== undefined) {
          cell.numFmt = '"SAR "#,##0.00';
          cell.font = { bold: true };
        }
      } catch (e) {
        // Column doesn't exist in this template, skip
      }
    });

    // Add data bars for financial values
    if (vo.proposalValue && options.template === 'detailed') {
      const proposalCell = row.getCell('proposalValue');
      const maxValue = Math.max(...vos.map(v => v.proposalValue || 0));
      if (maxValue > 0) {
        const percentage = ((vo.proposalValue || 0) / maxValue) * 100;
        // Add conditional formatting via fill (approximation)
      }
    }
  });

  // Add totals row
  const totalsRow = worksheet.addRow(getTotalsRowData(vos, options.template || 'detailed'));
  totalsRow.font = { bold: true, size: 12 };
  totalsRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' },
  };
  totalsRow.height = 30;

  const currencyColumns = ['assessmentValue', 'proposalValue', 'approvedAmount', 'variance'];
  currencyColumns.forEach((key) => {
    try {
      const cell = totalsRow.getCell(key);
      if (cell && cell.value !== undefined) {
        cell.numFmt = '"SAR "#,##0.00';
        cell.font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };
      }
    } catch (e) {
      // Column doesn't exist in this template, skip
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
}

// Create summary dashboard sheet
async function createSummarySheet(workbook: ExcelJS.Workbook, vos: any[], options: ExportOptions) {
  const worksheet = workbook.addWorksheet('Executive Summary', {
    properties: { tabColor: { argb: 'FF10B981' } },
  });

  let currentRow = 1;

  // Title
  worksheet.mergeCells(currentRow, 1, currentRow, 6);
  const titleCell = worksheet.getRow(currentRow).getCell(1);
  titleCell.value = 'VARIATION ORDERS EXECUTIVE SUMMARY';
  titleCell.font = { bold: true, size: 20, color: { argb: 'FF1F2937' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 40;
  currentRow += 2;

  // Report metadata
  worksheet.getRow(currentRow).getCell(1).value = 'Report Generated:';
  worksheet.getRow(currentRow).getCell(1).font = { bold: true };
  worksheet.getRow(currentRow).getCell(2).value = format(new Date(), 'PPpp');
  currentRow++;

  worksheet.getRow(currentRow).getCell(1).value = 'Total Records:';
  worksheet.getRow(currentRow).getCell(1).font = { bold: true };
  worksheet.getRow(currentRow).getCell(2).value = vos.length;
  currentRow += 2;

  // Key metrics cards
  const metrics = [
    {
      label: 'Total VOs',
      value: vos.length,
      color: 'FF3B82F6',
    },
    {
      label: 'Total Assessment Value',
      value: vos.reduce((sum, vo) => sum + (vo.assessmentValue || 0), 0),
      format: 'currency',
      color: 'FF8B5CF6',
    },
    {
      label: 'Total Proposal Value',
      value: vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0),
      format: 'currency',
      color: 'FF10B981',
    },
    {
      label: 'Total Approved Amount',
      value: vos.reduce((sum, vo) => sum + (vo.approvedAmount || 0), 0),
      format: 'currency',
      color: 'FFF59E0B',
    },
  ];

  // Create metric cards
  let col = 1;
  metrics.forEach((metric) => {
    const cardRow = currentRow;

    // Metric label
    worksheet.getRow(cardRow).getCell(col).value = metric.label;
    worksheet.getRow(cardRow).getCell(col).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(cardRow).getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: metric.color },
    };
    worksheet.getRow(cardRow).getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };

    // Metric value
    const valueCell = worksheet.getRow(cardRow + 1).getCell(col);
    valueCell.value = metric.value;
    if (metric.format === 'currency') {
      valueCell.numFmt = '"SAR "#,##0.00';
    }
    valueCell.font = { bold: true, size: 16, color: { argb: metric.color } };
    valueCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.getRow(cardRow).height = 25;
    worksheet.getRow(cardRow + 1).height = 35;

    col += 2;
  });
  currentRow += 3;

  // Status breakdown table
  currentRow += 2;
  worksheet.mergeCells(currentRow, 1, currentRow, 4);
  const statusTitleCell = worksheet.getRow(currentRow).getCell(1);
  statusTitleCell.value = 'STATUS BREAKDOWN';
  statusTitleCell.font = { bold: true, size: 14 };
  statusTitleCell.alignment = { horizontal: 'center' };
  statusTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };
  statusTitleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(currentRow).height = 30;
  currentRow++;

  // Status table headers
  const statusHeaderRow = worksheet.getRow(currentRow);
  statusHeaderRow.getCell(1).value = 'Status';
  statusHeaderRow.getCell(2).value = 'Count';
  statusHeaderRow.getCell(3).value = 'Percentage';
  statusHeaderRow.getCell(4).value = 'Total Value (SAR)';
  statusHeaderRow.font = { bold: true };
  statusHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };
  statusHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  // Calculate status data
  const statusData = Object.keys(statusConfig).map((statusKey) => {
    const statusVOs = vos.filter(vo => vo.status === statusKey);
    const count = statusVOs.length;
    const percentage = vos.length > 0 ? (count / vos.length) * 100 : 0;
    const totalValue = statusVOs.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0);

    return {
      status: statusKey,
      label: statusConfig[statusKey as keyof typeof statusConfig].label,
      color: statusConfig[statusKey as keyof typeof statusConfig].hexColor,
      count,
      percentage,
      totalValue,
    };
  }).sort((a, b) => b.count - a.count);

  // Add status rows
  statusData.forEach((item) => {
    const row = worksheet.getRow(currentRow);

    // Status name with color
    row.getCell(1).value = item.label;
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${item.color}` },
    };
    const useWhiteText = ['PendingWithFFC', 'PendingWithRSG', 'ApprovedAwaitingDVO', 'DVORRIssued'].includes(item.status);
    row.getCell(1).font = { bold: true, color: { argb: useWhiteText ? 'FFFFFFFF' : 'FF000000' } };
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

    // Count
    row.getCell(2).value = item.count;
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).font = { bold: true };

    // Percentage
    row.getCell(3).value = item.percentage / 100;
    row.getCell(3).numFmt = '0.00%';
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

    // Total value
    row.getCell(4).value = item.totalValue;
    row.getCell(4).numFmt = '"SAR "#,##0.00';
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };

    // Borders
    [1, 2, 3, 4].forEach((col) => {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });

    currentRow++;
  });

  // Set column widths
  worksheet.getColumn(1).width = 35;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 15;
  worksheet.getColumn(4).width = 25;

  // Add chart placeholder info
  if (options.includeCharts) {
    currentRow += 2;
    worksheet.getRow(currentRow).getCell(1).value = '📊 Charts and visualizations are best viewed in the exported file';
    worksheet.getRow(currentRow).getCell(1).font = { italic: true, color: { argb: 'FF6B7280' } };
    worksheet.mergeCells(currentRow, 1, currentRow, 4);
  }
}

// Create financial analysis sheet
async function createFinancialAnalysisSheet(workbook: ExcelJS.Workbook, vos: any[]) {
  const worksheet = workbook.addWorksheet('Financial Analysis', {
    properties: { tabColor: { argb: 'FFF59E0B' } },
  });

  let currentRow = 1;

  // Title
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  const titleCell = worksheet.getRow(currentRow).getCell(1);
  titleCell.value = 'FINANCIAL ANALYSIS';
  titleCell.font = { bold: true, size: 18, color: { argb: 'FF1F2937' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 35;
  currentRow += 2;

  // Financial summary
  const assessmentTotal = vos.reduce((sum, vo) => sum + (vo.assessmentValue || 0), 0);
  const proposalTotal = vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0);
  const approvedTotal = vos.reduce((sum, vo) => sum + (vo.approvedAmount || 0), 0);
  const variance = proposalTotal - approvedTotal;
  const approvalRate = proposalTotal > 0 ? (approvedTotal / proposalTotal) * 100 : 0;

  const financialMetrics = [
    ['Metric', 'Value (SAR)', 'Notes'],
    ['Total Assessment Value', assessmentTotal, 'Initial assessment by FFC'],
    ['Total Proposal Value', proposalTotal, 'Submitted by contractor'],
    ['Total Approved Amount', approvedTotal, 'Final approved amount'],
    ['Variance (Proposal - Approved)', variance, variance < 0 ? 'Under budget' : 'Over budget'],
    ['Approval Rate', approvalRate / 100, 'Approved / Proposed ratio'],
  ];

  financialMetrics.forEach((row, index) => {
    const excelRow = worksheet.getRow(currentRow);
    excelRow.getCell(1).value = row[0];
    excelRow.getCell(2).value = row[1];
    excelRow.getCell(3).value = row[2];

    if (index === 0) {
      // Header row
      excelRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      excelRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' },
      };
      excelRow.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      excelRow.getCell(1).font = { bold: true };

      // Format currency
      if (index <= 4) {
        excelRow.getCell(2).numFmt = '"SAR "#,##0.00';
      } else {
        excelRow.getCell(2).numFmt = '0.00%';
      }

      // Color coding for variance
      if (index === 4) {
        const varianceColor = (row[1] as number) < 0 ? 'FF10B981' : 'FFF59E0B';
        excelRow.getCell(2).font = { bold: true, color: { argb: varianceColor } };
      }
    }

    [1, 2, 3].forEach((col) => {
      excelRow.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });

    currentRow++;
  });

  // Set column widths
  worksheet.getColumn(1).width = 35;
  worksheet.getColumn(2).width = 25;
  worksheet.getColumn(3).width = 40;

  // Top 10 VOs by value
  currentRow += 2;
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  const top10Title = worksheet.getRow(currentRow).getCell(1);
  top10Title.value = 'TOP 10 VOs BY PROPOSAL VALUE';
  top10Title.font = { bold: true, size: 14 };
  top10Title.alignment = { horizontal: 'center' };
  top10Title.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' },
  };
  currentRow++;

  const top10Headers = worksheet.getRow(currentRow);
  ['Rank', 'Subject', 'Proposal Value', 'Approved Amount', 'Status'].forEach((header, index) => {
    top10Headers.getCell(index + 1).value = header;
  });
  top10Headers.font = { bold: true };
  top10Headers.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };
  top10Headers.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  const top10VOs = [...vos]
    .sort((a, b) => (b.proposalValue || 0) - (a.proposalValue || 0))
    .slice(0, 10);

  top10VOs.forEach((vo, index) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = vo.subject;
    row.getCell(3).value = vo.proposalValue || 0;
    row.getCell(4).value = vo.approvedAmount || 0;
    row.getCell(5).value = statusConfig[vo.status as keyof typeof statusConfig]?.label || vo.status;

    row.getCell(3).numFmt = '"SAR "#,##0.00';
    row.getCell(4).numFmt = '"SAR "#,##0.00';

    // Borders
    [1, 2, 3, 4, 5].forEach((col) => {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
      row.getCell(col).alignment = { vertical: 'middle' };
    });

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(1).font = { bold: true };

    currentRow++;
  });
}

// Create timeline sheet
async function createTimelineSheet(workbook: ExcelJS.Workbook, vos: any[]) {
  const worksheet = workbook.addWorksheet('Timeline Analysis', {
    properties: { tabColor: { argb: 'FF6366F1' } },
  });

  let currentRow = 1;

  // Title
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  const titleCell = worksheet.getRow(currentRow).getCell(1);
  titleCell.value = 'VARIATION ORDERS TIMELINE ANALYSIS';
  titleCell.font = { bold: true, size: 18, color: { argb: 'FF1F2937' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 35;
  currentRow += 2;

  // Get submission dates
  const validVOs = vos.filter(vo => vo.submissionDate);
  if (validVOs.length === 0) {
    worksheet.getRow(currentRow).getCell(1).value = 'No timeline data available';
    return;
  }

  const dates = validVOs.map(vo => new Date(vo.submissionDate));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Monthly breakdown
  const months = eachMonthOfInterval({ start: minDate, end: maxDate });

  // Header
  const headerRow = worksheet.getRow(currentRow);
  ['Month', 'VOs Submitted', 'Total Proposal Value', 'Avg Value per VO', 'Status Breakdown'].forEach((header, index) => {
    headerRow.getCell(index + 1).value = header;
  });
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  months.forEach((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthVOs = validVOs.filter(vo => {
      const voDate = new Date(vo.submissionDate);
      return voDate >= monthStart && voDate <= monthEnd;
    });

    if (monthVOs.length > 0) {
      const row = worksheet.getRow(currentRow);
      const totalValue = monthVOs.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0);
      const avgValue = totalValue / monthVOs.length;

      row.getCell(1).value = format(month, 'MMM yyyy');
      row.getCell(2).value = monthVOs.length;
      row.getCell(3).value = totalValue;
      row.getCell(4).value = avgValue;
      row.getCell(5).value = `Pending: ${monthVOs.filter(vo => vo.status.includes('Pending')).length}`;

      row.getCell(3).numFmt = '"SAR "#,##0.00';
      row.getCell(4).numFmt = '"SAR "#,##0.00';

      [1, 2, 3, 4, 5].forEach((col) => {
        row.getCell(col).border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
        row.getCell(col).alignment = { vertical: 'middle' };
      });

      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

      currentRow++;
    }
  });

  // Set column widths
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 18;
  worksheet.getColumn(3).width = 25;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 30;
}

// Create grouped status sheets
async function createGroupedStatusSheets(workbook: ExcelJS.Workbook, vos: any[]) {
  Object.keys(statusConfig).forEach((statusKey) => {
    const statusVOs = vos.filter(vo => vo.status === statusKey);
    if (statusVOs.length === 0) return;

    const config = statusConfig[statusKey as keyof typeof statusConfig];
    // Remove invalid characters from sheet name (Excel doesn't allow: * ? : \ / [ ])
    const sanitizedName = config.label.replace(/[*?:\\\/\[\]]/g, '-').substring(0, 30);
    const worksheet = workbook.addWorksheet(sanitizedName, {
      properties: { tabColor: { argb: `FF${config.hexColor}` } },
    });

    // Add title
    worksheet.mergeCells(1, 1, 1, 6);
    const titleCell = worksheet.getRow(1).getCell(1);
    titleCell.value = `${config.label} (${statusVOs.length} VOs)`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${config.hexColor}` },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Subject', key: 'subject', width: 45 },
      { header: 'Type', key: 'submissionType', width: 12 },
      { header: 'Submission Date', key: 'submissionDate', width: 15 },
      { header: 'Proposal Value', key: 'proposalValue', width: 20 },
      { header: 'Remarks', key: 'remarks', width: 40 },
    ];

    // Header row
    const headerRow = worksheet.getRow(2);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data
    statusVOs.forEach((vo) => {
      const row = worksheet.addRow({
        id: vo.id,
        subject: vo.subject,
        submissionType: submissionTypeConfig[vo.submissionType as keyof typeof submissionTypeConfig]?.label || vo.submissionType,
        submissionDate: vo.submissionDate ? format(new Date(vo.submissionDate), 'yyyy-MM-dd') : '',
        proposalValue: vo.proposalValue,
        remarks: vo.remarks || '',
      });

      const proposalCell = row.getCell('proposalValue');
      if (proposalCell.value) {
        proposalCell.numFmt = '"SAR "#,##0.00';
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
  });
}

// Helper functions
function getColumnsForTemplate(template: string) {
  const baseColumns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Subject', key: 'subject', width: 45 },
    { header: 'Type', key: 'submissionType', width: 12 },
    { header: 'Status', key: 'status', width: 22 },
  ];

  if (template === 'standard') {
    return [
      ...baseColumns,
      { header: 'Submission Date', key: 'submissionDate', width: 15 },
      { header: 'Proposal Value (SAR)', key: 'proposalValue', width: 20 },
    ];
  }

  if (template === 'executive') {
    return [
      ...baseColumns,
      { header: 'Proposal Value (SAR)', key: 'proposalValue', width: 20 },
      { header: 'Approved Amount (SAR)', key: 'approvedAmount', width: 20 },
    ];
  }

  if (template === 'financial') {
    return [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Subject', key: 'subject', width: 45 },
      { header: 'Assessment Value (SAR)', key: 'assessmentValue', width: 20 },
      { header: 'Proposal Value (SAR)', key: 'proposalValue', width: 20 },
      { header: 'Approved Amount (SAR)', key: 'approvedAmount', width: 20 },
      { header: 'Variance (SAR)', key: 'variance', width: 20 },
      { header: 'Status', key: 'status', width: 22 },
    ];
  }

  // Detailed (default)
  return [
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
}

function getRowDataForTemplate(vo: any, template: string) {
  const baseData = {
    id: vo.id,
    subject: vo.subject,
    submissionType: submissionTypeConfig[vo.submissionType as keyof typeof submissionTypeConfig]?.label || vo.submissionType,
    status: statusConfig[vo.status as keyof typeof statusConfig]?.label || vo.status,
  };

  if (template === 'standard') {
    return {
      ...baseData,
      submissionDate: vo.submissionDate ? format(new Date(vo.submissionDate), 'yyyy-MM-dd') : '',
      proposalValue: vo.proposalValue,
    };
  }

  if (template === 'executive') {
    return {
      ...baseData,
      proposalValue: vo.proposalValue,
      approvedAmount: vo.approvedAmount,
    };
  }

  if (template === 'financial') {
    return {
      id: vo.id,
      subject: vo.subject,
      assessmentValue: vo.assessmentValue,
      proposalValue: vo.proposalValue,
      approvedAmount: vo.approvedAmount,
      variance: (vo.proposalValue || 0) - (vo.approvedAmount || 0),
      status: statusConfig[vo.status as keyof typeof statusConfig]?.label || vo.status,
    };
  }

  // Detailed (default)
  return {
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
  };
}

function getTotalsRowData(vos: any[], template: string) {
  const baseData = {
    id: '',
    subject: 'TOTALS',
    submissionType: '',
    status: '',
  };

  if (template === 'standard') {
    return {
      ...baseData,
      submissionDate: '',
      proposalValue: vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0),
    };
  }

  if (template === 'executive') {
    return {
      ...baseData,
      proposalValue: vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0),
      approvedAmount: vos.reduce((sum, vo) => sum + (vo.approvedAmount || 0), 0),
    };
  }

  if (template === 'financial') {
    const proposalTotal = vos.reduce((sum, vo) => sum + (vo.proposalValue || 0), 0);
    const approvedTotal = vos.reduce((sum, vo) => sum + (vo.approvedAmount || 0), 0);
    return {
      id: '',
      subject: 'TOTALS',
      assessmentValue: vos.reduce((sum, vo) => sum + (vo.assessmentValue || 0), 0),
      proposalValue: proposalTotal,
      approvedAmount: approvedTotal,
      variance: proposalTotal - approvedTotal,
      status: '',
    };
  }

  // Detailed (default)
  return {
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
  };
}
