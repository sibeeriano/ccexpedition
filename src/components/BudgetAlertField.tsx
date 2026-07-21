import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../utils/format";

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

export function BudgetAlertField() {
  const { t } = useTranslation();
  const { state, updateBudgetAlert } = useApp();
  const { currency, budgetAlert, budgetAlertConfirmed } = state.settings;
  const confirmed = budgetAlertConfirmed === true && budgetAlert > 0;
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!confirmed) {
      setDraft(budgetAlert > 0 ? String(budgetAlert) : "");
    }
  }, [budgetAlert, confirmed]);

  function handleConfirm() {
    const amount = Number.parseFloat(draft) || 0;
    updateBudgetAlert({ amount, confirmed: amount > 0 });
  }

  function handleEdit() {
    updateBudgetAlert({ amount: budgetAlert, confirmed: false });
    setDraft(String(budgetAlert));
  }

  if (confirmed) {
    return (
      <label
        data-tour="budget-alert"
        className="flex items-center gap-2 text-xs font-medium text-zinc-400"
      >
        {t("consolidated.budgetAlert")}
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-money font-medium text-zinc-400">
            {formatMoney(budgetAlert, currency)}
          </span>
          <button
            type="button"
            onClick={handleEdit}
            aria-label={t("consolidated.editBudgetAlert")}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
          >
            <PencilIcon />
          </button>
        </span>
      </label>
    );
  }

  return (
    <label
      data-tour="budget-alert"
      className="flex items-center gap-2 text-xs font-medium text-zinc-400"
    >
      {t("consolidated.budgetAlert")}
      <span className="flex items-center gap-1">
        <span className="flex items-center gap-1 rounded-md border border-white/10 bg-surface px-2 py-1.5 focus-within:border-white/30">
          <span className="text-zinc-500">{currency}</span>
          <input
            type="number"
            min="0"
            step="any"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
            aria-label={t("consolidated.budgetAlertInput")}
            className="w-24 bg-transparent font-mono text-money text-white placeholder:text-zinc-600 focus:outline-none"
            placeholder="0"
          />
        </span>
        <button
          type="button"
          onClick={handleConfirm}
          className="shrink-0 rounded bg-white/10 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/15 sm:text-xs"
        >
          {t("consolidated.budgetAlertOk")}
        </button>
      </span>
    </label>
  );
}
