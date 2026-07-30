import ExcelJS from 'exceljs';

import { parsePeriod } from '@/lib/domain/calc';
import {
  normalisePaymentStatus,
  normaliseSubmissionType,
  normaliseVariationStatus,
  type PaymentKind,
} from '@/lib/domain/types';

/**
 * Reader for the source "Pay Reg & VO LOG" workbook.
 *
 * It accepts the sheet either under its original name or under the name this
 * app exports, and locates the header row by looking for the anchor labels
 * rather than assuming a fixed offset — the source workbook has gained and lost
 * banner rows over its life.
 */

export interface ImportedVariation {
  serial: number;
  voNumber: string | null;
  aconexDate: string | null;
  dvoReference: string | null;
  subject: string;
  submissionDate: string | null;
  submissionType: string | null;
  submissionRef: string | null;
  responseRef: string | null;
  proposalValue: number | null;
  clientAssessment: number | null;
  agreedValue: number | null;
  status: string | null;
  vorRef: string | null;
  dvoRef: string | null;
  contractorRemarks: string | null;
  clientRemarks: string | null;
  aconexLink: string | null;
  submissionLink: string | null;
  owner: string | null;
}

export interface ImportedPayment {
  sequence: number;
  ref: string;
  kind: PaymentKind;
  period: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  grossCertified: number;
  advanceRecovery: number;
  backCharge: number;
  retention: number;
  vatOnAdvanceRecovery: number;
  vat: number;
  netCertified: number;
  received: number | null;
  submittedDate: string | null;
  taxInvoiceDate: string | null;
  dueDate: string | null;
  paymentNote: string | null;
  status: string | null;
  collectedDate: string | null;
  contractorAction: string | null;
  clientAction: string | null;
}

export interface ImportResult {
  variations: ImportedVariation[];
  payments: ImportedPayment[];
  project: {
    code: string | null;
    contractor: string | null;
    contractDate: string | null;
    originalContractValue: number | null;
    revisedContractValue: number | null;
    advancePaymentTotal: number | null;
  };
  warnings: string[];
}

/* ---------------- cell helpers ---------------- */

function cellText(cell: ExcelJS.Cell | undefined): string | null {
  if (!cell) return null;
  const value = cell.value;
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim() || null;
  if (typeof value === 'number') return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').replace(/\s+/g, ' ').trim() || null;
    }
    if ('text' in value && typeof value.text === 'string') {
      return value.text.replace(/\s+/g, ' ').trim() || null;
    }
    if ('result' in value) {
      const result = (value as { result?: unknown }).result;
      if (typeof result === 'string') return result.trim() || null;
      if (typeof result === 'number') return String(result);
    }
  }
  return null;
}

function cellNumber(cell: ExcelJS.Cell | undefined): number | null {
  if (!cell) return null;
  const value = cell.value;
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  if (value && typeof value === 'object' && 'result' in value) {
    const result = (value as { result?: unknown }).result;
    if (typeof result === 'number') return Math.round(result * 100) / 100;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(parsed) && value.trim() !== '' ? Math.round(parsed * 100) / 100 : null;
  }
  return null;
}

function cellDate(cell: ExcelJS.Cell | undefined): string | null {
  if (!cell) return null;
  const value = cell.value;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
      .toISOString()
      .slice(0, 10);
  }
  const text = cellText(cell);
  if (!text) return null;
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return null;
}

function hyperlink(cell: ExcelJS.Cell | undefined): string | null {
  if (!cell) return null;
  const value = cell.value;
  if (value && typeof value === 'object' && 'hyperlink' in value) {
    return (value as { hyperlink?: string }).hyperlink ?? null;
  }
  return null;
}

function findSheet(workbook: ExcelJS.Workbook, candidates: string[]): ExcelJS.Worksheet | null {
  for (const name of candidates) {
    const sheet = workbook.worksheets.find(
      (worksheet) => worksheet.name.toLowerCase().trim() === name.toLowerCase(),
    );
    if (sheet) return sheet;
  }
  // Fall back to a fuzzy match so "VO LOG (3)" still imports.
  for (const name of candidates) {
    const key = name.toLowerCase().replace(/[^a-z]/g, '');
    const sheet = workbook.worksheets.find((worksheet) =>
      worksheet.name.toLowerCase().replace(/[^a-z]/g, '').startsWith(key),
    );
    if (sheet) return sheet;
  }
  return null;
}

