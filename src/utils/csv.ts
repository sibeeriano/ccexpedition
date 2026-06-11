import i18n from "../i18n";
import type { Card, Expense } from "../types";
import { formatMonthLabel } from "./format";
import { getMonthlyBreakdown } from "./expenses";
import { getMonthsRange } from "./months";

/** Excel on es-AR / es-ES Windows expects semicolon as the list separator. */
function csvDelimiter(): string {
  return i18n.language === "es" ? ";" : ",";
}

function csvField(value: string | number, delimiter: string): string {
  const text = String(value);
  return /["\n\r]/.test(text) || text.includes(delimiter)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

/**
 * Builds a CSV with one row per expense:
 * Card | Holder | Description | Total ARS | Total USD | Installments | [month ARS columns]
 */
export function buildExpensesCsv(cards: Card[], expenses: Expense[]): string {
  const delimiter = csvDelimiter();
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

  const body = [header, ...rows]
    .map((row) => row.map((cell) => csvField(cell, delimiter)).join(delimiter))
    .join("\r\n");

  // Helps Excel pick the delimiter on Windows regardless of regional settings.
  return `sep=${delimiter}\r\n${body}`;
}

const UTF8_BOM = "\uFEFF";

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([UTF8_BOM + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
