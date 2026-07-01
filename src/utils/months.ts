import type { BalanceAdjustment, Expense, PendingCarryover } from "../types";
import { getCurrentMonth } from "./format";

export const EXPENSE_START_MONTH_LOOKBACK = 24;

/** Months offered when picking a start/apply month in expense modals. */
export function getExpenseStartMonthOptions(
  expenses: Expense[],
  adjustments: BalanceAdjustment[] = [],
  carryovers: PendingCarryover[] = [],
): string[] {
  const currentMonth = getCurrentMonth();
  const visibleRange = getMonthsRange(expenses, adjustments, carryovers);
  const firstOption = addMonths(currentMonth, -EXPENSE_START_MONTH_LOOKBACK);
  const lastOption =
    visibleRange[visibleRange.length - 1] > currentMonth
      ? visibleRange[visibleRange.length - 1]
      : currentMonth;
  return Array.from(
    { length: monthDiff(firstOption, lastOption) + 1 },
    (_, i) => addMonths(firstOption, i),
  );
}

// ---- Configurable months range ----
export const RANGE_START_MONTH = "2026-06"; // "YYYY-MM"
export const RANGE_MIN_MONTHS = 6; // always show at least Jun-2026 through Nov-2026
// -----------------------------------

/** True when `month` is strictly before today's calendar month ("YYYY-MM"). */
export function isBeforeCurrentMonth(month: string): boolean {
  return month < getCurrentMonth();
}

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
export function getMonthsRange(
  expenses: Expense[],
  adjustments: BalanceAdjustment[] = [],
  carryovers: PendingCarryover[] = [],
): string[] {
  let start = RANGE_START_MONTH;
  for (const expense of expenses) {
    if (expense.startMonth < start) start = expense.startMonth;
  }
  for (const adjustment of adjustments) {
    if (adjustment.applyMonth < start) start = adjustment.applyMonth;
  }
  for (const carryover of carryovers) {
    if (carryover.applyMonth < start) start = carryover.applyMonth;
  }

  let count = monthDiff(start, RANGE_START_MONTH) + RANGE_MIN_MONTHS;
  for (const expense of expenses) {
    const span = monthDiff(start, expense.startMonth) + expense.installments;
    count = Math.max(count, span);
  }
  for (const adjustment of adjustments) {
    const span = monthDiff(start, adjustment.applyMonth) + 1;
    count = Math.max(count, span);
  }
  for (const carryover of carryovers) {
    const span = monthDiff(start, carryover.applyMonth) + 1;
    count = Math.max(count, span);
  }
  return Array.from({ length: count }, (_, i) => addMonths(start, i));
}

/** Hides months before today's calendar month when `showPreviousMonths` is false. */
export function filterMonthsForDisplay(
  months: string[],
  showPreviousMonths: boolean,
): string[] {
  if (showPreviousMonths) return months;
  const currentMonth = getCurrentMonth();
  return months.filter((month) => month >= currentMonth);
}
