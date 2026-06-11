import type {
  BalanceAdjustment,
  Expense,
  MonthlyEntry,
  PendingCarryover,
} from "../types";
import { addMonths } from "./months";

/** Rounds to 2 decimals to avoid floating point artifacts. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function spreadTotal(
  total: number,
  installments: number,
): { base: number; last: number } {
  const count = Math.max(1, Math.floor(installments));
  const base = round2(total / count);
  const last = round2(total - base * (count - 1));
  return { base, last };
}

/**
 * Spreads each expense across its installment months.
 * Returns a Map keyed by month ("YYYY-MM") with all entries falling in that month.
 */
export function getMonthlyBreakdown(
  expenses: Expense[],
): Map<string, MonthlyEntry[]> {
  const breakdown = new Map<string, MonthlyEntry[]>();

  for (const expense of expenses) {
    const installments = Math.max(1, Math.floor(expense.installments));
    const ars = spreadTotal(expense.totalAmount, installments);
    const usd = spreadTotal(expense.totalAmountUsd, installments);

    for (let i = 0; i < installments; i++) {
      const month = addMonths(expense.startMonth, i);
      const entry: MonthlyEntry = {
        expenseId: expense.id,
        month,
        amount: i === installments - 1 ? ars.last : ars.base,
        amountUsd: i === installments - 1 ? usd.last : usd.base,
      };

      const entries = breakdown.get(month);
      if (entries) {
        entries.push(entry);
      } else {
        breakdown.set(month, [entry]);
      }
    }
  }

  return breakdown;
}

function sumField(
  entries: MonthlyEntry[],
  field: "amount" | "amountUsd",
): number {
  return round2(entries.reduce((sum, entry) => sum + entry[field], 0));
}

/** Per-month amount for an expense. */
export function getExpenseMonthlyRate(expense: Expense): {
  ars: number;
  usd: number;
} {
  const installments = Math.max(1, Math.floor(expense.installments));
  const ars = spreadTotal(expense.totalAmount, installments);
  const usd = spreadTotal(expense.totalAmountUsd, installments);
  return { ars: ars.base, usd: usd.base };
}

/** Last month an expense is charged ("YYYY-MM"). */
export function getExpenseEndMonth(expense: Expense): string {
  return addMonths(
    expense.startMonth,
    Math.max(1, Math.floor(expense.installments)) - 1,
  );
}

export function getAdjustmentsForCardMonth(
  cardId: string,
  month: string,
  adjustments: BalanceAdjustment[],
): BalanceAdjustment[] {
  return adjustments.filter(
    (adjustment) =>
      adjustment.cardId === cardId && adjustment.applyMonth === month,
  );
}

function sumAdjustments(
  adjustments: BalanceAdjustment[],
  field: "amount" | "amountUsd",
): number {
  const key = field === "amount" ? "amount" : "amountUsd";
  return round2(adjustments.reduce((sum, adjustment) => sum + adjustment[key], 0));
}

export function getCarryoverForCardMonth(
  cardId: string,
  month: string,
  carryovers: PendingCarryover[],
): PendingCarryover | null {
  return (
    carryovers.find(
      (carryover) =>
        carryover.cardId === cardId && carryover.applyMonth === month,
    ) ?? null
  );
}

function sumCarryover(
  carryover: PendingCarryover | null,
  field: "amount" | "amountUsd",
): number {
  if (!carryover) return 0;
  return carryover[field];
}

/** Total ARS owed on a given card for a given month ("YYYY-MM"), net of credits. */
export function getMonthlyTotalByCard(
  cardId: string,
  month: string,
  expenses: Expense[],
  adjustments: BalanceAdjustment[] = [],
  carryovers: PendingCarryover[] = [],
): number {
  const cardExpenses = expenses.filter((e) => e.cardId === cardId);
  const entries = getMonthlyBreakdown(cardExpenses).get(month) ?? [];
  const expenseTotal = sumField(entries, "amount");
  const creditTotal = sumAdjustments(
    getAdjustmentsForCardMonth(cardId, month, adjustments),
    "amount",
  );
  const carryoverTotal = sumCarryover(
    getCarryoverForCardMonth(cardId, month, carryovers),
    "amount",
  );
  return round2(expenseTotal - creditTotal + carryoverTotal);
}

/** Total USD owed on a given card for a given month ("YYYY-MM"), net of credits. */
export function getMonthlyTotalUsdByCard(
  cardId: string,
  month: string,
  expenses: Expense[],
  adjustments: BalanceAdjustment[] = [],
  carryovers: PendingCarryover[] = [],
): number {
  const cardExpenses = expenses.filter((e) => e.cardId === cardId);
  const entries = getMonthlyBreakdown(cardExpenses).get(month) ?? [];
  const expenseTotal = sumField(entries, "amountUsd");
  const creditTotal = sumAdjustments(
    getAdjustmentsForCardMonth(cardId, month, adjustments),
    "amountUsd",
  );
  const carryoverTotal = sumCarryover(
    getCarryoverForCardMonth(cardId, month, carryovers),
    "amountUsd",
  );
  return round2(expenseTotal - creditTotal + carryoverTotal);
}

/** Amount due before payment (expenses - credits + carryover). */
export function getMonthlyDueByCard(
  cardId: string,
  month: string,
  expenses: Expense[],
  adjustments: BalanceAdjustment[] = [],
  carryovers: PendingCarryover[] = [],
): { ars: number; usd: number } {
  return {
    ars: getMonthlyTotalByCard(
      cardId,
      month,
      expenses,
      adjustments,
      carryovers,
    ),
    usd: getMonthlyTotalUsdByCard(
      cardId,
      month,
      expenses,
      adjustments,
      carryovers,
    ),
  };
}
