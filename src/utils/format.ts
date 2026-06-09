import type { CurrencySymbol } from "../types";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-06" → "Jun 26" */
export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return `${MONTH_LABELS[mon - 1]} ${String(year).slice(2)}`;
}

/** 1234.5 → "$1,234.50" / "€1,234.50" / "ARS 1,234.50" */
export function formatMoney(
  amount: number,
  symbol: CurrencySymbol = "$",
): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return symbol === "ARS" ? `ARS ${formatted}` : `${symbol}${formatted}`;
}

/** Current month as "YYYY-MM". */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** ISO timestamp → "Jun 9, 2026, 4:25 PM" */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
