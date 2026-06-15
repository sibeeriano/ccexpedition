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

function formatFullMonthName(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(year, month - 1, 1),
  );
}

function joinNaturalList(items: string[], locale: "en" | "es"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) {
    return locale === "es"
      ? `${items[0]} y ${items[1]}`
      : `${items[0]} and ${items[1]}`;
  }
  const last = items.at(-1)!;
  const rest = items.slice(0, -1).join(", ");
  return locale === "es" ? `${rest} y ${last}` : `${rest} and ${last}`;
}

/** ["2026-05","2026-06","2026-07"] → "mayo, junio y julio de 2026" */
export function formatMonthList(months: string[]): string {
  if (months.length === 0) return "";

  const locale = currentLocale();
  const intlLocale = locale === "es" ? "es-AR" : "en-US";
  const sorted = [...months].sort();

  const byYear = new Map<number, number[]>();
  for (const month of sorted) {
    const [year, mon] = month.split("-").map(Number);
    const bucket = byYear.get(year) ?? [];
    bucket.push(mon);
    byYear.set(year, bucket);
  }

  const yearPhrases = [...byYear.entries()].map(([year, monthNumbers]) => {
    const names = monthNumbers.map((mon) => {
      const name = formatFullMonthName(year, mon, intlLocale);
      return locale === "es" ? name.toLowerCase() : name;
    });
    const joined = joinNaturalList(names, locale);
    return locale === "es" ? `${joined} de ${year}` : `${joined} ${year}`;
  });

  return joinNaturalList(yearPhrases, locale);
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

/** ARS primero si hay monto en pesos; si no, USD (como AmountDisplay). */
export function primaryMonthTotal(
  ars: number,
  usd: number,
): { amount: number; currency: CurrencySymbol } {
  if (ars !== 0) return { amount: ars, currency: "ARS" };
  if (usd !== 0) return { amount: usd, currency: "$" };
  return { amount: 0, currency: "ARS" };
}

/** ISO timestamp → localized date/time */
export function formatTimestamp(iso: string): string {
  const locale = currentLocale() === "es" ? "es-AR" : "en-US";
  return new Date(iso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
