import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card, Expense } from "../types";
import { useApp } from "../context/AppContext";
import { getExpenseMonthlyRate, getMonthlyBreakdown } from "../utils/expenses";
import { getCategoryDisplayName } from "../utils/expenseCategories";
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
import { UsdAmount } from "./UsdAmount";

type PaymentType = "one-time" | "installments";

type EditExpenseModalProps = {
  card: Card;
  expense: Expense;
  onClose: () => void;
};

export function EditExpenseModal({
  card,
  expense,
  onClose,
}: EditExpenseModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("editExpense.title", { description: expense.description })}
      onClose={onClose}
    >
      <EditForm card={card} expense={expense} />
    </Modal>
  );
}

function deriveInitialPaymentType(expense: Expense): PaymentType {
  return expense.installments > 1 && !expense.isMonthlyCharge
    ? "installments"
    : "one-time";
}

function deriveInitialAmounts(expense: Expense) {
  if (expense.isMonthlyCharge) {
    const rate = getExpenseMonthlyRate(expense);
    return {
      amountInput: rate.ars > 0 ? String(rate.ars) : "",
      usdAmountInput: rate.usd > 0 ? String(rate.usd) : "",
    };
  }
  return {
    amountInput: expense.totalAmount > 0 ? String(expense.totalAmount) : "",
    usdAmountInput:
      expense.totalAmountUsd > 0 ? String(expense.totalAmountUsd) : "",
  };
}

function EditForm({ card, expense }: { card: Card; expense: Expense }) {
  const { t } = useTranslation();
  const { state, updateExpense } = useApp();
  const close = useModalClose();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialAmounts = deriveInitialAmounts(expense);
  const initialPaymentType = deriveInitialPaymentType(expense);
  const initialMonthlyRate =
    initialPaymentType === "installments"
      ? getExpenseMonthlyRate(expense)
      : { ars: 0, usd: 0 };
  const [description, setDescription] = useState(expense.description);
  const [categoryInput, setCategoryInput] = useState(() =>
    getCategoryDisplayName(expense.categoryId, state.expenseCategories),
  );
  const [amountInput, setAmountInput] = useState(initialAmounts.amountInput);
  const [usdAmountInput, setUsdAmountInput] = useState(
    initialAmounts.usdAmountInput,
  );
  const [paymentType, setPaymentType] = useState<PaymentType>(initialPaymentType);
  const [isMonthlyCharge, setIsMonthlyCharge] = useState(expense.isMonthlyCharge);
  const [subscriptionMonthsInput, setSubscriptionMonthsInput] = useState(
    expense.isMonthlyCharge ? String(expense.installments) : "12",
  );
  const [installmentsInput, setInstallmentsInput] = useState(
    expense.installments > 1 ? String(expense.installments) : "3",
  );
  const [installmentAmountInput, setInstallmentAmountInput] = useState(
    initialMonthlyRate.ars > 0 ? String(initialMonthlyRate.ars) : "",
  );
  const [installmentUsdAmountInput, setInstallmentUsdAmountInput] = useState(
    initialMonthlyRate.usd > 0 ? String(initialMonthlyRate.usd) : "",
  );
  const [amountSource, setAmountSource] =
    useState<InstallmentAmountSource>("total");
  const currentMonth = getCurrentMonth();
  const monthOptions = getExpenseStartMonthOptions(
    state.expenses,
    state.balanceAdjustments,
    state.pendingCarryovers,
  );
  const [startMonth, setStartMonth] = useState(expense.startMonth);

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
            ...expense,
            description,
            totalAmount,
            totalAmountUsd,
            installments,
            startMonth,
            isMonthlyCharge: isSubscription,
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
    const errorMessage = await updateExpense(expense.id, {
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
          htmlFor="edit-expense-description"
          className="text-xs font-medium text-zinc-400"
        >
          {t("common.description")}
        </label>
        <input
          id="edit-expense-description"
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
        id="edit-expense-category"
        value={categoryInput}
        categories={state.expenseCategories}
        onChange={setCategoryInput}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="edit-expense-amount"
          className="text-xs font-medium text-zinc-400"
        >
          {arsLabel}
        </label>
        <input
          id="edit-expense-amount"
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
          htmlFor="edit-expense-amount-usd"
          className="text-xs font-medium text-zinc-400"
        >
          {usdLabel}
        </label>
        <input
          id="edit-expense-amount-usd"
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
                name="edit-payment-type"
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
          idPrefix="edit-expense"
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
            htmlFor="edit-expense-subscription-months"
            className="text-xs font-medium text-zinc-400"
          >
            {t("addExpense.subscriptionMonths")}
          </label>
          <input
            id="edit-expense-subscription-months"
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
          htmlFor="edit-expense-start-month"
          className="text-xs font-medium text-zinc-400"
        >
          {t("addExpense.startMonth")}
        </label>
        <MonthSelectField
          id="edit-expense-start-month"
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
                <span className="font-mono text-money text-zinc-100">
                  {row.amount > 0 && formatMoney(row.amount, "ARS")}
                  {row.amount > 0 && row.amountUsd > 0 && " · "}
                  {row.amountUsd > 0 && <UsdAmount amount={row.amountUsd} />}
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
          {saving ? t("common.saving") : t("editExpense.submit")}
        </button>
      </div>
    </form>
  );
}
