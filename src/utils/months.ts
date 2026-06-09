import type { Expense } from "../types";

// ---- Configurable months range ----
export const RANGE_START_MONTH = "2026-06"; // "YYYY-MM"
export const RANGE_MIN_MONTHS = 6; // always show at least Jun-2026 through Nov-2026
// -----------------------------------

/** Adds `offset` months to a "YYYY-MM" string and returns another "YYYY-MM" string. */
export function addMonths(month: string, offset: number): string {
  const [year, mon] = month.split("-").map(Number);
  const totalMonths = year * 12 + (mon - 1) + offset;
  const newYear = Math.floor(totalMonths / 12);
  const newMon = (totalMonths % 12) + 1;
  return `${newYear}-${String(newMon).padStart(2, "0")}`;
}

/** Whole months from `from` to `to` ("YYYY-MM"), e.g. ("2026-07", "2026-08") → 1. */
export function monthDiff(from: string, to: string): number {
  const [fromYear, fromMon] = from.split("-").map(Number);
  const [toYear, toMon] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMon - fromMon);
}

/**
 * The list of visible months. Extends left to the earliest expense start
 * (past months render grayed out) and right until the last installment,
 * always covering at least RANGE_START_MONTH + RANGE_MIN_MONTHS.
 */
export function getMonthsRange(expenses: Expense[]): string[] {
  let start = RANGE_START_MONTH;
  for (const expense of expenses) {
    if (expense.startMonth < start) start = expense.startMonth;
  }

  let count = monthDiff(start, RANGE_START_MONTH) + RANGE_MIN_MONTHS;
  for (const expense of expenses) {
    const span = monthDiff(start, expense.startMonth) + expense.installments;
    count = Math.max(count, span);
  }
  return Array.from({ length: count }, (_, i) => addMonths(start, i));
}
