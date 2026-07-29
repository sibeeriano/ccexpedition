import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { formatMoney, formatMonthLabel } from "../utils/format";
import { useMoneyDisplay } from "../hooks/useMoneyDisplay";

type MonthlyBalanceCellProps = {
  month: string;
  monthArsTotal: number;
  monthUsdTotal: number;
  monthlyExpenseArs?: number;
  monthlyExpenseUsd?: number;
};

export function MonthlyBalanceCell({
  month,
  monthArsTotal,
  monthUsdTotal,
  monthlyExpenseArs = 0,
  monthlyExpenseUsd = 0,
}: MonthlyBalanceCellProps) {
  const { t } = useTranslation();
  const { state } = useApp();
  const { primaryTotal, resolve, convertUsdToArs, usdRate, toComparableArs } =
    useMoneyDisplay();
  const entry = state.settings.monthlyIncomeByMonth[month];
  const confirmed = entry?.confirmed === true;

  if (!confirmed || !entry) {
    return (
      <td className="px-2 py-2 text-right align-top text-sm text-zinc-600">—</td>
    );
  }

  const cardDebtPrimary = primaryTotal(monthArsTotal, monthUsdTotal);
  const monthlyExpensePrimary = primaryTotal(
    monthlyExpenseArs,
    monthlyExpenseUsd,
  );
  const debtAmount =
    convertUsdToArs && usdRate
      ? resolve(monthArsTotal, monthUsdTotal).combinedArs +
        resolve(monthlyExpenseArs, monthlyExpenseUsd).combinedArs
      : cardDebtPrimary.amount + monthlyExpensePrimary.amount;
  const incomeAmount =
    convertUsdToArs && usdRate
      ? toComparableArs(entry.amount, cardDebtPrimary.currency)
      : entry.amount;
  const balanceCurrency =
    convertUsdToArs && usdRate ? "ARS" : cardDebtPrimary.currency;
  const balance = Math.round((incomeAmount - debtAmount) * 100) / 100;

  return (
    <td className="px-2 py-2 text-right align-top">
      <span
        className={`font-mono text-money font-medium money-balance ${
          balance >= 0 ? "money-balance--positive" : "money-balance--negative"
        }`}
        aria-label={t("consolidated.balanceForMonth", {
          month: formatMonthLabel(month),
          balance: formatMoney(balance, balanceCurrency),
        })}
      >
        {formatMoney(balance, balanceCurrency)}
      </span>
    </td>
  );
}
