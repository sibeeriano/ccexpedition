import { useTranslation } from "react-i18next";
import type { CurrencySymbol } from "../types";
import { formatMoney, formatMonthList } from "../utils/format";

type BudgetExceededNoticeProps = {
  months: string[];
  budgetAlert: number;
  currency: CurrencySymbol;
};

export function BudgetExceededNotice({
  months,
  budgetAlert,
  currency,
}: BudgetExceededNoticeProps) {
  const { t } = useTranslation();
  const monthsLabel = formatMonthList(months);

  return (
    <div className="flex min-w-0 max-w-md items-end gap-2 sm:max-w-lg sm:gap-3">
      <img
        src="/gatito5.png"
        alt=""
        className="h-20 w-auto shrink-0 object-contain sm:h-28"
      />
      <div className="budget-speech-bubble relative min-w-0 flex-1 rounded-2xl border border-white/10 bg-surface px-3.5 py-2.5 sm:px-4 sm:py-3">
        <p className="text-xs leading-relaxed text-zinc-200 sm:text-sm">
          {t("consolidated.budgetExceeded", {
            months: monthsLabel,
            amount: formatMoney(budgetAlert, currency),
          })}
        </p>
      </div>
    </div>
  );
}
