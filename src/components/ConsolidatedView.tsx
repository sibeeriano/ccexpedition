import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import {
  getAdjustmentsForCardMonth,
  getCarryoverForCardMonth,
  getMonthlyBreakdown,
  getMonthlyTotalByCard,
  getMonthlyTotalUsdByCard,
} from "../utils/expenses";
import { AmountDisplay } from "./AmountDisplay";
import { PaidMonthCell } from "./PaidMonthCell";
import { addMonths, filterMonthsForDisplay, getMonthsRange, monthDiff } from "../utils/months";
import { formatMonthLabel, getCurrentMonth } from "../utils/format";
import { Modal } from "./Modal";
import { BudgetExceededNotice } from "./BudgetExceededNotice";

type CellPopover = {
  cardId: string;
  month: string;
  x: number;
  y: number;
};

export function ConsolidatedView() {
  const { t } = useTranslation();
  const { state, setBudgetAlert, flushSettingsPersist } = useApp();
  const { currency, budgetAlert, showPreviousMonths, showPaidRow } =
    state.settings;
  const currentMonth = getCurrentMonth();
  const nextMonth = addMonths(currentMonth, 1);
  const [popover, setPopover] = useState<CellPopover | null>(null);
  const [exportComingSoonOpen, setExportComingSoonOpen] = useState(false);

  const isNextMonthColumn = (month: string) => month === nextMonth;

  useEffect(() => {
    if (!popover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopover(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popover]);

  const monthsRange = filterMonthsForDisplay(
    getMonthsRange(
      state.expenses,
      state.balanceAdjustments,
      state.pendingCarryovers,
    ),
    showPreviousMonths,
  );
  const showNextMonthColumn = monthsRange.includes(nextMonth);

  const rows = state.cards.map((card) => ({
    card,
    totals: monthsRange.map((month) =>
      getMonthlyTotalByCard(
        card.id,
        month,
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
      ),
    ),
    totalsUsd: monthsRange.map((month) =>
      getMonthlyTotalUsdByCard(
        card.id,
        month,
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
      ),
    ),
  }));

  const grandTotals = monthsRange.map((_, i) => {
    const sum = rows.reduce((acc, row) => acc + row.totals[i], 0);
    return Math.round(sum * 100) / 100;
  });

  const grandTotalsUsd = monthsRange.map((_, i) => {
    const sum = rows.reduce((acc, row) => acc + row.totalsUsd[i], 0);
    return Math.round(sum * 100) / 100;
  });

  const isOverBudget = grandTotals.map(
    (total) => budgetAlert > 0 && total > budgetAlert,
  );
  const overBudgetMonths = monthsRange.filter((_, index) => isOverBudget[index]);

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const tableInnerRef = useRef<HTMLDivElement>(null);
  const nextMonthColumnRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const inner = tableInnerRef.current;
    const marker = nextMonthColumnRef.current;
    if (!inner || !marker || !showNextMonthColumn) return;

    const scrollWrap = tableWrapRef.current;

    function updateMarker() {
      const th = inner?.querySelector<HTMLElement>(
        `th[data-month="${nextMonth}"]`,
      );
      const cardHeader = inner?.querySelector<HTMLElement>("thead th:first-child");
      if (!th || !marker || !inner) {
        if (marker) marker.style.display = "none";
        return;
      }
      marker.style.display = "block";
      marker.style.left = `${th.offsetLeft}px`;
      marker.style.width = `${th.offsetWidth}px`;
      marker.style.height = `${inner.offsetHeight}px`;

      // Keep the frame behind the sticky card column when scrolled horizontally.
      const stickyWidth = cardHeader?.offsetWidth ?? 0;
      const overlap = stickyWidth - (th.offsetLeft - (scrollWrap?.scrollLeft ?? 0));
      marker.style.clipPath =
        overlap > 0
          ? `inset(0 0 0 ${Math.min(overlap, th.offsetWidth)}px)`
          : "none";
    }

    updateMarker();
    const observer = new ResizeObserver(updateMarker);
    observer.observe(inner);
    const table = inner.querySelector("table");
    if (table) observer.observe(table);
    scrollWrap?.addEventListener("scroll", updateMarker, { passive: true });
    window.addEventListener("resize", updateMarker);
    return () => {
      observer.disconnect();
      scrollWrap?.removeEventListener("scroll", updateMarker);
      window.removeEventListener("resize", updateMarker);
    };
  }, [
    nextMonth,
    showNextMonthColumn,
    monthsRange.length,
    rows.length,
    state.cards.length,
  ]);

  useEffect(() => {
    if (
      initialScrollDone.current ||
      state.loading ||
      !monthsRange.includes(currentMonth)
    ) {
      return;
    }

    function scrollCurrentMonthToSecondColumn() {
      const wrap = tableWrapRef.current;
      if (!wrap) return;
      const monthHeader = wrap.querySelector<HTMLElement>(
        `th[data-month="${currentMonth}"]`,
      );
      const cardHeader = wrap.querySelector<HTMLElement>("thead th:first-child");
      if (!monthHeader || !cardHeader) return;
      wrap.scrollLeft = Math.max(
        0,
        monthHeader.offsetLeft - cardHeader.offsetWidth,
      );
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollCurrentMonthToSecondColumn();
        initialScrollDone.current = true;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentMonth, state.loading, monthsRange.join(",")]);

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
  const popoverAdjustments =
    popover && popoverCard
      ? getAdjustmentsForCardMonth(
          popover.cardId,
          popover.month,
          state.balanceAdjustments,
        )
      : [];
  const popoverCarryover =
    popover && popoverCard
      ? getCarryoverForCardMonth(
          popover.cardId,
          popover.month,
          state.pendingCarryovers,
        )
      : null;

  return (
    <section className="flex w-full min-w-0 shrink-0 flex-col gap-4">
      {/* Toolbar */}
      <div data-tour="consolidated-toolbar" className="flex flex-wrap items-center gap-3">
        <label
          data-tour="budget-alert"
          className="flex items-center gap-2 text-xs font-medium text-zinc-400"
        >
          {t("consolidated.budgetAlert")}
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
              onBlur={flushSettingsPersist}
              className="w-24 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </span>
        </label>
      </div>

      {/* Consolidated table */}
      <div className="w-full min-w-0 rounded-lg bg-surface">
        <div
          ref={tableWrapRef}
          data-tour="consolidated-table"
          className="consolidated-table-scroll min-w-0"
        >
        <div ref={tableInnerRef} className="relative w-max min-w-full">
          {showNextMonthColumn && (
            <div
              ref={nextMonthColumnRef}
              className="pointer-events-none absolute top-0 z-0 box-border border border-white/40"
              aria-hidden
            />
          )}
          <table className="relative z-[1] w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-zinc-500">
              <th className="sticky left-0 z-20 border-r border-white/5 bg-surface px-3.5 py-2.5 text-left font-medium">
                {t("consolidated.card")}
              </th>
              {monthsRange.map((month) => (
                <th
                  key={month}
                  data-month={month}
                  className={`px-3.5 py-2.5 text-right font-medium whitespace-nowrap ${
                    isNextMonthColumn(month)
                      ? "text-zinc-100"
                      : month < currentMonth
                        ? "text-zinc-600"
                        : "text-zinc-400"
                  }`}
                >
                  {formatMonthLabel(month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ card, totals, totalsUsd }) => (
              <tr key={card.id} className="border-b border-white/5">
                <td className="sticky left-0 z-20 border-r border-white/5 bg-surface px-3.5 py-2.5">
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
                    className="px-1.5 py-1 text-right"
                  >
                    <button
                      type="button"
                      onClick={(e) =>
                        toggleCellPopover(e, card.id, monthsRange[i])
                      }
                      aria-label={t("consolidated.cellDetails", {
                        card: card.name,
                        month: formatMonthLabel(monthsRange[i]),
                      })}
                      className={`flex w-full flex-col items-end rounded px-2 py-1.5 transition-colors hover:bg-white/5 ${
                        monthsRange[i] < currentMonth
                          ? "text-zinc-500"
                          : "text-zinc-100"
                      }`}
                    >
                      <AmountDisplay
                        ars={total}
                        usd={totalsUsd[i]}
                        className="items-end text-sm"
                      />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-white/[0.06] bg-white/[0.03]">
              <td className="sticky left-0 z-20 border-r border-white/5 bg-surface px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                {t("consolidated.totalAllCards")}
              </td>
              {grandTotals.map((total, i) => (
                <td
                  key={monthsRange[i]}
                  className={`px-3 py-1.5 text-right ${
                    isOverBudget[i]
                      ? "bg-budget-alert-fill"
                      : "bg-white/[0.03]"
                  } ${
                    monthsRange[i] < currentMonth
                      ? "text-zinc-400"
                      : "text-zinc-100"
                  }`}
                >
                  <AmountDisplay
                    ars={total}
                    usd={grandTotalsUsd[i]}
                    className="items-end text-sm font-medium"
                  />
                </td>
              ))}
            </tr>
            {showPaidRow && (
            <tr data-tour="paid-row" className="border-t border-white/10">
              <td className="sticky left-0 z-20 border-r border-white/5 bg-surface px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {t("payment.paidRow")}
              </td>
              {monthsRange.map((month) => (
                <PaidMonthCell
                  key={month}
                  month={month}
                  cards={state.cards}
                />
              ))}
            </tr>
          )}
          </tbody>
        </table>
        </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {budgetAlert > 0 && overBudgetMonths.length > 0 ? (
          <BudgetExceededNotice
            months={overBudgetMonths}
            budgetAlert={budgetAlert}
            currency={currency}
          />
        ) : (
          <span aria-hidden />
        )}
        <button
          type="button"
          data-tour="export-csv"
          onClick={() => setExportComingSoonOpen(true)}
          className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          {t("consolidated.exportCsv")}
        </button>
      </div>

      {exportComingSoonOpen && (
        <Modal
          title={t("consolidated.exportComingSoon")}
          onClose={() => setExportComingSoonOpen(false)}
        >
          <div className="flex flex-col items-center gap-4 py-2">
            <img
              src="/gatito2.png"
              alt=""
              className="max-h-52 w-auto object-contain"
            />
            <p className="text-center text-sm text-zinc-400">
              {t("consolidated.exportComingSoonHint")}
            </p>
          </div>
        </Modal>
      )}

      {/* Cell detail popover */}
      {popover && popoverCard && (
        <div
          role="dialog"
          aria-label={t("consolidated.popoverLabel", {
            card: popoverCard.name,
            month: formatMonthLabel(popover.month),
          })}
          className="fixed z-30 w-72 -translate-x-1/2 rounded-lg border border-white/35 bg-surface p-3 shadow-xl"
          style={{ left: popover.x, top: popover.y }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: popoverCard.color }}
              />
              {popoverCard.name} — {formatMonthLabel(popover.month)}
            </p>
            <button
              type="button"
              onClick={() => setPopover(null)}
              aria-label={t("common.close")}
              className="rounded px-1.5 text-base leading-none text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
            >
              ×
            </button>
          </div>
            {popoverEntries.length === 0 &&
            popoverAdjustments.length === 0 &&
            !popoverCarryover ? (
              <p className="py-2 text-sm text-zinc-500">
                {t("consolidated.noExpensesThisMonth")}
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
                        {expense?.description ?? t("common.unknown")}
                        {expense && expense.installments > 1 && (
                          <span className="ml-1 text-xs text-zinc-500">
                            ({monthDiff(expense.startMonth, popover.month) + 1}/
                            {expense.installments})
                          </span>
                        )}
                      </span>
                      <AmountDisplay
                        ars={entry.amount}
                        usd={entry.amountUsd}
                        className="shrink-0 items-end text-sm"
                      />
                    </li>
                  );
                })}
                {popoverCarryover && (
                  <li className="flex items-center justify-between gap-3 border-b border-amber-500/10 py-1.5 text-sm last:border-b-0">
                    <span className="truncate text-amber-200">
                      {t("payment.pendingBalance")}
                      <span className="ml-1 text-xs text-amber-400/80">
                        ({formatMonthLabel(popoverCarryover.sourceMonth)})
                      </span>
                    </span>
                    <AmountDisplay
                      ars={popoverCarryover.amount}
                      usd={popoverCarryover.amountUsd}
                      className="shrink-0 items-end text-sm text-amber-200"
                    />
                  </li>
                )}
                {popoverAdjustments.map((adjustment) => (
                  <li
                    key={adjustment.id}
                    className="flex items-center justify-between gap-3 border-b border-emerald-500/10 py-1.5 text-sm last:border-b-0"
                  >
                    <span className="truncate text-emerald-200">
                      {adjustment.description}
                      <span className="ml-1 text-xs text-emerald-400/80">
                        (
                        {adjustment.type === "payment_advance"
                          ? t("balanceAdjustment.paymentAdvance")
                          : t("balanceAdjustment.creditBalance")}
                        )
                      </span>
                    </span>
                    <AmountDisplay
                      ars={-adjustment.amount}
                      usd={-adjustment.amountUsd}
                      className="shrink-0 items-end text-sm text-emerald-300"
                    />
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </section>
  );
}
