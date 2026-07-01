import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import { getMonthlyBreakdown } from "../utils/expenses";
import { getExpenseStartMonthOptions } from "../utils/months";
import {
  installmentAmountForTotal,
  parseInstallmentCount,
  totalForInstallmentAmount,
  type InstallmentAmountSource,
} from "../utils/installmentFormSync";
import { formatMoney, formatMonthLabel, getCurrentMonth } from "../utils/format";
import { CategorySelectField } from "./CategorySelectField";
import { InstallmentExpenseFields } from "./InstallmentExpenseFields";
import { MonthSelectField } from "./MonthSelectField";
import { Modal, useModalClose } from "./Modal";
const DEFAULT_SUBSCRIPTION_MONTHS = 12;

type PaymentType = "one-time" | "installments";

type AddExpenseModalProps = {
  card: Card;
  onClose: () => void;
};

export function AddExpenseModal({ card, onClose }: AddExpenseModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={t("addExpense.title", { card: card.name })} onClose={onClose}>
      <ExpenseForm card={card} />
    </Modal>
  );
}

function ExpenseForm({ card }: { card: Card }) {
  const { t } = useTranslation();
  const { state, addExpense } = useApp();
  const close = useModalClose();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usdAmountInput, setUsdAmountInput] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("one-time");
  const [isMonthlyCharge, setIsMonthlyCharge] = useState(false);
  const [subscriptionMonthsInput, setSubscriptionMonthsInput] = useState(
    String(DEFAULT_SUBSCRIPTION_MONTHS),
  );
  const [installmentsInput, setInstallmentsInput] = useState("3");
  const [installmentAmountInput, setInstallmentAmountInput] = useState("");
  const [installmentUsdAmountInput, setInstallmentUsdAmountInput] = useState("");
  const [amountSource, setAmountSource] =
    useState<InstallmentAmountSource>("total");
  const currentMonth = getCurrentMonth();
  const monthOptions = getExpenseStartMonthOptions(
    state.expenses,
    state.balanceAdjustments,
    state.pendingCarryovers,
  );
  const [startMonth, setStartMonth] = useState(currentMonth);

  const isSubscription = paymentType === "one-time" && isMonthlyCharge;
  const amount = Number.parseFloat(amountInput) || 0;
  const amountUsd = Number.parseFloat(usdAmountInput) || 0;
  const subscriptionMonths = isSubscription
    ? Math.floor(Number.parseInt(subscriptionMonthsInput, 10) || 0)
    : 1;
  const installments =
    paymentType === "installments"
      ? Math.floor(Number.parseInt(installmentsInput, 10) || 0)
      : isSubscription
        ? subscriptionMonths
        : 1;

  const totalAmount = isSubscription ? amount * subscriptionMonths : amount;
  const totalAmountUsd = isSubscription
    ? amountUsd * subscriptionMonths
    : amountUsd;

  const isPreviewable =
    (totalAmount > 0 || totalAmountUsd > 0) && installments >= 1;

  const previewRows = isPreviewable
    ? [
        ...getMonthlyBreakdown([
          {
            id: "preview",
            cardId: card.id,
            description,
            totalAmount,
            totalAmountUsd,
            installments,
            startMonth,
            isMonthlyCharge: isSubscription,
            categoryId: null,
          },
        ]).entries(),
      ].map(([month, entries]) => ({
        month,
        amount: entries[0].amount,
        amountUsd: entries[0].amountUsd,
      }))
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed || !isPreviewable || saving) return;
    if (paymentType === "installments" && (installments < 2 || installments > 48))
      return;
    if (isSubscription && (subscriptionMonths < 1 || subscriptionMonths > 48)) {
      return;
    }

    setSaving(true);
    setError(null);
    const errorMessage = await addExpense({
      cardId: card.id,
      description: trimmed,
      totalAmount,
      totalAmountUsd,
      installments,
      startMonth,
      isMonthlyCharge: isSubscription,
      categoryName: categoryInput,
    });
    if (errorMessage) {
      setError(errorMessage);
      setSaving(false);
      return;
    }
    close();
  }

  const arsLabel = isSubscription
    ? t("addExpense.monthlyArs")
    : t("addExpense.totalArs");
  const usdLabel = isSubscription
    ? t("addExpense.monthlyUsd")
    : t("addExpense.totalUsd");

  function handleAmountInputChange(value: string) {
    setAmountInput(value);
    if (paymentType !== "installments") return;
    setAmountSource("total");
    const count = parseInstallmentCount(installmentsInput);
    if (count >= 1) {
      setInstallmentAmountInput(installmentAmountForTotal(value, count));
    }
  }

  function handleUsdAmountInputChange(value: string) {
    setUsdAmountInput(value);
    if (paymentType !== "installments") return;
    setAmountSource("total");
    const count = parseInstallmentCount(installmentsInput);
    if (count >= 1) {
      setInstallmentUsdAmountInput(installmentAmountForTotal(value, count));
    }
  }

  function handleInstallmentAmountInputChange(value: string) {
    setInstallmentAmountInput(value);
    if (paymentType !== "installments") return;
    setAmountSource("installment");
    const count = parseInstallmentCount(installmentsInput);
    if (count >= 1) {
      setAmountInput(totalForInstallmentAmount(value, count));
    }
  }

  function handleInstallmentUsdAmountInputChange(value: string) {
    setInstallmentUsdAmountInput(value);
    if (paymentType !== "installments") return;
    setAmountSource("installment");
    const count = parseInstallmentCount(installmentsInput);
    if (count >= 1) {
      setUsdAmountInput(totalForInstallmentAmount(value, count));
    }
  }

  function handleInstallmentsInputChange(value: string) {
    setInstallmentsInput(value);
    if (paymentType !== "installments") return;
    const count = parseInstallmentCount(value);
    if (count < 1) return;
    if (amountSource === "installment") {
      setAmountInput(totalForInstallmentAmount(installmentAmountInput, count));
      setUsdAmountInput(
        totalForInstallmentAmount(installmentUsdAmountInput, count),
      );
    } else {
      setInstallmentAmountInput(installmentAmountForTotal(amountInput, count));
      setInstallmentUsdAmountInput(
        installmentAmountForTotal(usdAmountInput, count),
      );
    }
  }

  function handlePaymentTypeChange(value: PaymentType) {
    setPaymentType(value);
    if (value === "installments") {
      setIsMonthlyCharge(false);
      const count = parseInstallmentCount(installmentsInput);
      if (count >= 1 && (amountInput || usdAmountInput)) {
        setAmountSource("total");
        setInstallmentAmountInput(installmentAmountForTotal(amountInput, count));
        setInstallmentUsdAmountInput(
          installmentAmountForTotal(usdAmountInput, count),
        );
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="expense-description"
          className="text-xs font-medium text-zinc-400"
        >
          {t("common.description")}
        </label>
        <input
          id="expense-description"
          type="text"
          required
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("addExpense.descriptionPlaceholder")}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <CategorySelectField
        id="expense-category"
        value={categoryInput}
        categories={state.expenseCategories}
        onChange={setCategoryInput}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="expense-amount"
            className="text-xs font-medium text-zinc-400"
          >
            {arsLabel}
          </label>
          <input
            id="expense-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => handleAmountInputChange(e.target.value)}
            placeholder="0.00"
            className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="expense-amount-usd"
            className="text-xs font-medium text-zinc-400"
          >
            {usdLabel}
          </label>
          <input
            id="expense-amount-usd"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={usdAmountInput}
            onChange={(e) => handleUsdAmountInputChange(e.target.value)}
            placeholder="0.00"
            className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-zinc-400">
          {t("addExpense.paymentType")}
        </legend>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-base p-1">
          {(
            [
              ["one-time", t("common.oneTime")],
              ["installments", t("addExpense.installments")],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded px-3 py-1.5 text-center text-sm font-medium transition-colors ${
                paymentType === value
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="payment-type"
                value={value}
                checked={paymentType === value}
                onChange={() => handlePaymentTypeChange(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {paymentType === "one-time" && (
        <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isMonthlyCharge}
            onChange={(e) => setIsMonthlyCharge(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            {t("addExpense.monthlyCharge")}
            <span className="mt-0.5 block text-xs text-zinc-500">
              {t("addExpense.monthlyChargeHint")}
            </span>
          </span>
        </label>
      )}

      {paymentType === "installments" && (
        <InstallmentExpenseFields
          idPrefix="expense"
          installmentsInput={installmentsInput}
          onInstallmentsInputChange={handleInstallmentsInputChange}
          installmentAmountInput={installmentAmountInput}
          installmentUsdAmountInput={installmentUsdAmountInput}
          onInstallmentAmountInputChange={handleInstallmentAmountInputChange}
          onInstallmentUsdAmountInputChange={handleInstallmentUsdAmountInputChange}
        />
      )}

      {isSubscription && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="expense-subscription-months"
            className="text-xs font-medium text-zinc-400"
          >
            {t("addExpense.subscriptionMonths")}
          </label>
          <input
            id="expense-subscription-months"
            type="number"
            required
            min="1"
            max="48"
            step="1"
            value={subscriptionMonthsInput}
            onChange={(e) => setSubscriptionMonthsInput(e.target.value)}
            className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white focus:border-white/30 focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="expense-start-month"
          className="text-xs font-medium text-zinc-400"
        >
          {t("addExpense.startMonth")}
        </label>
        <MonthSelectField
          id="expense-start-month"
          value={startMonth}
          options={monthOptions}
          currentMonth={currentMonth}
          onChange={setStartMonth}
        />
      </div>

      {previewRows.length > 0 && (
        <div className="rounded-md bg-base px-3 py-2">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            {t("addExpense.paymentSchedule")}
          </p>
          <ul className="max-h-36 overflow-y-auto">
            {previewRows.map((row, i) => (
              <li
                key={row.month}
                className="flex items-center justify-between border-b border-white/5 py-1 text-sm last:border-b-0"
              >
                <span className="text-zinc-400">
                  {formatMonthLabel(row.month)}
                  {installments > 1 && (
                    <span className="ml-1.5 text-xs text-zinc-500">
                      {i + 1}/{installments}
                    </span>
                  )}
                </span>
                <span className="font-mono text-zinc-100">
                  {row.amount > 0 && formatMoney(row.amount, "ARS")}
                  {row.amount > 0 && row.amountUsd > 0 && " · "}
                  {row.amountUsd > 0 && formatMoney(row.amountUsd, "$")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
          disabled={saving}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: card.color }}
        >
          {saving ? t("common.saving") : t("addExpense.submit")}
        </button>
      </div>
    </form>
  );
}
