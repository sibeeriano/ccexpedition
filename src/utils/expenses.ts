import type { Expense, MonthlyEntry } from "../types";
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

/** Total ARS owed on a given card for a given month ("YYYY-MM"). */
export function getMonthlyTotalByCard(
  cardId: string,
  month: string,
  expenses: Expense[],
): number {
  const cardExpenses = expenses.filter((e) => e.cardId === cardId);
  const entries = getMonthlyBreakdown(cardExpenses).get(month) ?? [];
  return sumField(entries, "amount");
}

/** Total USD owed on a given card for a given month ("YYYY-MM"). */
export function getMonthlyTotalUsdByCard(
  cardId: string,
  month: string,
  expenses: Expense[],
): number {
  const cardExpenses = expenses.filter((e) => e.cardId === cardId);
  const entries = getMonthlyBreakdown(cardExpenses).get(month) ?? [];
  return sumField(entries, "amountUsd");
}
