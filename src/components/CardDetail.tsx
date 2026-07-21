import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BalanceAdjustment, Card, Expense } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useCardDetailTour } from "../hooks/useCardDetailTour";
import { BalanceAdjustmentModal } from "./BalanceAdjustmentModal";
import { EditExpenseModal } from "./EditExpenseModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  getAdjustmentsForCardMonth,
  getCarryoverForCardMonth,
  getMonthlyBreakdown,
  getMonthlyTotalByCard,
  getMonthlyTotalUsdByCard,
} from "../utils/expenses";
import { AmountDisplay } from "./AmountDisplay";
import {
  CardDetailThisMonthCell,
  CardDetailTotalArsCell,
  CardDetailTotalUsdCell,
} from "./CardDetailExpenseAmounts";
import { getMonthsRange, monthDiff } from "../utils/months";
import { formatMonthLabel, getCurrentMonth } from "../utils/format";
import { getCategoryDisplayName } from "../utils/expenseCategories";

type CardDetailProps = {
  card: Card;
  onAddExpense: () => void;
  onImport: () => void;
  tourPaused?: boolean;
};

type PendingDelete =
  | { kind: "expense"; id: string; description: string }
  | { kind: "adjustment"; id: string; description: string };

export function CardDetail({
  card,
  onAddExpense,
  onImport,
  tourPaused = false,
}: CardDetailProps) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { state, deleteExpense, deleteBalanceAdjustment } = useApp();
  useCardDetailTour({ userId: session?.user.id, paused: tourPaused });
  const currentMonth = getCurrentMonth();
  const monthsRange = getMonthsRange(
    state.expenses,
    state.balanceAdjustments,
    state.pendingCarryovers,
  );

  function defaultSelectedMonth(range: string[]): string {
    if (range.includes(currentMonth)) return currentMonth;
    return range[0] ?? currentMonth;
  }

  const [selectedMonth, setSelectedMonth] = useState(() =>
    defaultSelectedMonth(monthsRange),
  );
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingAdjustment, setEditingAdjustment] =
    useState<BalanceAdjustment | null>(null);
  const [isAddAdjustmentOpen, setIsAddAdjustmentOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const expenses = state.expenses.filter((e) => e.cardId === card.id);
  const monthAdjustments = getAdjustmentsForCardMonth(
    card.id,
    selectedMonth,
    state.balanceAdjustments,
  );
  const monthCarryover = getCarryoverForCardMonth(
    card.id,
    selectedMonth,
    state.pendingCarryovers,
  );

  const monthsBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSelectedMonth(defaultSelectedMonth(monthsRange));
  }, [card.id]);

  useEffect(() => {
    monthsBarRef.current
      ?.querySelector<HTMLElement>(`[data-month="${selectedMonth}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [card.id, selectedMonth]);

  const monthEntries =
    getMonthlyBreakdown(expenses).get(selectedMonth) ?? [];
  const monthRows = monthEntries.flatMap((entry) => {
    const expense = expenses.find((e) => e.id === entry.expenseId);
    return expense
      ? [{ expense, amount: entry.amount, amountUsd: entry.amountUsd }]
      : [];
  });

  const installmentLabel = (expense: (typeof monthRows)[number]["expense"]) =>
    expense.installments === 1
      ? t("common.oneTime")
      : `${monthDiff(expense.startMonth, selectedMonth) + 1}/${expense.installments}`;

  const categoryLabel = (categoryId: string | null) => {
    const name = getCategoryDisplayName(categoryId, state.expenseCategories);
    return name || "—";
  };

  const adjustmentTypeLabel = (type: BalanceAdjustment["type"]) =>
    type === "payment_advance"
      ? t("balanceAdjustment.paymentAdvance")
      : t("balanceAdjustment.creditBalance");

  const actionButtonClass =
    "rounded px-1.5 text-zinc-600 transition-colors hover:bg-white/5 hover:text-zinc-300";

  const hasMonthItems =
    monthRows.length > 0 ||
    monthAdjustments.length > 0 ||
    monthCarryover !== null;

  const expenseActionButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        data-tour="add-expense"
        onClick={onAddExpense}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: card.color }}
      >
        {t("cardDetail.addExpense")}
      </button>
      <button
        type="button"
        data-tour="add-adjustment"
        onClick={() => setIsAddAdjustmentOpen(true)}
        className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/15"
      >
        {t("cardDetail.addAdjustment")}
      </button>
    </div>
  );

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: card.color }}
          />
          <h2 className="text-sm font-semibold text-white">{card.name}</h2>
          <span className="text-xs text-zinc-500">{card.holder}</span>
        </div>
        <button
          type="button"
          data-tour="import-xlsx"
          onClick={onImport}
          className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          {t("consolidated.importXlsx")}
        </button>
      </div>

      <div
        ref={monthsBarRef}
        data-tour="month-bar"
        className="flex w-full min-w-0 gap-1.5 overflow-x-auto pb-1"
      >
        {monthsRange.map((month) => {
          const isSelected = month === selectedMonth;
          const isCurrent = month === currentMonth;
          const isPast = month < currentMonth;
          const total = getMonthlyTotalByCard(
            card.id,
            month,
            state.expenses,
            state.balanceAdjustments,
            state.pendingCarryovers,
          );
          const totalUsd = getMonthlyTotalUsdByCard(
            card.id,
            month,
            state.expenses,
            state.balanceAdjustments,
            state.pendingCarryovers,
          );

          return (
            <button
              key={month}
              data-month={month}
              type="button"
              onClick={() => setSelectedMonth(month)}
              aria-pressed={isSelected}
              className={`min-w-22 shrink-0 rounded-md px-2.5 py-2 text-left transition-colors sm:min-w-24 ${
                isSelected ? "bg-surface" : "bg-surface/50 hover:bg-surface/80"
              } ${isPast && !isSelected ? "opacity-50" : ""}`}
              style={
                isSelected
                  ? { boxShadow: `inset 0 0 0 1px ${card.color}` }
                  : undefined
              }
            >
              <p
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: isSelected ? card.color : undefined }}
              >
                <span
                  className={
                    isSelected ? "" : isPast ? "text-zinc-600" : "text-zinc-500"
                  }
                >
                  {formatMonthLabel(month)}
                  {isCurrent && " •"}
                </span>
              </p>
              <AmountDisplay
                ars={total}
                usd={totalUsd}
                className={`mt-0.5 text-sm ${
                  total < 0 || totalUsd < 0
                    ? "text-emerald-400"
                    : isPast && !isSelected
                      ? "text-zinc-500"
                      : "text-zinc-100"
                }`}
              />
            </button>
          );
        })}
      </div>

      {expenseActionButtons}

      {!hasMonthItems ? (
        <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
          <p className="text-sm text-zinc-400">
            {t("cardDetail.noExpensesInMonth", {
              month: formatMonthLabel(selectedMonth),
            })}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {expenses.length === 0
              ? t("cardDetail.noExpensesHintEmpty")
              : t("cardDetail.noExpensesHintPick")}
          </p>
        </div>
      ) : (
        <div data-tour="card-expense-list">
          <ul className="flex flex-col gap-2 md:hidden">
            {monthCarryover && (
              <li className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-100">
                      {t("payment.pendingBalance")}
                    </p>
                    <p className="mt-1 text-xs text-amber-400/80">
                      {t("payment.pendingBalanceFrom", {
                        month: formatMonthLabel(monthCarryover.sourceMonth),
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3 border-t border-amber-500/10 pt-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-amber-400/70">
                    {t("cardDetail.thisMonth")}
                  </span>
                  <AmountDisplay
                    ars={monthCarryover.amount}
                    usd={monthCarryover.amountUsd}
                    className="items-end text-sm text-amber-200"
                  />
                </div>
              </li>
            )}

            {monthRows.map(({ expense, amount, amountUsd }) => (
              <li
                key={expense.id}
                className="rounded-lg bg-surface px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm leading-snug text-zinc-200">
                    {expense.description}
                  </p>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setEditingExpense(expense)}
                      aria-label={t("cardDetail.editExpense", {
                        description: expense.description,
                      })}
                      className={`${actionButtonClass} hover:text-sky-400`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          kind: "expense",
                          id: expense.id,
                          description: expense.description,
                        })
                      }
                      aria-label={t("cardDetail.deleteExpense", {
                        description: expense.description,
                      })}
                      className={`${actionButtonClass} hover:bg-red-500/10 hover:text-red-400`}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {installmentLabel(expense)} · {t("cardDetail.startLabel")}{" "}
                  {formatMonthLabel(expense.startMonth)}
                  {" · "}
                  {t("expenseCategory.label")} {categoryLabel(expense.categoryId)}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/5 pt-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {t("cardDetail.thisMonth")}
                  </span>
                  <CardDetailThisMonthCell
                    ars={amount}
                    usd={amountUsd}
                    className="items-end text-sm text-zinc-100"
                  />
                </div>
                {(expense.totalAmount > 0 || expense.totalAmountUsd > 0) && (
                  <div className="mt-2 flex items-end justify-between gap-3 text-xs text-zinc-500">
                    <span>{t("cardDetail.totalPurchase")}</span>
                    <span className="flex flex-col items-end gap-0.5">
                      <CardDetailTotalUsdCell amount={expense.totalAmountUsd} />
                      <CardDetailTotalArsCell
                        totalAmount={expense.totalAmount}
                        monthlyUsd={amountUsd}
                      />
                    </span>
                  </div>
                )}
              </li>
            ))}

            {monthAdjustments.map((adjustment) => (
              <li
                key={adjustment.id}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-emerald-100">
                      {adjustment.description}
                    </p>
                    <p className="mt-1 text-xs text-emerald-400/80">
                      {adjustmentTypeLabel(adjustment.type)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setEditingAdjustment(adjustment)}
                      aria-label={t("cardDetail.editAdjustment", {
                        description: adjustment.description,
                      })}
                      className={`${actionButtonClass} hover:text-sky-400`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          kind: "adjustment",
                          id: adjustment.id,
                          description: adjustment.description,
                        })
                      }
                      aria-label={t("cardDetail.deleteAdjustment", {
                        description: adjustment.description,
                      })}
                      className={`${actionButtonClass} hover:bg-red-500/10 hover:text-red-400`}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3 border-t border-emerald-500/10 pt-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-emerald-400/70">
                    {t("cardDetail.creditThisMonth")}
                  </span>
                  <AmountDisplay
                    ars={-adjustment.amount}
                    usd={-adjustment.amountUsd}
                    className="items-end text-sm text-emerald-300"
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden w-full min-w-0 overflow-x-auto rounded-lg bg-surface md:block">
            <table className="w-full min-w-130 text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                  <th className="px-3.5 py-2.5 font-medium">
                    {t("common.description")}
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-medium">
                    {t("cardDetail.installment")}
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-medium">
                    {t("cardDetail.thisMonth")}
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-medium">
                    {t("common.start")}
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-medium">
                    {t("expenseCategory.label")}
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-medium">
                    {t("cardDetail.totalUsd")}
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-medium">
                    {t("cardDetail.totalArs")}
                  </th>
                  <th className="w-16 px-2 py-2.5">
                    <span className="sr-only">{t("common.actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthCarryover && (
                  <tr className="border-b border-amber-500/10 bg-amber-500/5">
                    <td className="px-3.5 py-2.5">
                      <p className="font-medium text-amber-100">
                        {t("payment.pendingBalance")}
                      </p>
                      <p className="text-xs text-amber-400/80">
                        {t("payment.pendingBalanceFrom", {
                          month: formatMonthLabel(monthCarryover.sourceMonth),
                        })}
                      </p>
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-amber-400/80">
                      {t("payment.pendingBalanceShort")}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <AmountDisplay
                        ars={monthCarryover.amount}
                        usd={monthCarryover.amountUsd}
                        className="items-end text-sm text-amber-200"
                      />
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-600">—</td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-600">—</td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-600">—</td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-600">—</td>
                    <td className="px-2 py-2.5" />
                  </tr>
                )}

                {monthRows.map(({ expense, amount, amountUsd }) => (
                  <tr
                    key={expense.id}
                    className="group border-b border-white/5 last:border-b-0"
                  >
                    <td className="px-3.5 py-2.5 text-zinc-200">
                      {expense.description}
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-400">
                      {installmentLabel(expense)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <CardDetailThisMonthCell
                        ars={amount}
                        usd={amountUsd}
                        className="items-end text-sm"
                      />
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-400">
                      {formatMonthLabel(expense.startMonth)}
                    </td>
                    <td className="max-w-[8rem] truncate px-3.5 py-2.5 text-right text-zinc-400">
                      {categoryLabel(expense.categoryId)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-money text-zinc-100">
                      <CardDetailTotalUsdCell amount={expense.totalAmountUsd} />
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <CardDetailTotalArsCell
                        totalAmount={expense.totalAmount}
                        monthlyUsd={amountUsd}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setEditingExpense(expense)}
                          aria-label={t("cardDetail.editExpense", {
                            description: expense.description,
                          })}
                          className={`${actionButtonClass} hover:text-sky-400`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                        setPendingDelete({
                          kind: "expense",
                          id: expense.id,
                          description: expense.description,
                        })
                      }
                          aria-label={t("cardDetail.deleteExpense", {
                            description: expense.description,
                          })}
                          className={`${actionButtonClass} hover:bg-red-500/10 hover:text-red-400`}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {monthAdjustments.map((adjustment) => (
                  <tr
                    key={adjustment.id}
                    className="border-b border-emerald-500/10 bg-emerald-500/5 last:border-b-0"
                  >
                    <td className="px-3.5 py-2.5">
                      <p className="text-emerald-100">{adjustment.description}</p>
                      <p className="text-xs text-emerald-400/80">
                        {adjustmentTypeLabel(adjustment.type)}
                      </p>
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-emerald-400/80">
                      {t("cardDetail.creditShort")}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <AmountDisplay
                        ars={-adjustment.amount}
                        usd={-adjustment.amountUsd}
                        className="items-end text-sm text-emerald-300"
                      />
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-emerald-400/80">
                      {formatMonthLabel(adjustment.applyMonth)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-600">—</td>
                    <td className="px-3.5 py-2.5 text-right text-zinc-600">—</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setEditingAdjustment(adjustment)}
                          aria-label={t("cardDetail.editAdjustment", {
                            description: adjustment.description,
                          })}
                          className={`${actionButtonClass} hover:text-sky-400`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              kind: "adjustment",
                              id: adjustment.id,
                              description: adjustment.description,
                            })
                          }
                          aria-label={t("cardDetail.deleteAdjustment", {
                            description: adjustment.description,
                          })}
                          className={`${actionButtonClass} hover:bg-red-500/10 hover:text-red-400`}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDeleteModal
          title={t(
            pendingDelete.kind === "expense"
              ? "confirmDelete.expenseTitle"
              : "confirmDelete.adjustmentTitle",
          )}
          message={t(
            pendingDelete.kind === "expense"
              ? "confirmDelete.expenseMessage"
              : "confirmDelete.adjustmentMessage",
            { description: pendingDelete.description },
          )}
          warning={t("confirmDelete.cannotUndo")}
          onClose={() => setPendingDelete(null)}
          onConfirm={() =>
            pendingDelete.kind === "expense"
              ? deleteExpense(pendingDelete.id)
              : deleteBalanceAdjustment(pendingDelete.id)
          }
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          card={card}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      {editingAdjustment && (
        <BalanceAdjustmentModal
          card={card}
          adjustment={editingAdjustment}
          onClose={() => setEditingAdjustment(null)}
        />
      )}

      {isAddAdjustmentOpen && (
        <BalanceAdjustmentModal
          card={card}
          defaultApplyMonth={selectedMonth}
          onClose={() => setIsAddAdjustmentOpen(false)}
        />
      )}
    </section>
  );
}

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
