import { useTranslation } from "react-i18next";
import type { CurrencySymbol } from "../types";
import { useApp } from "../context/AppContext";
import { formatMoney, formatMonthLabel } from "../utils/format";

type MonthlyBalanceCellProps = {
  month: string;
  monthTotal: number;
  currency: CurrencySymbol;
};

export function MonthlyBalanceCell({
  month,
  monthTotal,
  currency,
}: MonthlyBalanceCellProps) {
  const { t } = useTranslation();
  const { state } = useApp();
  const entry = state.settings.monthlyIncomeByMonth[month];
  const confirmed = entry?.confirmed === true;

  if (!confirmed || !entry) {
    return (
      <td className="px-2 py-2 text-right align-top text-sm text-zinc-600">—</td>
    );
  }

  const balance = Math.round((entry.amount - monthTotal) * 100) / 100;

  return (
    <td className="px-2 py-2 text-right align-top">
      <span
        className={`font-mono text-sm font-medium ${
          balance >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
        aria-label={t("consolidated.balanceForMonth", {
          month: formatMonthLabel(month),
          balance: formatMoney(balance, currency),
        })}
      >
        {formatMoney(balance, currency)}
      </span>
    </td>
  );
}
