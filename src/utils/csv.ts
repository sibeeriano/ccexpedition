import type { Card, Expense } from "../types";
import { getMonthlyBreakdown } from "./expenses";
import { getMonthsRange } from "./months";
import { formatMonthLabel } from "./format";

function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Builds a CSV with one row per expense:
 * Card | Holder | Description | Total ARS | Total USD | Installments | [month ARS columns]
 */
export function buildExpensesCsv(cards: Card[], expenses: Expense[]): string {
  const monthsRange = getMonthsRange(expenses);
  const header = [
    "Card",
    "Holder",
    "Description",
    "Total ARS",
    "Total USD",
    "Installments",
    ...monthsRange.map((m) => `${formatMonthLabel(m)} ARS`),
    ...monthsRange.map((m) => `${formatMonthLabel(m)} USD`),
  ];

  const rows = expenses.map((expense) => {
    const card = cards.find((c) => c.id === expense.cardId);
    const byMonth = getMonthlyBreakdown([expense]);
    const monthArs = monthsRange.map(
      (month) => byMonth.get(month)?.[0]?.amount ?? "",
    );
    const monthUsd = monthsRange.map(
      (month) => byMonth.get(month)?.[0]?.amountUsd ?? "",
    );
    return [
      card?.name ?? "Unknown",
      card?.holder ?? "",
      expense.description,
      expense.totalAmount,
      expense.totalAmountUsd,
      expense.installments,
      ...monthArs,
      ...monthUsd,
    ];
  });

  return [header, ...rows]
    .map((row) => row.map(csvField).join(","))
    .join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
