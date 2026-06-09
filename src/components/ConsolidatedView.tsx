import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { getMonthlyBreakdown, getMonthlyTotalByCard } from "../utils/expenses";
import { getMonthsRange, monthDiff } from "../utils/months";
import { buildExpensesCsv, downloadCsv } from "../utils/csv";
import { formatMoney, formatMonthLabel, getCurrentMonth } from "../utils/format";

type CellPopover = {
  cardId: string;
  month: string;
  x: number;
  y: number;
};

export function ConsolidatedView() {
  const { state, setBudgetAlert } = useApp();
  const { currency, budgetAlert } = state.settings;
  const currentMonth = getCurrentMonth();
  const [popover, setPopover] = useState<CellPopover | null>(null);

  useEffect(() => {
    if (!popover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopover(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popover]);

  const monthsRange = getMonthsRange(state.expenses);

  const rows = state.cards.map((card) => ({
    card,
    totals: monthsRange.map((month) =>
      getMonthlyTotalByCard(card.id, month, state.expenses),
    ),
  }));

  const grandTotals = monthsRange.map((_, i) => {
    const sum = rows.reduce((acc, row) => acc + row.totals[i], 0);
    return Math.round(sum * 100) / 100;
  });

  const isOverBudget = grandTotals.map(
    (total) => budgetAlert > 0 && total > budgetAlert,
  );

  function toggleCellPopover(
    e: React.MouseEvent<HTMLButtonElement>,
    cardId: string,
    month: string,
  ) {
    if (popover?.cardId === cardId && popover.month === month) {
      setPopover(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      cardId,
      month,
      x: Math.min(Math.max(rect.left + rect.width / 2, 144), window.innerWidth - 144),
      y: rect.bottom + 6,
    });
  }

  const popoverCard = popover
    ? state.cards.find((c) => c.id === popover.cardId)
    : null;
  const popoverEntries =
    popover && popoverCard
      ? (getMonthlyBreakdown(
          state.expenses.filter((e) => e.cardId === popover.cardId),
        ).get(popover.month) ?? [])
      : [];

  return (
    <section className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          Monthly budget alert:
          <span className="flex items-center gap-1 rounded-md border border-white/10 bg-surface px-2 py-1.5 focus-within:border-white/30">
            <span className="text-zinc-500">{currency}</span>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={budgetAlert > 0 ? budgetAlert : ""}
              onChange={(e) =>
                setBudgetAlert(Number.parseFloat(e.target.value) || 0)
              }
              className="w-24 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </span>
        </label>

        <button
          type="button"
          onClick={() =>
            downloadCsv(
              "card-tracker-export.csv",
              buildExpensesCsv(state.cards, state.expenses),
            )
          }
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          Export CSV
        </button>
      </div>

      {/* Consolidated table */}
      <div className="overflow-x-auto rounded-lg bg-surface">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-zinc-500">
              <th className="px-3.5 py-2.5 text-left font-medium">Card</th>
              {monthsRange.map((month, i) => (
                <th
                  key={month}
                  className={`px-3.5 py-2.5 text-right font-medium whitespace-nowrap ${
                    isOverBudget[i]
                      ? "bg-amber-500/5 text-amber-400"
                      : month === currentMonth
                        ? "text-zinc-200"
                        : ""
                  }`}
                >
                  {formatMonthLabel(month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ card, totals }) => (
              <tr key={card.id} className="border-b border-white/5">
                <td className="px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                    <span className="font-medium text-zinc-200">
                      {card.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {card.holder}
                    </span>
                  </span>
                </td>
                {totals.map((total, i) => (
                  <td
                    key={monthsRange[i]}
                    className={`px-1.5 py-1 text-right ${
                      isOverBudget[i] ? "bg-amber-500/5" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) =>
                        toggleCellPopover(e, card.id, monthsRange[i])
                      }
                      aria-label={`${card.name}, ${formatMonthLabel(monthsRange[i])}: ${formatMoney(total, currency)}. Show details`}
                      className="w-full rounded px-2 py-1.5 text-right font-mono whitespace-nowrap text-zinc-100 transition-colors hover:bg-white/5"
                    >
                      {formatMoney(total, currency)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Grand Total
              </td>
              {grandTotals.map((total, i) => (
                <td
                  key={monthsRange[i]}
                  className={`px-3.5 py-2.5 text-right font-mono font-semibold whitespace-nowrap ${
                    isOverBudget[i]
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-white"
                  }`}
                >
                  {formatMoney(total, currency)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {budgetAlert > 0 && isOverBudget.some(Boolean) && (
        <p className="text-xs text-amber-400/80">
          Highlighted months exceed your {formatMoney(budgetAlert, currency)}{" "}
          budget alert.
        </p>
      )}

      {/* Cell detail popover */}
      {popover && popoverCard && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setPopover(null)}
          />
          <div
            role="dialog"
            aria-label={`Expenses for ${popoverCard.name} in ${formatMonthLabel(popover.month)}`}
            className="fixed z-30 w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-surface p-3 shadow-xl"
            style={{ left: popover.x, top: popover.y }}
          >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: popoverCard.color }}
              />
              {popoverCard.name} — {formatMonthLabel(popover.month)}
            </p>
            {popoverEntries.length === 0 ? (
              <p className="py-2 text-sm text-zinc-500">
                No expenses this month.
              </p>
            ) : (
              <ul className="max-h-48 overflow-y-auto">
                {popoverEntries.map((entry) => {
                  const expense = state.expenses.find(
                    (e) => e.id === entry.expenseId,
                  );
                  return (
                    <li
                      key={entry.expenseId}
                      className="flex items-center justify-between gap-3 border-b border-white/5 py-1.5 text-sm last:border-b-0"
                    >
                      <span className="truncate text-zinc-300">
                        {expense?.description ?? "Unknown"}
                        {expense && expense.installments > 1 && (
                          <span className="ml-1 text-xs text-zinc-500">
                            ({monthDiff(expense.startMonth, popover.month) + 1}/
                            {expense.installments})
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-zinc-100">
                        {formatMoney(entry.amount, currency)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
