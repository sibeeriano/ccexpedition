import { useEffect, useRef, useState } from "react";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import {
  getMonthlyBreakdown,
  getMonthlyTotalByCard,
  getMonthlyTotalUsdByCard,
} from "../utils/expenses";
import { AmountDisplay } from "./AmountDisplay";
import { getMonthsRange, monthDiff } from "../utils/months";
import { formatMoney, formatMonthLabel, getCurrentMonth } from "../utils/format";

type CardDetailProps = {
  card: Card;
  onAddExpense: () => void;
};

export function CardDetail({ card, onAddExpense }: CardDetailProps) {
  const { state, deleteExpense } = useApp();
  const currentMonth = getCurrentMonth();
  const monthsRange = getMonthsRange(state.expenses);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    monthsRange.includes(currentMonth) ? currentMonth : monthsRange[0],
  );
  const expenses = state.expenses.filter((e) => e.cardId === card.id);

  // Keep the current month centered in the months strip.
  const monthsBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    monthsBarRef.current
      ?.querySelector<HTMLElement>(`[data-month="${currentMonth}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [card.id, currentMonth]);

  // Only the installments that actually fall in the selected month.
  const monthEntries =
    getMonthlyBreakdown(expenses).get(selectedMonth) ?? [];
  const monthRows = monthEntries.flatMap((entry) => {
    const expense = expenses.find((e) => e.id === entry.expenseId);
    return expense
      ? [{ expense, amount: entry.amount, amountUsd: entry.amountUsd }]
      : [];
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: card.color }}
        />
        <h2 className="text-sm font-semibold text-white">{card.name}</h2>
        <span className="text-xs text-zinc-500">{card.holder}</span>
      </div>

      {/* Monthly summary bar: click a month to see its expenses below */}
      <div ref={monthsBarRef} className="flex gap-1.5 overflow-x-auto pb-1">
        {monthsRange.map((month) => {
          const isSelected = month === selectedMonth;
          const isCurrent = month === currentMonth;
          const isPast = month < currentMonth;
          const total = getMonthlyTotalByCard(card.id, month, state.expenses);
          const totalUsd = getMonthlyTotalUsdByCard(
            card.id,
            month,
            state.expenses,
          );

          return (
            <button
              key={month}
              data-month={month}
              type="button"
              onClick={() => setSelectedMonth(month)}
              aria-pressed={isSelected}
              className={`min-w-24 shrink-0 rounded-md px-2.5 py-2 text-left transition-colors ${
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
                  isPast && !isSelected ? "text-zinc-500" : "text-zinc-100"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Expenses falling in the selected month */}
      {monthRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
          <p className="text-sm text-zinc-400">
            No expenses in {formatMonthLabel(selectedMonth)}.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {expenses.length === 0
              ? "Add your first purchase to see it spread across the months above."
              : "Pick another month above or add a new expense."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface">
          <table className="w-full min-w-130 text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                <th className="px-3.5 py-2.5 font-medium">Description</th>
                <th className="px-3.5 py-2.5 text-right font-medium">Total ARS</th>
                <th className="px-3.5 py-2.5 text-right font-medium">Total USD</th>
                <th className="px-3.5 py-2.5 text-right font-medium">
                  Installment
                </th>
                <th className="px-3.5 py-2.5 text-right font-medium">Start</th>
                <th className="px-3.5 py-2.5 text-right font-medium">
                  This Month
                </th>
                <th className="w-10 px-2 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {monthRows.map(({ expense, amount, amountUsd }) => (
                <tr
                  key={expense.id}
                  className="group border-b border-white/5 last:border-b-0"
                >
                  <td className="px-3.5 py-2.5 text-zinc-200">
                    {expense.description}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-zinc-100">
                    {expense.totalAmount > 0
                      ? formatMoney(expense.totalAmount, "ARS")
                      : "—"}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-zinc-100">
                    {expense.totalAmountUsd > 0
                      ? formatMoney(expense.totalAmountUsd, "$")
                      : "—"}
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-zinc-400">
                    {expense.installments === 1
                      ? "One-time"
                      : `${monthDiff(expense.startMonth, selectedMonth) + 1}/${expense.installments}`}
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-zinc-400">
                    {formatMonthLabel(expense.startMonth)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <AmountDisplay ars={amount} usd={amountUsd} className="items-end text-sm" />
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => deleteExpense(expense.id)}
                      aria-label={`Delete ${expense.description}`}
                      className="rounded px-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={onAddExpense}
        className="self-start rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: card.color }}
      >
        + Add Expense
      </button>
    </section>
  );
}