/**
 * Locates the header row by scanning for anchor labels. Patterns rather than
 * literals, so the source workbook ("Net Payment Certified") and this app's own
 * export ("Net certified") both resolve.
 */
function findHeaderRow(sheet: ExcelJS.Worksheet, anchors: RegExp[], limit = 30): number | null {
  for (let r = 1; r <= Math.min(limit, sheet.rowCount); r += 1) {
    const row = sheet.getRow(r);
    const text: string[] = [];
    for (let c = 1; c <= Math.max(30, sheet.columnCount || 30); c += 1) {
      const value = cellText(row.getCell(c));
      if (value) text.push(value.toLowerCase());
    }
    const joined = text.join(' | ');
    if (anchors.every((anchor) => anchor.test(joined))) return r;
  }
  return null;
}

/** Past the last usable Excel column — reading it always yields an empty cell. */
const ABSENT_COLUMN = 16_000;

/**
 * Maps fields to columns by reading the header labels, falling back to the
 * source workbook's fixed positions when a label is missing. This is what lets
 * both the original "Pay Reg & VO LOG" workbook and this app's own export be
 * imported without either one dictating the column order.
 */
function mapColumns<K extends string>(
  sheet: ExcelJS.Worksheet,
  headerRow: number,
  spec: Record<K, { patterns: readonly RegExp[]; fallback: number }>,
): Record<K, number> {
  const labels = new Map<number, string>();
  const width = Math.max(sheet.columnCount || 0, 30);
  for (let c = 1; c <= width; c += 1) {
    const value = cellText(sheet.getRow(headerRow).getCell(c));
    if (value) labels.set(c, value.toLowerCase());
  }

  const taken = new Set<number>();
  const result = {} as Record<K, number>;

  for (const [field, { patterns, fallback }] of Object.entries(spec) as Array<
    [K, { patterns: readonly RegExp[]; fallback: number }]
  >) {
    let found: number | null = null;
    for (const pattern of patterns) {
      for (const [column, label] of labels) {
        if (taken.has(column)) continue;
        if (pattern.test(label)) {
          found = column;
          break;
        }
      }
      if (found !== null) break;
    }

    // The fallback position is only trustworthy when that column carries no
    // label of its own — otherwise the sheet simply does not have this field,
    // and reading its fallback would silently pull a neighbouring column in.
    const fallbackIsFree = !taken.has(fallback) && !labels.has(fallback);
    const column = found ?? (fallbackIsFree ? fallback : ABSENT_COLUMN);

    if (column !== ABSENT_COLUMN) taken.add(column);
    result[field] = column;
  }

  return result;
}

/* ---------------- sheet readers ---------------- */

