import * as XLSX from "xlsx";
import { getCurrentMonth } from "./format";
import { addMonths } from "./months";

export type ParsedImportRow = {
  rowIndex: number;
  description: string;
  cardholder: string;
  totalAmount: number;
  totalAmountUsd: number;
  installments: number;
  startMonth: string;
  isOneTime: boolean;
};

export type ParseResult = {
  rows: ParsedImportRow[];
  errors: string[];
  skipped: number;
  format: "bank" | "tracker" | null;
};

function serialToMonth(serial: number): string | null {
  const d = XLSX.SSF.parse_date_code(Math.floor(serial));
  if (!d) return null;
  return `${d.y}-${String(d.m).padStart(2, "0")}`;
}

/** Parses "43.707,66" or plain numbers. */
function parseAmount(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  const s = String(value).trim();
  if (!s) return null;
  const normalized = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : s;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cleanDescription(raw: string): string {
  return raw.replace(/^\*+\s*/u, "").trim();
}

/** REFERENCIA may span columns B–D when the bank splits long merchant names. */
function getDescription(row: unknown[]): string | null {
  const parts = [row[1], row[2], row[3]]
    .map((cell) => String(cell ?? "").trim())
    .filter((cell) => cell && !cell.includes("Total Consumos"));

  if (parts.length === 0) return null;

  const description = parts
    .map(cleanDescription)
    .filter(Boolean)
    .join(" ");

  return description || null;
}

function isBankHeader(row: unknown[]): boolean {
  const headers = row.map((c) => String(c).toUpperCase().trim());
  return (
    headers.includes("FECHA") &&
    headers.includes("REFERENCIA") &&
    headers.some((h) => h.includes("CUOTA"))
  );
}

function isTrackerHeader(row: unknown[]): boolean {
  return String(row[0]).toLowerCase() === "description";
}

export type BankImportMode = "statement" | "purchases";

/**
 * Bank statement format:
 * - purchases: FECHA = installment 1 start, CUOTA = "current/total", PESOS = monthly amount.
 * - statement: all rows belong to one billing month; CUOTA N/M means payment N of M this month.
 */
function parseBankSheet(
  data: unknown[][],
  defaultStartMonth: string,
  statementMonth: string | null,
): ParseResult {
  const rows: ParsedImportRow[] = [];
  const errors: string[] = [];
  let skipped = 0;
  const isStatement = statementMonth !== null;

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const description = getDescription(row);
    if (!description) {
      skipped++;
      continue;
    }

    const monthlyPesos = parseAmount(row[5]);
    const monthlyUsd = parseAmount(row[6]);
    if (!monthlyPesos && !monthlyUsd) {
      skipped++;
      continue;
    }

    const cuota = String(row[4] ?? "").trim();
    const match = cuota.match(/^(\d+)\/(\d+)$/);

    if (!match) {
      const fecha = row[0];
      const startMonth = isStatement
        ? statementMonth!
        : typeof fecha === "number"
          ? (serialToMonth(fecha) ?? defaultStartMonth)
          : defaultStartMonth;

      rows.push({
        rowIndex: r + 1,
        description,
        cardholder: "",
        totalAmount: monthlyPesos ?? 0,
        totalAmountUsd: monthlyUsd ?? 0,
        installments: 1,
        startMonth,
        isOneTime: true,
      });
      continue;
    }

    const currentInstallment = Number.parseInt(match[1], 10);
    const installments = Number.parseInt(match[2], 10);
    const fecha = row[0];
    const startMonth = isStatement
      ? addMonths(statementMonth!, -(currentInstallment - 1))
      : typeof fecha === "number"
        ? (serialToMonth(fecha) ?? defaultStartMonth)
        : defaultStartMonth;

    rows.push({
      rowIndex: r + 1,
      description,
      cardholder: "",
      totalAmount: monthlyPesos ? round2(monthlyPesos * installments) : 0,
      totalAmountUsd: monthlyUsd ? round2(monthlyUsd * installments) : 0,
      installments,
      startMonth,
      isOneTime: installments === 1,
    });
  }

  return { rows, errors, skipped, format: "bank" };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Card Tracker export format ("Expenses by Month" sheet). */
function parseTrackerSheet(
  data: unknown[][],
  defaultStartMonth: string,
): ParseResult {
  const headers = data[1];
  const monthColumns: { index: number; month: string }[] = [];
  for (let i = 5; i < headers.length; i++) {
    const header = headers[i];
    if (typeof header === "number") {
      const month = serialToMonth(header);
      if (month) monthColumns.push({ index: i, month });
    }
  }

  const rows: ParsedImportRow[] = [];
  const errors: string[] = [];
  let skipped = 0;

  for (let r = 2; r < data.length; r++) {
    const row = data[r];
    const description = String(row[0] ?? "").trim();
    if (!description) continue;

    const cardholder = String(row[1] ?? "").trim();
    const totalAmount = parseAmount(row[2]) ?? 0;
    const oneTimeValue = row[4];
    const isOneTime =
      oneTimeValue !== "" &&
      oneTimeValue !== 0 &&
      typeof oneTimeValue === "number";

    if (!totalAmount && !isOneTime) {
      skipped++;
      continue;
    }

    if (isOneTime) {
      rows.push({
        rowIndex: r + 1,
        description,
        cardholder,
        totalAmount,
        totalAmountUsd: 0,
        installments: 1,
        startMonth: defaultStartMonth,
        isOneTime: true,
      });
      continue;
    }

    const monthAmounts = monthColumns
      .map(({ index, month }) => ({
        month,
        amount: parseAmount(row[index]),
      }))
      .filter((m): m is { month: string; amount: number } => m.amount !== null);

    if (monthAmounts.length === 0) {
      errors.push(`Row ${r + 1} (${description}): no monthly amounts found.`);
      skipped++;
      continue;
    }

    const startMonth = monthAmounts[0].month;
    const monthlyAmount = monthAmounts[0].amount;
    const installments = Math.max(1, Math.round(totalAmount / monthlyAmount));

    rows.push({
      rowIndex: r + 1,
      description,
      cardholder,
      totalAmount,
      totalAmountUsd: 0,
      installments,
      startMonth,
      isOneTime: false,
    });
  }

  return { rows, errors, skipped, format: "tracker" };
}

export type ParseExpensesOptions = {
  defaultStartMonth?: string;
  /** When set, bank rows are treated as a single monthly statement. */
  statementMonth?: string | null;
  bankImportMode?: BankImportMode;
};

export function parseExpensesXlsx(
  file: ArrayBuffer,
  options: ParseExpensesOptions = {},
): ParseResult {
  const {
    defaultStartMonth = getCurrentMonth(),
    bankImportMode = "statement",
    statementMonth: statementMonthOption,
  } = options;
  const statementMonth =
    bankImportMode === "statement"
      ? (statementMonthOption ?? defaultStartMonth)
      : null;
  const workbook = XLSX.read(file, { type: "array" });
  const sheetName =
    workbook.SheetNames.find((n) => n === "Expenses by Month") ??
    workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return {
      rows: [],
      errors: ["No readable sheet found in this file."],
      skipped: 0,
      format: null,
    };
  }

  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];

  if (data.length < 2) {
    return { rows: [], errors: ["The sheet is empty."], skipped: 0, format: null };
  }

  if (isBankHeader(data[0])) {
    return parseBankSheet(data, defaultStartMonth, statementMonth);
  }
  if (isTrackerHeader(data[1])) {
    return parseTrackerSheet(data, defaultStartMonth);
  }

  return {
    rows: [],
    errors: [
      "Unrecognized format. Expected a bank statement (FECHA, REFERENCIA, CUOTA) or Card Tracker export.",
    ],
    skipped: 0,
    format: null,
  };
}
