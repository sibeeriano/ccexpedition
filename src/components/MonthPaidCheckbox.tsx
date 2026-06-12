import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import { getMonthlyDueByCard } from "../utils/expenses";
import { PaymentModal } from "./PaymentModal";
import { formatMonthLabel } from "../utils/format";
import { isBeforeCurrentMonth } from "../utils/months";

type MonthPaidCheckboxProps = {
  card: Card;
  month: string;
};

export function MonthPaidCheckbox({ card, month }: MonthPaidCheckboxProps) {
  const { t } = useTranslation();
  const { state, isMonthPaid, clearMonthlyPayment, settleMonthlyPayment } =
    useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const implicitPaid = isBeforeCurrentMonth(month);
  const checked = isMonthPaid(card.id, month);

  async function handleChange(nextChecked: boolean) {
    if (implicitPaid) return;
    if (nextChecked) {
      const due = getMonthlyDueByCard(
        card.id,
        month,
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
      );
      if (due.ars <= 0 && due.usd <= 0) {
        setBusy(true);
        await settleMonthlyPayment({
          cardId: card.id,
          month,
          paidInFull: true,
        });
        setBusy(false);
        return;
      }
      setModalOpen(true);
      return;
    }
    setBusy(true);
    await clearMonthlyPayment(card.id, month);
    setBusy(false);
  }

  return (
    <>
      <label className="grid w-full cursor-pointer grid-cols-[1.125rem_0.5rem_1fr] items-center gap-x-2 text-xs text-zinc-400">
        <input
          type="checkbox"
          checked={checked}
          disabled={busy || implicitPaid}
          onChange={(e) => void handleChange(e.target.checked)}
          aria-label={t("payment.markPaid", {
            card: card.name,
            month: formatMonthLabel(month),
          })}
          className="size-3.5 rounded border-white/20 bg-base text-white focus:ring-white/20"
        />
        <span
          className="size-2 justify-self-center rounded-full"
          style={{ backgroundColor: card.color }}
          aria-hidden
        />
        <span className="min-w-0 truncate text-left">{card.name}</span>
      </label>

      {modalOpen && (
        <PaymentModal
          card={card}
          month={month}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
