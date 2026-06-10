import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card, Expense } from "../types";
import { useApp } from "../context/AppContext";
import {
  getExpenseEndMonth,
  getExpenseMonthlyRate,
  getMonthlyBreakdown,
} from "../utils/expenses";
import { addMonths, monthDiff } from "../utils/months";
import { formatMoney, formatMonthLabel } from "../utils/format";
import { Modal, useModalClose } from "./Modal";

type EditMonthlyExpenseModalProps = {
  card: Card;
  expense: Expense;
  onClose: () => void;
};

export function EditMonthlyExpenseModal({
  card,
  expense,
  onClose,
}: EditMonthlyExpenseModalProps) {
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

function EditForm({ card, expense }: { card: Card; expense: Expense }) {
  const { t } = useTranslation();
  const { updateExpense } = useApp();
  const close = useModalClose();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalEndMonth = getExpenseEndMonth(expense);
  const [endMonth, setEndMonth] = useState(originalEndMonth);

  const monthOptions = Array.from(
    { length: monthDiff(expense.startMonth, originalEndMonth) + 1 },
    (_, i) => addMonths(expense.startMonth, i),
  );

  const newInstallments = monthDiff(expense.startMonth, endMonth) + 1;
  const rate = getExpenseMonthlyRate(expense);
  const totalAmount = Math.round(rate.ars * newInstallments * 100) / 100;
  const totalAmountUsd = Math.round(rate.usd * newInstallments * 100) / 100;

  const previewRows = [
    ...getMonthlyBreakdown([
      {
        ...expense,
        totalAmount,
        totalAmountUsd,
        installments: newInstallments,
      },
    ]).entries(),
  ].map(([month, entries]) => ({
    month,
    amount: entries[0].amount,
    amountUsd: entries[0].amountUsd,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || newInstallments < 1) return;

    setSaving(true);
    setError(null);
    const errorMessage = await updateExpense(expense.id, {
      totalAmount,
      totalAmountUsd,
      installments: newInstallments,
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
      <p className="text-sm text-zinc-400">{t("editExpense.hint")}</p>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="edit-end-month"
          className="text-xs font-medium text-zinc-400"
        >
          {t("editExpense.endMonth")}
        </label>
        <select
          id="edit-end-month"
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value)}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500">{t("editExpense.endMonthHint")}</p>
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
                  {newInstallments > 1 && (
                    <span className="ml-1.5 text-xs text-zinc-500">
                      {i + 1}/{newInstallments}
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
          {saving ? t("common.saving") : t("editExpense.submit")}
        </button>
      </div>
    </form>
  );
}
