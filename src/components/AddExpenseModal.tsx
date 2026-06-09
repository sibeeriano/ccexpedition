import { useState } from "react";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import { getMonthlyBreakdown } from "../utils/expenses";
import { addMonths, getMonthsRange, monthDiff } from "../utils/months";

const START_MONTH_LOOKBACK = 12; // how many past months can be picked
import { formatMoney, formatMonthLabel, getCurrentMonth } from "../utils/format";
import { Modal, useModalClose } from "./Modal";

type PaymentType = "one-time" | "installments";

type AddExpenseModalProps = {
  card: Card;
  onClose: () => void;
};

export function AddExpenseModal({ card, onClose }: AddExpenseModalProps) {
  return (
    <Modal title={`Add Expense — ${card.name}`} onClose={onClose}>
      <ExpenseForm card={card} />
    </Modal>
  );
}

// Rendered inside <Modal> so useModalClose can trigger the exit animation.
function ExpenseForm({ card }: { card: Card }) {
  const { state, addExpense } = useApp();
  const close = useModalClose();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [usdAmountInput, setUsdAmountInput] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("one-time");
  const [installmentsInput, setInstallmentsInput] = useState("3");
  // Selectable start months: from 12 months back through the end of the
  // visible range, so older dragged-along expenses can be added too.
  const currentMonth = getCurrentMonth();
  const visibleRange = getMonthsRange(state.expenses);
  const firstOption = addMonths(currentMonth, -START_MONTH_LOOKBACK);
  const lastOption =
    visibleRange[visibleRange.length - 1] > currentMonth
      ? visibleRange[visibleRange.length - 1]
      : currentMonth;
  const monthOptions = Array.from(
    { length: monthDiff(firstOption, lastOption) + 1 },
    (_, i) => addMonths(firstOption, i),
  );
  const [startMonth, setStartMonth] = useState(currentMonth);

  const totalAmount = Number.parseFloat(amountInput) || 0;
  const totalAmountUsd = Number.parseFloat(usdAmountInput) || 0;
  const installments =
    paymentType === "one-time"
      ? 1
      : Math.floor(Number.parseInt(installmentsInput, 10) || 0);

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

    setSaving(true);
    setError(null);
    const errorMessage = await addExpense({
      cardId: card.id,
      description: trimmed,
      totalAmount,
      totalAmountUsd,
      installments,
      startMonth,
    });
    if (errorMessage) {
      setError(errorMessage);
      setSaving(false);
      return;
    }
    close();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="expense-description"
          className="text-xs font-medium text-zinc-400"
        >
          Description
        </label>
        <input
          id="expense-description"
          type="text"
          required
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries, new phone…"
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="expense-amount"
          className="text-xs font-medium text-zinc-400"
        >
          Total Amount (ARS)
        </label>
        <input
          id="expense-amount"
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
          htmlFor="expense-amount-usd"
          className="text-xs font-medium text-zinc-400"
        >
          Total Amount (USD)
        </label>
        <input
          id="expense-amount-usd"
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

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-zinc-400">
          Payment Type
        </legend>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-base p-1">
          {(
            [
              ["one-time", "One-time"],
              ["installments", "Installments"],
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
                onChange={() => setPaymentType(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {paymentType === "installments" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="expense-installments"
            className="text-xs font-medium text-zinc-400"
          >
            Number of installments
          </label>
          <input
            id="expense-installments"
            type="number"
            required
            min="2"
            max="48"
            step="1"
            value={installmentsInput}
            onChange={(e) => setInstallmentsInput(e.target.value)}
            className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white focus:border-white/30 focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="expense-start-month"
          className="text-xs font-medium text-zinc-400"
        >
          Start Month
        </label>
        <select
          id="expense-start-month"
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
              {month < currentMonth ? " (past)" : ""}
            </option>
          ))}
        </select>
      </div>

      {previewRows.length > 0 && (
        <div className="rounded-md bg-base px-3 py-2">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Payment schedule
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
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: card.color }}
        >
          {saving ? "Saving…" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}
