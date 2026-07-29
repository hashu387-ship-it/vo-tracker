import ExcelJS from 'exceljs';

import type { PaymentPosition, VariationPosition } from '@/lib/domain/calc';
import type { Payment, Project, Variation } from '@/lib/domain/types';
import { PAYMENT_STATUS_META, VARIATION_STATUS_META } from '@/lib/domain/types';

/**
 * Styled workbook export.
 *
 * The layout follows the Red Sea Global dashboard aesthetic used across the
 * project's reporting: Deep Navy header bands, Light Sand sheet background,
 * Lagoon Teal for positive/primary data and Sand Gold for securities.
 */
const NAVY = 'FF0A2533';
const LAGOON = 'FF008C95';
const SAND_GOLD = 'FFC5A065';
const LIGHT_SAND = 'FFF7F5F0';
const WHITE = 'FFFFFFFF';
const RULE = 'FFE0DACE';
const INK = 'FF0A2533';
const MUTED = 'FF5C6A72';

const MONEY = '#,##0.00;[Red]-#,##0.00';
const MONEY_BLANK = '#,##0.00;[Red]-#,##0.00;""';
const PERCENT = '0.0%';

function titleBand(sheet: ExcelJS.Worksheet, columns: number, title: string, subtitle: string) {
  sheet.mergeCells(1, 1, 1, columns);
  sheet.mergeCells(2, 1, 2, columns);

  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: 'Century Gothic', size: 16, bold: true, color: { argb: WHITE } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  sheet.getRow(1).height = 30;

  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = subtitle;
  subtitleCell.font = { name: 'Calibri Light', size: 10, color: { argb: 'FFBFCBD2' } };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  subtitleCell.border = { bottom: { style: 'medium', color: { argb: SAND_GOLD } } };
  sheet.getRow(2).height = 18;
}

function headerRow(sheet: ExcelJS.Worksheet, rowIndex: number, labels: string[]) {
  const row = sheet.getRow(rowIndex);
  row.values = labels;
  row.height = 26;
  row.eachCell((cell) => {
    cell.font = { name: 'Century Gothic', size: 9, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LAGOON } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: RULE } },
      bottom: { style: 'thin', color: { argb: RULE } },
      left: { style: 'thin', color: { argb: RULE } },
      right: { style: 'thin', color: { argb: RULE } },
    };
  });
  return row;
}

function styleBody(sheet: ExcelJS.Worksheet, firstRow: number, lastRow: number, columns: number) {
  for (let r = firstRow; r <= lastRow; r += 1) {
    const row = sheet.getRow(r);
    row.height = 18;
    for (let c = 1; c <= columns; c += 1) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri Light', size: 10, color: { argb: INK } };
      cell.alignment = { vertical: 'middle', wrapText: false };
      cell.border = { bottom: { style: 'hair', color: { argb: RULE } } };
      if ((r - firstRow) % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_SAND } };
      }
    }
  }
}

function summaryBlock(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  heading: string,
  rows: Array<[string, number | string, string?]>,
) {
  const headingCell = sheet.getCell(startRow, 1);
  headingCell.value = heading;
  headingCell.font = { name: 'Century Gothic', size: 10, bold: true, color: { argb: NAVY } };
  sheet.mergeCells(startRow, 1, startRow, 3);
  headingCell.border = { bottom: { style: 'thin', color: { argb: SAND_GOLD } } };

  rows.forEach(([label, value, format], index) => {
    const row = startRow + 1 + index;
    const labelCell = sheet.getCell(row, 1);
    labelCell.value = label;
    labelCell.font = { name: 'Calibri Light', size: 10, color: { argb: MUTED } };
    sheet.mergeCells(row, 1, row, 2);

    const valueCell = sheet.getCell(row, 3);
    valueCell.value = value;
    valueCell.font = { name: 'Calibri Light', size: 10, bold: true, color: { argb: INK } };
    valueCell.alignment = { horizontal: 'right' };
    if (typeof value === 'number') valueCell.numFmt = format ?? MONEY;
  });

  return startRow + rows.length + 2;
}

