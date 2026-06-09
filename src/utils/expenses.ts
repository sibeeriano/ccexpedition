import type { Expense, MonthlyEntry } from "../types";
import { addMonths } from "./months";

/** Rounds to 2 decimals to avoid floating point artifacts. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Spreads each expense across its installment months.
 * Returns a Map keyed by month ("YYYY-MM") with all entries falling in that month.
 *
 * The last installment absorbs any rounding remainder so the entries
 * always add up exactly to the expense's totalAmount.
 */
export function getMonthlyBreakdown(
  expenses: Expense[],
): Map<string, MonthlyEntry[]> {
  const breakdown = new Map<string, MonthlyEntry[]>();

  for (const expense of expenses) {
    const installments = Math.max(1, Math.floor(expense.installments));
    const baseAmount = round2(expense.totalAmount / installments);
    const lastAmount = round2(
      expense.totalAmount - baseAmount * (installments - 1),
    );

    for (let i = 0; i < installments; i++) {
      const month = addMonths(expense.startMonth, i);
      const entry: MonthlyEntry = {
        expenseId: expense.id,
        month,
        amount: i === installments - 1 ? lastAmount : baseAmount,
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

/** Total owed on a given card for a given month ("YYYY-MM"). */
export function getMonthlyTotalByCard(
  cardId: string,
  month: string,
  expenses: Expense[],
): number {
  const cardExpenses = expenses.filter((e) => e.cardId === cardId);
  const entries = getMonthlyBreakdown(cardExpenses).get(month) ?? [];
  return round2(entries.reduce((sum, entry) => sum + entry.amount, 0));
}
