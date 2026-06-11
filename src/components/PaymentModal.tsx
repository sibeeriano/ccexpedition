import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import { getMonthlyDueByCard } from "../utils/expenses";
import { addMonths } from "../utils/months";
import { AmountDisplay } from "./AmountDisplay";
import { formatMonthLabel } from "../utils/format";
import { Modal, useModalClose } from "./Modal";

type PaymentModalProps = {
  card: Card;
  month: string;
  onClose: () => void;
};

type Step = "confirm-full" | "partial";

export function PaymentModal({ card, month, onClose }: PaymentModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("payment.title", {
        card: card.name,
        month: formatMonthLabel(month),
      })}
      onClose={onClose}
    >
      <PaymentForm card={card} month={month} />
    </Modal>
  );
}

function PaymentForm({ card, month }: { card: Card; month: string }) {
  const { t } = useTranslation();
  const { state, settleMonthlyPayment } = useApp();
  const close = useModalClose();
  const [step, setStep] = useState<Step>("confirm-full");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [usdAmountInput, setUsdAmountInput] = useState("");

  const due = getMonthlyDueByCard(
    card.id,
    month,
    state.expenses,
    state.balanceAdjustments,
    state.pendingCarryovers,
  );

  const amountPaid = Number.parseFloat(amountInput) || 0;
  const amountPaidUsd = Number.parseFloat(usdAmountInput) || 0;
  const remainderArs = Math.max(0, Math.round((due.ars - amountPaid) * 100) / 100);
  const remainderUsd = Math.max(
    0,
    Math.round((due.usd - amountPaidUsd) * 100) / 100,
  );
  const nextMonth = addMonths(month, 1);

  async function handleFullPayment() {
    setSaving(true);
    setError(null);
    const errorMessage = await settleMonthlyPayment({
      cardId: card.id,
      month,
      paidInFull: true,
    });
    setSaving(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    close();
  }

  async function handlePartialPayment(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const errorMessage = await settleMonthlyPayment({
      cardId: card.id,
      month,
      paidInFull: false,
      amountPaid,
      amountPaidUsd,
    });
    setSaving(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    close();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-white/10 bg-base px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("payment.amountDue")}
        </p>
        <AmountDisplay
          ars={due.ars}
          usd={due.usd}
          className="mt-1 text-sm text-zinc-100"
        />
      </div>

      {step === "confirm-full" ? (
        <>
          <p className="text-sm text-zinc-300">{t("payment.paidFullQuestion")}</p>
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStep("partial")}
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
            >
              {t("common.no")}
            </button>
            <button
              type="button"
              onClick={() => void handleFullPayment()}
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: card.color }}
            >
              {saving ? t("common.saving") : t("common.yes")}
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handlePartialPayment} className="flex flex-col gap-4">
          <p className="text-sm text-zinc-400">{t("payment.partialHint")}</p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="payment-amount"
              className="text-xs font-medium text-zinc-400"
            >
              {t("payment.amountPaidArs")}
            </label>
            <input
              id="payment-amount"
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
              htmlFor="payment-amount-usd"
              className="text-xs font-medium text-zinc-400"
            >
              {t("payment.amountPaidUsd")}
            </label>
            <input
              id="payment-amount-usd"
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

          {(remainderArs > 0 || remainderUsd > 0) && (
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
              <p className="text-xs font-medium text-amber-300/90">
                {t("payment.remainderToNextMonth", {
                  month: formatMonthLabel(nextMonth),
                })}
              </p>
              <AmountDisplay
                ars={remainderArs}
                usd={remainderUsd}
                className="mt-1 text-sm text-amber-200"
              />
              <p className="mt-1.5 text-xs text-amber-300/70">
                {t("payment.pendingBalanceNote")}
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStep("confirm-full")}
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
            >
              {t("common.back")}
            </button>
            <button
              type="submit"
              disabled={saving || (amountPaid <= 0 && amountPaidUsd <= 0)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: card.color }}
            >
              {saving ? t("common.saving") : t("payment.confirmPartial")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
