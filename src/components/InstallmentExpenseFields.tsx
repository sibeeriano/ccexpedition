import { useTranslation } from "react-i18next";

type InstallmentExpenseFieldsProps = {
  idPrefix: string;
  installmentsInput: string;
  onInstallmentsInputChange: (value: string) => void;
  installmentAmountInput: string;
  installmentUsdAmountInput: string;
  onInstallmentAmountInputChange: (value: string) => void;
  onInstallmentUsdAmountInputChange: (value: string) => void;
};

export function InstallmentExpenseFields({
  idPrefix,
  installmentsInput,
  onInstallmentsInputChange,
  installmentAmountInput,
  installmentUsdAmountInput,
  onInstallmentAmountInputChange,
  onInstallmentUsdAmountInputChange,
}: InstallmentExpenseFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-base/50 p-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}-installments`}
          className="text-xs font-medium text-zinc-400"
        >
          {t("addExpense.installmentCount")}
        </label>
        <input
          id={`${idPrefix}-installments`}
          type="number"
          required
          min="2"
          max="48"
          step="1"
          value={installmentsInput}
          onChange={(e) => onInstallmentsInputChange(e.target.value)}
          className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white focus:border-white/30 focus:outline-none"
        />
      </div>

      <p className="text-xs text-zinc-500">{t("addExpense.installmentsAmountHint")}</p>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}-installment-amount`}
          className="text-xs font-medium text-zinc-400"
        >
          {t("addExpense.installmentAmountArs")}
        </label>
        <input
          id={`${idPrefix}-installment-amount`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={installmentAmountInput}
          onChange={(e) => onInstallmentAmountInputChange(e.target.value)}
          placeholder="0.00"
          className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}-installment-amount-usd`}
          className="text-xs font-medium text-zinc-400"
        >
          {t("addExpense.installmentAmountUsd")}
        </label>
        <input
          id={`${idPrefix}-installment-amount-usd`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={installmentUsdAmountInput}
          onChange={(e) => onInstallmentUsdAmountInputChange(e.target.value)}
          placeholder="0.00"
          className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>
    </div>
  );
}
