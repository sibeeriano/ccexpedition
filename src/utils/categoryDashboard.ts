import type { Card, Expense, ExpenseCategory } from "../types";
import { primaryMonthTotal } from "./format";
import { getMonthlyBreakdown } from "./expenses";

export const UNCATEGORIZED_KEY = "__uncategorized__";

export type CategoryExpenseLine = {
  expenseId: string;
  description: string;
  cardName: string;
  ars: number;
  usd: number;
};

export type CategoryMonthSummary = {
  categoryKey: string;
  categoryName: string;
  ars: number;
  usd: number;
  chartValue: number;
  share: number;
  expenses: CategoryExpenseLine[];
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function categoryNameFor(
  categoryId: string | null,
  categories: ExpenseCategory[],
  uncategorizedLabel: string,
): { key: string; name: string } {
  if (!categoryId) {
    return { key: UNCATEGORIZED_KEY, name: uncategorizedLabel };
  }
  const category = categories.find((item) => item.id === categoryId);
  return {
    key: categoryId,
    name: category?.name ?? uncategorizedLabel,
  };
}

/** Agrupa el monto mensual de cada gasto por categoría para un mes dado. */
export function getCategoryBreakdownForMonth(
  month: string,
  expenses: Expense[],
  categories: ExpenseCategory[],
  cards: Card[],
  uncategorizedLabel: string,
): CategoryMonthSummary[] {
  const expenseById = new Map(expenses.map((expense) => [expense.id, expense]));
  const cardById = new Map(cards.map((card) => [card.id, card.name]));
  const entries = getMonthlyBreakdown(expenses).get(month) ?? [];

  const buckets = new Map<
    string,
    { name: string; ars: number; usd: number; expenses: CategoryExpenseLine[] }
  >();

  for (const entry of entries) {
    const expense = expenseById.get(entry.expenseId);
    if (!expense) continue;

    const { key, name } = categoryNameFor(
      expense.categoryId,
      categories,
      uncategorizedLabel,
    );
    const bucket = buckets.get(key) ?? {
      name,
      ars: 0,
      usd: 0,
      expenses: [],
    };

    bucket.ars = round2(bucket.ars + entry.amount);
    bucket.usd = round2(bucket.usd + entry.amountUsd);
    bucket.expenses.push({
      expenseId: expense.id,
      description: expense.description,
      cardName: cardById.get(expense.cardId) ?? "—",
      ars: entry.amount,
      usd: entry.amountUsd,
    });
    buckets.set(key, bucket);
  }

  const summaries = [...buckets.entries()].map(([categoryKey, bucket]) => {
    const chartValue = primaryMonthTotal(bucket.ars, bucket.usd).amount;
    return {
      categoryKey,
      categoryName: bucket.name,
      ars: bucket.ars,
      usd: bucket.usd,
      chartValue,
      share: 0,
      expenses: bucket.expenses.sort((a, b) => {
        const aPrimary = primaryMonthTotal(a.ars, a.usd).amount;
        const bPrimary = primaryMonthTotal(b.ars, b.usd).amount;
        return bPrimary - aPrimary;
      }),
    };
  });

  const chartTotal = round2(
    summaries.reduce((sum, item) => sum + item.chartValue, 0),
  );

  return summaries
    .map((item) => ({
      ...item,
      share: chartTotal > 0 ? item.chartValue / chartTotal : 0,
    }))
    .sort((a, b) => b.chartValue - a.chartValue);
}

export function monthHasExpenseData(
  month: string,
  expenses: Expense[],
): boolean {
  return (getMonthlyBreakdown(expenses).get(month)?.length ?? 0) > 0;
}

export type MonthAmountTotals = {
  ars: number;
  usd: number;
};

/** Suma del mes separada por cuotas (installments > 1) y pago único. */
export function getMonthTotalsByPaymentType(
  month: string,
  expenses: Expense[],
): { total: MonthAmountTotals; installments: MonthAmountTotals; oneTime: MonthAmountTotals } {
  const expenseById = new Map(expenses.map((expense) => [expense.id, expense]));
  const entries = getMonthlyBreakdown(expenses).get(month) ?? [];

  const total = { ars: 0, usd: 0 };
  const installments = { ars: 0, usd: 0 };
  const oneTime = { ars: 0, usd: 0 };

  for (const entry of entries) {
    const expense = expenseById.get(entry.expenseId);
    if (!expense) continue;

    total.ars = round2(total.ars + entry.amount);
    total.usd = round2(total.usd + entry.amountUsd);

    const bucket = expense.installments > 1 ? installments : oneTime;
    bucket.ars = round2(bucket.ars + entry.amount);
    bucket.usd = round2(bucket.usd + entry.amountUsd);
  }

  return { total, installments, oneTime };
}
