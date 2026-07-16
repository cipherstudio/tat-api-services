import * as ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface BuildExcelOptions {
  titleRow?: string;
}

export async function buildExcelBuffer(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, unknown>[],
  options?: BuildExcelOptions,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  let currentRow = 1;

  if (options?.titleRow) {
    sheet.getRow(currentRow).getCell(1).value = options.titleRow;
    sheet.mergeCells(currentRow, 1, currentRow, columns.length);
    sheet.getRow(currentRow).font = { bold: true };
    currentRow++;
  }

  const headerRow = sheet.getRow(currentRow);
  columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
    sheet.getColumn(index + 1).key = col.key;
    sheet.getColumn(index + 1).width = col.width ?? 20;
  });
  headerRow.font = { bold: true };
  currentRow++;

  rows.forEach((row) => {
    const dataRow = sheet.getRow(currentRow);
    columns.forEach((col, index) => {
      dataRow.getCell(index + 1).value = row[col.key] as ExcelJS.CellValue;
    });
    currentRow++;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// Thai Buddhist-era date (วัน-เดือน-ปี) for use in export filenames.
export function thaiDateFilenamePart(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543;
  return `${day}-${month}-${year}`;
}

// Resolve a plain province/country name out of a free-text destination
// string (often an office name like "ททท. สำนักงานเชียงใหม่" or
// "ททท. สำนักงานกัวลาลัมเปอร์, ประเทศมาเลเซีย"), without relying on the
// destination_id FK (unreliable - see repository comment).
export function resolveDestinationName(
  rawDestination: string | null | undefined,
  provinceNames: string[],
  countryNames: string[],
  officeLookup: { officeName: string; resolvedName: string }[] = [],
): string {
  if (!rawDestination) return '-';

  // Best signal: the office name is backed by a real FK to province/country
  // (office_domestic.province_id, office_international.country_id), unlike
  // destination_id. Match the longest office name that the text starts with.
  const officeMatch = [...officeLookup]
    .sort((a, b) => b.officeName.length - a.officeName.length)
    .find((o) => rawDestination.startsWith(o.officeName));
  if (officeMatch) return officeMatch.resolvedName;

  // "ที่ตั้ง, ประเทศ/จังหวัด" - the part after the last comma is usually
  // already a clean province/country name.
  const afterLastComma = rawDestination.includes(',')
    ? rawDestination.split(',').pop()!.trim()
    : null;
  if (afterLastComma) {
    const stripped = afterLastComma.replace(/^ประเทศ/, '').trim();
    const match = [...countryNames, ...provinceNames].find(
      (name) => name === afterLastComma || name === stripped,
    );
    if (match) return match;
  }

  // Otherwise search for a known province/country name as a substring of
  // the raw text (longest name first, to avoid short-name false positives).
  const candidates = [...countryNames, ...provinceNames].sort(
    (a, b) => b.length - a.length,
  );
  const found = candidates.find((name) => rawDestination.includes(name));
  if (found) return found;

  return rawDestination;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

// "12 มิถุนายน 2569" from a Date/ISO-string/anything `new Date()` accepts.
export function formatThaiDate(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

// "06-07-2569" (numeric วัน-เดือน-ปี, พ.ศ.) for use as Excel cell values -
// distinct from formatThaiDate's spelled-out month, for report exports that
// need a consistent numeric date column.
export function formatThaiDateNumeric(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543;
  return `${day}-${month}-${year}`;
}

// "06-07-2569 10:24:57" - formatThaiDateNumeric plus HH:mm:ss, for exports
// where the time of day matters (e.g. login history) and a date-only column
// would hide a same-day ordering/timing issue.
export function formatThaiDateTimeNumeric(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  const datePart = formatThaiDateNumeric(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

// "14,350.00" / "0.00" - 2 decimals with thousands separator, for Excel
// currency/amount columns.
export function formatThaiCurrency(value: unknown): string {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Inclusive day count between two YYYY-MM-DD (or parseable) date strings.
export function inclusiveDayCount(
  startDate?: string | null,
  endDate?: string | null,
): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}
