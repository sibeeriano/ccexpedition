import { useApp } from "../context/AppContext";
import {
  comparableArsAmount,
  effectivePrimaryMonthTotal,
  resolveMoneyTotals,
  type ResolvedMoneyTotals,
} from "../utils/moneyTotals";

export function useMoneyDisplay() {
  const { state, usdExchange } = useApp();
  const convertUsdToArs =
    state.settings.convertUsdToArs && usdExchange.rate !== null;
  const usdRate = usdExchange.rate;

  function resolve(ars: number, usd: number): ResolvedMoneyTotals {
    return resolveMoneyTotals({
      ars,
      usd,
      convertUsdToArs,
      usdRate,
    });
  }

  function primaryTotal(ars: number, usd: number) {
    return effectivePrimaryMonthTotal(ars, usd, {
      convertUsdToArs,
      usdRate,
    });
  }

  function toComparableArs(amount: number, currency: "$" | "€" | "ARS") {
    return comparableArsAmount(amount, currency, usdRate);
  }

  return {
    convertUsdToArs,
    usdRate,
    usdRateCompra: usdExchange.compra,
    usdExchangeCasa: usdExchange.casa,
    usdRateDate: usdExchange.fecha,
    usdRateLoading: usdExchange.loading,
    usdRateError: usdExchange.error,
    resolve,
    primaryTotal,
    toComparableArs,
  };
}