const VARIATION_COLUMNS = {
  serial: { patterns: [/^s\.?\s*no/, /^#$/], fallback: 2 },
  voNumber: { patterns: [/vo\s*(number|no)/], fallback: 3 },
  aconexDate: { patterns: [/vo date/, /^raised$/], fallback: 4 },
  dvoReference: { patterns: [/^dvo reference$/], fallback: 5 },
  dvoRef: { patterns: [/^dvo ref\.?$/], fallback: 17 },
  subject: { patterns: [/^subject/], fallback: 6 },
  submissionDate: { patterns: [/^submission$/, /^submitted$/], fallback: 7 },
  submissionType: { patterns: [/submission type/, /^type$/], fallback: 8 },
  submissionRef: { patterns: [/submission ref/], fallback: 9 },
  responseRef: { patterns: [/response/], fallback: 10 },
  proposalValue: { patterns: [/cost proposal/], fallback: 12 },
  clientAssessment: {
    patterns: [/rsg assess?ment/, /employer assess?ment/, /assess?ment\s*\(/],
    fallback: 13,
  },
  agreedValue: { patterns: [/to summary/, /agreed value/], fallback: 14 },
  status: { patterns: [/^status$/], fallback: 15 },
  vorRef: { patterns: [/^vor/], fallback: 16 },
  contractorRemarks: { patterns: [/^r remarks/, /ffc remarks/, /contractor remarks/], fallback: 18 },
  clientRemarks: { patterns: [/rsg remarks/, /employer remarks/], fallback: 19 },
  aconexLink: { patterns: [/raw link/], fallback: 21 },
  submissionLink: { patterns: [/submission link/], fallback: 22 },
  owner: { patterns: [/done by/, /^owner$/], fallback: 26 },
} as const;

function readVariations(sheet: ExcelJS.Worksheet, warnings: string[]): ImportedVariation[] {
  const headerRow = findHeaderRow(sheet, [/vo\s*(number|no)/, /subject/]) ?? 10;
  const column = mapColumns(sheet, headerRow, VARIATION_COLUMNS);
  const rows: ImportedVariation[] = [];

  for (let r = headerRow + 1; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    // The S.No column is a shared formula (`=B11+1`) for all but the first row,
    // so read the cached result rather than the raw cell value.
    const serial = cellNumber(row.getCell(column.serial));
    if (serial === null) continue; // totals rows and free-text notes at the bottom

    const subject = cellText(row.getCell(column.subject));
    if (!subject) continue;

    rows.push({
      serial,
      voNumber: cellText(row.getCell(column.voNumber)),
      aconexDate: cellDate(row.getCell(column.aconexDate)),
      dvoReference: cellText(row.getCell(column.dvoReference)),
      subject,
      submissionDate: cellDate(row.getCell(column.submissionDate)),
      submissionType: normaliseSubmissionType(cellText(row.getCell(column.submissionType))),
      submissionRef: cellText(row.getCell(column.submissionRef)),
      responseRef: cellText(row.getCell(column.responseRef)),
      proposalValue: cellNumber(row.getCell(column.proposalValue)),
      clientAssessment: cellNumber(row.getCell(column.clientAssessment)),
      agreedValue: cellNumber(row.getCell(column.agreedValue)),
      status: normaliseVariationStatus(cellText(row.getCell(column.status))),
      vorRef: cellText(row.getCell(column.vorRef)),
      dvoRef: cellText(row.getCell(column.dvoRef)),
      contractorRemarks: cellText(row.getCell(column.contractorRemarks)),
      clientRemarks: cellText(row.getCell(column.clientRemarks)),
      aconexLink: hyperlink(row.getCell(column.aconexLink)),
      submissionLink: hyperlink(row.getCell(column.submissionLink)),
      owner: (() => {
        const owner = cellText(row.getCell(column.owner));
        return owner && owner.toLowerCase() !== 'finished' ? owner : null;
      })(),
    });
  }

  if (rows.length === 0) warnings.push('No variation rows were found on the VO log sheet.');
  return rows;
}

const PAYMENT_COLUMNS = {
  ref: { patterns: [/^no\.?$/, /^ref$/], fallback: 1 },
  period: { patterns: [/claim for month/, /claim period/, /^period$/], fallback: 2 },
  grossCertified: { patterns: [/gross certified/], fallback: 4 },
  advanceRecovery: { patterns: [/advance payment recovery/, /advance recovery/], fallback: 5 },
  backCharge: { patterns: [/back charge/], fallback: 6 },
  retention: { patterns: [/retention/], fallback: 7 },
  vatOnAdvanceRecovery: { patterns: [/vat (recovery for advance|on advance)/], fallback: 8 },
  vat: { patterns: [/^vat/], fallback: 9 },
  netCertified: { patterns: [/net payment certified/, /net certified/], fallback: 10 },
  received: { patterns: [/payment reci?ei?ved/, /^received$/], fallback: 11 },
  balanceDue: { patterns: [/balance due/], fallback: 12 },
  submittedDate: { patterns: [/submitted date/, /^submitted$/], fallback: 13 },
  taxInvoiceDate: { patterns: [/tax invoice/], fallback: 14 },
  dueDate: { patterns: [/due date/], fallback: 15 },
  paymentNote: { patterns: [/payment status/], fallback: 16 },
  status: { patterns: [/^status$/], fallback: 17 },
  collectedDate: { patterns: [/payment collected/, /^collected$/], fallback: 18 },
  contractorAction: { patterns: [/^remarks$/, /ffc live action/, /contractor action/], fallback: 19 },
  clientAction: { patterns: [/rsg live action/, /employer action/], fallback: 20 },
} as const;

function readPayments(sheet: ExcelJS.Worksheet, warnings: string[]): ImportedPayment[] {
  const headerRow = findHeaderRow(sheet, [/gross certified/, /net\s*(payment\s*)?certified/]) ?? 15;
  const column = mapColumns(sheet, headerRow, PAYMENT_COLUMNS);
  // The header is a merged two-row band, so the row below it reports the same
  // text again. Skip anything that still echoes the header labels.
  const headerRef = cellText(sheet.getRow(headerRow).getCell(column.ref));
  const headerPeriod = cellText(sheet.getRow(headerRow).getCell(column.period));

  const rows: ImportedPayment[] = [];
  let sequence = 0;

  for (let r = headerRow + 1; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    const ref = cellText(row.getCell(column.ref));
    if (!ref) continue;
    if (/^(grand\s*)?total/i.test(ref)) break;

    const period = cellText(row.getCell(column.period));
    if (ref === headerRef || (headerPeriod !== null && period === headerPeriod)) continue;

    const gross = cellNumber(row.getCell(column.grossCertified));
    const net = cellNumber(row.getCell(column.netCertified));
    // A real certificate always carries a period or a value.
    if (gross === null && net === null && !period) continue;

    const { start, end } = parsePeriod(period);
    sequence += 1;

    rows.push({
      sequence,
      ref,
      kind: /^ap/i.test(ref) ? 'advance' : 'interim',
      period,
      periodStart: start,
      periodEnd: end,
      grossCertified: gross ?? 0,
      advanceRecovery: cellNumber(row.getCell(column.advanceRecovery)) ?? 0,
      backCharge: cellNumber(row.getCell(column.backCharge)) ?? 0,
      retention: cellNumber(row.getCell(column.retention)) ?? 0,
      vatOnAdvanceRecovery: cellNumber(row.getCell(column.vatOnAdvanceRecovery)) ?? 0,
      vat: cellNumber(row.getCell(column.vat)) ?? 0,
      netCertified: net ?? 0,
      received: cellNumber(row.getCell(column.received)),
      submittedDate: cellDate(row.getCell(column.submittedDate)),
      taxInvoiceDate: cellDate(row.getCell(column.taxInvoiceDate)),
      dueDate: cellDate(row.getCell(column.dueDate)),
      paymentNote: cellText(row.getCell(column.paymentNote)),
      status: normalisePaymentStatus(cellText(row.getCell(column.status))),
      collectedDate: cellDate(row.getCell(column.collectedDate)),
      contractorAction: cellText(row.getCell(column.contractorAction)),
      clientAction: cellText(row.getCell(column.clientAction)),
    });
  }

  if (rows.length === 0) warnings.push('No payment certificates were found on the register sheet.');
  return rows;
}

/* ---------------- entry point ---------------- */

export async function readWorkbook(buffer: ArrayBuffer): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const warnings: string[] = [];

  const voSheet = findSheet(workbook, ['VO LOG (2)', 'VO Log', 'VO LOG', 'VO LOG (New)']);
  const paySheet = findSheet(workbook, ['Payment Register', 'Payment Reg']);

  if (!voSheet) warnings.push('No VO log sheet found — variations were left untouched.');
  if (!paySheet) warnings.push('No payment register sheet found — certificates were left untouched.');

  const variations = voSheet ? readVariations(voSheet, warnings) : [];
  const payments = paySheet ? readPayments(paySheet, warnings) : [];

  const project = paySheet
    ? {
        code: cellText(paySheet.getCell('B4')),
        contractor: cellText(paySheet.getCell('B5')),
        contractDate: cellDate(paySheet.getCell('B6')),
        originalContractValue: cellNumber(paySheet.getCell('D4')),
        revisedContractValue: cellNumber(paySheet.getCell('D5')),
        advancePaymentTotal: cellNumber(paySheet.getCell('H4')),
      }
    : {
        code: null,
        contractor: null,
        contractDate: null,
        originalContractValue: null,
        revisedContractValue: null,
        advancePaymentTotal: null,
      };

  return { variations, payments, project, warnings };
}