export async function buildWorkbook({
  project,
  variations,
  payments,
  paymentPosition,
  variationPosition,
  asOf,
}: {
  project: Project;
  variations: Variation[];
  payments: Payment[];
  paymentPosition: PaymentPosition;
  variationPosition: VariationPosition;
  asOf: string;
}): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = `${project.contractor} commercial team`;
  workbook.created = new Date();
  workbook.properties.date1904 = false;

  /* ---------------- Summary ---------------- */
  const summary = workbook.addWorksheet('Summary', {
    views: [{ showGridLines: false }],
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
  });
  summary.columns = [{ width: 34 }, { width: 14 }, { width: 22 }, { width: 4 }, { width: 34 }, { width: 22 }];
  titleBand(
    summary,
    6,
    `${project.code} — Commercial Summary`,
    `${project.name} · ${project.contractor} for ${project.client} · all values ${project.currency} · as of ${asOf}`,
  );

  let cursor = 4;
  cursor = summaryBlock(summary, cursor, 'I. CONTRACT', [
    ['Original contract value', project.originalContractValue],
    ['Revised contract value', project.revisedContractValue],
    [
      'Uplift against original',
      project.originalContractValue
        ? project.revisedContractValue / project.originalContractValue - 1
        : 0,
      PERCENT,
    ],
    ['Contract date', project.contractDate ?? '—'],
  ]);

  cursor = summaryBlock(summary, cursor, 'II. WORK & PAYMENT PROGRESS', [
    ['Received', paymentPosition.received],
    ['Approved via Aconex', paymentPosition.approved],
    ['Submitted on Aconex', paymentPosition.submitted],
    ['Total work done', paymentPosition.totalWorkDone],
    ['Percent complete', paymentPosition.percentComplete, PERCENT],
    ['Balance to complete', paymentPosition.balanceToComplete],
    ['Under review (not yet certified)', paymentPosition.underReview],
  ]);

  cursor = summaryBlock(summary, cursor, 'III. CASH', [
    ['Net certified', paymentPosition.netCertifiedTotal],
    ['Cash received', paymentPosition.cashReceivedTotal],
    ['Outstanding', paymentPosition.outstanding],
    ['Outstanding certificates', paymentPosition.outstandingCount, '0'],
  ]);

  let right = 4;
  const rightBlock = (heading: string, rows: Array<[string, number | string, string?]>) => {
    const headingCell = summary.getCell(right, 5);
    headingCell.value = heading;
    headingCell.font = { name: 'Century Gothic', size: 10, bold: true, color: { argb: NAVY } };
    summary.mergeCells(right, 5, right, 6);
    headingCell.border = { bottom: { style: 'thin', color: { argb: SAND_GOLD } } };

    rows.forEach(([label, value, format], index) => {
      const row = right + 1 + index;
      const labelCell = summary.getCell(row, 5);
      labelCell.value = label;
      labelCell.font = { name: 'Calibri Light', size: 10, color: { argb: MUTED } };
      const valueCell = summary.getCell(row, 6);
      valueCell.value = value;
      valueCell.font = { name: 'Calibri Light', size: 10, bold: true, color: { argb: INK } };
      valueCell.alignment = { horizontal: 'right' };
      if (typeof value === 'number') valueCell.numFmt = format ?? MONEY;
    });
    right += rows.length + 2;
  };

  rightBlock('IV. ADVANCE PAYMENT', [
    ['Total advance', paymentPosition.advanceTotal],
    ['Recovered to date', paymentPosition.advanceDeducted],
    ['Balance', paymentPosition.advanceBalance],
    ['Recovered', paymentPosition.advanceRecoveredPercent, PERCENT],
  ]);

  rightBlock('V. RETENTION', [
    [`Cap (${(project.retentionCapPercent * 100).toFixed(0)}% of revised contract)`, paymentPosition.retentionCap],
    ['Deducted to date', paymentPosition.retentionDeducted],
    ['Still to deduct', paymentPosition.retentionBalance],
  ]);

  rightBlock('VI. VARIATIONS', [
    ['Total submitted value', variationPosition.totalValue],
    ['Secured (DVO issued)', variationPosition.settledValue],
    ['Open with a party', variationPosition.openValue],
    ['Additions', variationPosition.additionsValue],
    ['Omissions', variationPosition.omissionsValue],
    ['Variations logged', variationPosition.total, '0'],
  ]);

  const statusStart = Math.max(cursor, right) + 1;
  headerRow(summary, statusStart, ['Variation status', '', 'Count', '', 'Agreed value', '']);
  variationPosition.byStatus.forEach((row, index) => {
    const r = statusStart + 1 + index;
    summary.getCell(r, 1).value = row.label;
    summary.mergeCells(r, 1, r, 2);
    summary.getCell(r, 3).value = row.count;
    summary.getCell(r, 3).alignment = { horizontal: 'right' };
    summary.getCell(r, 5).value = row.value;
    summary.getCell(r, 5).numFmt = MONEY;
    summary.mergeCells(r, 5, r, 6);
  });
  styleBody(summary, statusStart + 1, statusStart + variationPosition.byStatus.length, 6);

  /* ---------------- VO log ---------------- */
  const voSheet = workbook.addWorksheet('VO Log', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 4 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });
  voSheet.columns = [
    { width: 6 },
    { width: 11 },
    { width: 52 },
    { width: 22 },
    { width: 12 },
    { width: 12 },
    { width: 11 },
    { width: 17 },
    { width: 17 },
    { width: 17 },
    { width: 28 },
    { width: 28 },
    { width: 40 },
    { width: 40 },
    { width: 12 },
  ];
  titleBand(
    voSheet,
    15,
    `${project.code} — Variation Order Log`,
    `${variations.length} variations · total submitted ${variationPosition.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${project.currency} · contractor ${project.contractor} · employer ${project.client} · as of ${asOf}`,
  );
  headerRow(voSheet, 4, [
    '#',
    'VO No.',
    'Subject',
    'Status',
    'Raised',
    'Submitted',
    'Type',
    `Cost proposal (${project.currency})`,
    `Employer assessment (${project.currency})`,
    `Agreed value (${project.currency})`,
    'VOR reference',
    'DVO ref',
    'Contractor remarks',
    'Employer remarks',
    'Owner',
  ]);

  variations.forEach((variation, index) => {
    const row = voSheet.getRow(5 + index);
    row.values = [
      variation.serial,
      variation.voNumber ?? '',
      variation.subject,
      variation.status ? VARIATION_STATUS_META[variation.status].label : '',
      variation.aconexDate ?? '',
      variation.submissionDate ?? '',
      variation.submissionType ?? '',
      variation.proposalValue ?? null,
      variation.clientAssessment ?? null,
      variation.agreedValue ?? null,
      variation.vorRef ?? '',
      variation.dvoRef ?? '',
      variation.contractorRemarks ?? '',
      variation.clientRemarks ?? '',
      variation.owner ?? '',
    ];
    for (const column of [8, 9, 10]) row.getCell(column).numFmt = MONEY_BLANK;
    row.getCell(1).alignment = { horizontal: 'center' };
    if (variation.aconexLink) {
      row.getCell(2).value = {
        text: variation.voNumber ?? String(variation.serial),
        hyperlink: variation.aconexLink,
      };
      row.getCell(2).font = { name: 'Calibri Light', size: 10, color: { argb: LAGOON }, underline: true };
    }
  });
  styleBody(voSheet, 5, 4 + variations.length, 15);

  const voTotalRow = voSheet.getRow(5 + variations.length);
  voTotalRow.getCell(3).value = 'TOTAL SUBMITTED VARIATIONS';
  voTotalRow.getCell(8).value = variations.reduce((sum, v) => sum + (v.proposalValue ?? 0), 0);
  voTotalRow.getCell(10).value = variationPosition.totalValue;
  for (const column of [3, 8, 10]) {
    const cell = voTotalRow.getCell(column);
    cell.font = { name: 'Century Gothic', size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    if (column !== 3) cell.numFmt = MONEY;
  }
  for (let c = 1; c <= 15; c += 1) {
    const cell = voTotalRow.getCell(c);
    if (!cell.fill || cell.fill.type !== 'pattern') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    }
  }
  voSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + variations.length, column: 15 } };

  /* ---------------- Payment register ---------------- */
  const paySheet = workbook.addWorksheet('Payment Register', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 4 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });
  paySheet.columns = [
    { width: 10 },
    { width: 30 },
    { width: 18 },
    { width: 18 },
    { width: 14 },
    { width: 16 },
    { width: 17 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
    { width: 13 },
    { width: 13 },
    { width: 22 },
  ];
  titleBand(
    paySheet,
    14,
    `${project.code} — Payment Register`,
    `${payments.length} certificates · work done ${paymentPosition.totalWorkDone.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${project.currency} · as of ${asOf}`,
  );
  headerRow(paySheet, 4, [
    'No.',
    'Claim period',
    'Gross certified',
    'Advance recovery',
    'Back charge',
    'Retention',
    'VAT on advance',
    'VAT 15%',
    'Net certified',
    'Received',
    'Balance due',
    'Submitted',
    'Tax invoice',
    'Status',
  ]);

  payments.forEach((payment, index) => {
    const row = paySheet.getRow(5 + index);
    row.values = [
      payment.ref,
      payment.period ?? '',
      payment.grossCertified,
      payment.advanceRecovery || null,
      payment.backCharge || null,
      payment.retention || null,
      payment.vatOnAdvanceRecovery || null,
      payment.vat || null,
      payment.netCertified,
      payment.received ?? null,
      Math.round((payment.netCertified - (payment.received ?? 0)) * 100) / 100 || null,
      payment.submittedDate ?? '',
      payment.taxInvoiceDate ?? '',
      PAYMENT_STATUS_META[payment.status].label,
    ];
    for (let c = 3; c <= 11; c += 1) row.getCell(c).numFmt = MONEY_BLANK;
  });
  styleBody(paySheet, 5, 4 + payments.length, 14);

  const payTotalRow = paySheet.getRow(5 + payments.length);
  const total = (pick: (payment: Payment) => number) =>
    Math.round(payments.reduce((sum, payment) => sum + pick(payment), 0) * 100) / 100;
  payTotalRow.values = [
    'TOTAL',
    '',
    total((p) => p.grossCertified),
    total((p) => p.advanceRecovery),
    total((p) => p.backCharge),
    total((p) => p.retention),
    total((p) => p.vatOnAdvanceRecovery),
    total((p) => p.vat),
    total((p) => p.netCertified),
    total((p) => p.received ?? 0),
    paymentPosition.outstanding,
  ];
  for (let c = 1; c <= 14; c += 1) {
    const cell = payTotalRow.getCell(c);
    cell.font = { name: 'Century Gothic', size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    if (c >= 3 && c <= 11) cell.numFmt = MONEY;
  }
  paySheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + payments.length, column: 14 } };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}
