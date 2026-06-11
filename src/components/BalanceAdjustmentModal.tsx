import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BalanceAdjustment, BalanceAdjustmentType, Card } from "../types";
import { useApp } from "../context/AppContext";
import { getExpenseStartMonthOptions } from "../utils/months";
import { getCurrentMonth } from "../utils/format";
import { MonthSelectField } from "./MonthSelectField";
import { Modal, useModalClose } from "./Modal";

type BalanceAdjustmentModalProps = {
  card: Card;
  adjustment?: BalanceAdjustment;
  defaultApplyMonth?: string;
  onClose: () => void;
};

export function BalanceAdjustmentModal({
  card,
  adjustment,
  defaultApplyMonth,
  onClose,
}: BalanceAdjustmentModalProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(adjustment);
  return (
    <Modal
      title={
        isEdit
          ? t("balanceAdjustment.editTitle", {
              description: adjustment!.description,
            })
          : t("balanceAdjustment.addTitle", { card: card.name })
      }
      onClose={onClose}
    >
      <AdjustmentForm
        card={card}
        adjustment={adjustment}
        defaultApplyMonth={defaultApplyMonth}
      />
    </Modal>
  );
}

function AdjustmentForm({
  card,
  adjustment,
  defaultApplyMonth,
}: {
  card: Card;
  adjustment?: BalanceAdjustment;
  defaultApplyMonth?: string;
}) {
  const { t } = useTranslation();
  const { state, addBalanceAdjustment, updateBalanceAdjustment } = useApp();
  const close = useModalClose();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(adjustment?.description ?? "");
  const [amountInput, setAmountInput] = useState(
    adjustment && adjustment.amount > 0 ? String(adjustment.amount) : "",
  );
  const [usdAmountInput, setUsdAmountInput] = useState(
    adjustment && adjustment.amountUsd > 0 ? String(adjustment.amountUsd) : "",
  );
  const [type, setType] = useState<BalanceAdjustmentType>(
    adjustment?.type ?? "payment_advance",
  );

  const currentMonth = getCurrentMonth();
  const monthOptions = getExpenseStartMonthOptions(
    state.expenses,
    state.balanceAdjustments,
    state.pendingCarryovers,
  );
  const [applyMonth, setApplyMonth] = useState(
    adjustment?.applyMonth ?? defaultApplyMonth ?? currentMonth,
  );

  const amount = Number.parseFloat(amountInput) || 0;
  const amountUsd = Number.parseFloat(usdAmountInput) || 0;
  const isValid = description.trim().length > 0 && (amount > 0 || amountUsd > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    const payload = {
      cardId: card.id,
      description: description.trim(),
      amount,
      amountUsd,
      type,
      applyMonth,
    };

    const errorMessage = adjustment
      ? await updateBalanceAdjustment(adjustment.id, payload)
      : await addBalanceAdjustment(payload);

    if (errorMessage) {
      setError(errorMessage);
      setSaving(false);
      return;
    }
    close();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">{t("balanceAdjustment.hint")}</p>

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-zinc-400">
          {t("balanceAdjustment.type")}
        </legend>
        <div className="grid grid-cols-1 gap-1 rounded-md bg-base p-1 sm:grid-cols-2">
          {(
            [
              ["payment_advance", t("balanceAdjustment.paymentAdvance")],
              ["credit_balance", t("balanceAdjustment.creditBalance")],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded px-3 py-2 text-center text-sm font-medium transition-colors ${
                type === value
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="adjustment-type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          {type === "payment_advance"
            ? t("balanceAdjustment.paymentAdvanceHint")
            : t("balanceAdjustment.creditBalanceHint")}
        </p>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adjustment-description"
          className="text-xs font-medium text-zinc-400"
        >
          {t("common.description")}
        </label>
        <input
          id="adjustment-description"
          type="text"
          required
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("balanceAdjustment.descriptionPlaceholder")}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adjustment-amount"
          className="text-xs font-medium text-zinc-400"
        >
          {t("balanceAdjustment.amountArs")}
        </label>
        <input
          id="adjustment-amount"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          placeholder="0.00"
          className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adjustment-amount-usd"
          className="text-xs font-medium text-zinc-400"
        >
          {t("balanceAdjustment.amountUsd")}
        </label>
        <input
          id="adjustment-amount-usd"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={usdAmountInput}
          onChange={(e) => setUsdAmountInput(e.target.value)}
          placeholder="0.00"
          className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adjustment-apply-month"
          className="text-xs font-medium text-zinc-400"
        >
          {t("balanceAdjustment.applyMonth")}
        </label>
        <MonthSelectField
          id="adjustment-apply-month"
          value={applyMonth}
          options={monthOptions}
          currentMonth={currentMonth}
          onChange={setApplyMonth}
        />
        <p className="text-xs text-zinc-500">
          {t("balanceAdjustment.applyMonthHint")}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={saving || !isValid}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: card.color }}
        >
          {saving
            ? t("common.saving")
            : adjustment
              ? t("balanceAdjustment.save")
              : t("balanceAdjustment.submit")}
        </button>
      </div>
    </form>
  );
}
