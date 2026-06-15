import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CurrencySymbol } from "../types";
import { useApp } from "../context/AppContext";
import { formatMoney, formatMonthLabel } from "../utils/format";

type MonthlyIncomeCellProps = {
  month: string;
  monthTotal: number;
  currency: CurrencySymbol;
};

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-3.5"
      aria-hidden
    >
      <path d="m2.695 14.363-1.222 3.955a1 1 0 0 0 1.305 1.227l3.958-1.222a1 1 0 0 0 .632-.633L15.09 6.909a2.25 2.25 0 0 0 0-3.182L11.273 0a2.25 2.25 0 0 0-3.182 0L2.695 5.395a1 1 0 0 0-.633.633Z" />
    </svg>
  );
}

export function MonthlyIncomeCell({
  month,
  monthTotal,
  currency,
}: MonthlyIncomeCellProps) {
  const { t } = useTranslation();
  const { state, updateMonthlyIncome } = useApp();
  const entry = state.settings.monthlyIncomeByMonth[month];
  const confirmed = entry?.confirmed === true;
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!confirmed) {
      setDraft(entry?.amount ? String(entry.amount) : "");
    }
  }, [month, entry?.amount, confirmed]);

  const remainder =
    entry && confirmed
      ? Math.round((entry.amount - monthTotal) * 100) / 100
      : 0;

  function handleConfirm() {
    const amount = Number.parseFloat(draft) || 0;
    updateMonthlyIncome(month, { amount, confirmed: true });
  }

  function handleEdit() {
    if (!entry) return;
    updateMonthlyIncome(month, { amount: entry.amount, confirmed: false });
    setDraft(String(entry.amount));
  }

  if (confirmed && entry) {
    return (
      <td className="px-2 py-2 text-right align-top">
        <div className="flex items-center justify-end gap-1.5">
          <span
            className={`font-mono text-sm font-medium ${
              remainder >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatMoney(remainder, currency)}
          </span>
          <button
            type="button"
            onClick={handleEdit}
            aria-label={t("consolidated.editMonthlyIncome", {
              month: formatMonthLabel(month),
            })}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
          >
            <PencilIcon />
          </button>
        </div>
      </td>
    );
  }

  return (
    <td className="px-2 py-2 align-top">
      <div className="flex items-center justify-end gap-1">
        <span className="flex min-w-0 items-center gap-0.5 rounded border border-white/10 bg-base/60 px-1.5 py-1 focus-within:border-white/25">
          <span className="shrink-0 text-[10px] text-zinc-500">{currency}</span>
          <input
            type="number"
            min="0"
            step="any"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
            aria-label={t("consolidated.monthlyIncomeInput", {
              month: formatMonthLabel(month),
            })}
            className="w-16 bg-transparent text-right font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none sm:w-20 sm:text-sm"
            placeholder="0"
          />
        </span>
        <button
          type="button"
          onClick={handleConfirm}
          className="shrink-0 rounded bg-white/10 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/15 sm:text-xs"
        >
          {t("consolidated.monthlyIncomeOk")}
        </button>
      </div>
    </td>
  );
}
