import type { CurrencySymbol } from "../types";
import i18n from "../i18n";

const MONTH_LABELS: Record<"en" | "es", string[]> = {
  en: [
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
  ],
  es: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
};

function currentLocale(): "en" | "es" {
  return i18n.language === "es" ? "es" : "en";
}

/** "2026-06" → "Jun 26" / "Jun 26" */
export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  const labels = MONTH_LABELS[currentLocale()];
  return `${labels[mon - 1]} ${String(year).slice(2)}`;
}

/** 1234.5 → "$1,234.50" / "€1,234.50" / "ARS 1,234.50" */
export function formatMoney(
  amount: number,
  symbol: CurrencySymbol = "$",
): string {
  const locale = currentLocale() === "es" ? "es-AR" : "en-US";
  const formatted = amount.toLocaleString(locale, {
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

/** ISO timestamp → localized date/time */
export function formatTimestamp(iso: string): string {
  const locale = currentLocale() === "es" ? "es-AR" : "en-US";
  return new Date(iso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
