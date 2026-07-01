import type { CurrencySymbol } from "../types";
import { primaryMonthTotal } from "./format";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export type MoneyTotalsInput = {
  ars: number;
  usd: number;
  convertUsdToArs: boolean;
  usdRate: number | null;
};

export type ResolvedMoneyTotals = {
  ars: number;
  usd: number;
  convertedUsdToArs: number;
  combinedArs: number;
};

/** ARS total including USD converted at the daily rate when enabled. */
export function resolveMoneyTotals(input: MoneyTotalsInput): ResolvedMoneyTotals {
  const { ars, usd, convertUsdToArs, usdRate } = input;
  const convertedUsdToArs =
    convertUsdToArs && usdRate && usdRate > 0 && usd !== 0
      ? round2(usd * usdRate)
      : 0;

  return {
    ars,
    usd,
    convertedUsdToArs,
    combinedArs: round2(ars + convertedUsdToArs),
  };
}

/** Debt/income comparison amount for balance rows when USD→ARS conversion is on. */
export function comparableArsAmount(
  amount: number,
  currency: CurrencySymbol,
  usdRate: number | null,
): number {
  if (currency === "ARS") return amount;
  if (currency === "$" && usdRate && usdRate > 0) {
    return round2(amount * usdRate);
  }
  return amount;
}

export function effectivePrimaryMonthTotal(
  ars: number,
  usd: number,
  options: Pick<MoneyTotalsInput, "convertUsdToArs" | "usdRate">,
): { amount: number; currency: CurrencySymbol } {
  const resolved = resolveMoneyTotals({ ars, usd, ...options });
  if (options.convertUsdToArs && options.usdRate && options.usdRate > 0) {
    if (resolved.combinedArs !== 0 || usd !== 0 || ars !== 0) {
      return { amount: resolved.combinedArs, currency: "ARS" };
    }
  }
  return primaryMonthTotal(ars, usd);
}
