import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { AmountDisplay } from "./AmountDisplay";
import { MonthSelectField } from "./MonthSelectField";
import {
  CategoryPieChart,
  colorForCategoryIndex,
  type PieSlice,
} from "./CategoryPieChart";
import {
  getCategoryBreakdownForMonth,
  getMonthTotalsByPaymentType,
  monthHasExpenseData,
  UNCATEGORIZED_KEY,
  type CategoryMonthSummary,
} from "../utils/categoryDashboard";
import {
  formatMonthLong,
  formatMoney,
  getCurrentMonth,
  primaryMonthTotal,
} from "../utils/format";
import { getMonthsRange } from "../utils/months";

type DashboardViewProps = {
  onBack: () => void;
};

type CategoryDetailSectionProps = {
  category: CategoryMonthSummary;
  color: string;
  expanded: boolean;
  onToggle: () => void;
};

function CategoryDetailSection({
  category,
  color,
  expanded,
  onToggle,
}: CategoryDetailSectionProps) {
  const panelId = `dashboard-category-${category.categoryKey}`;

  return (
    <article className="panel-surface overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <h3 className="truncate text-base font-semibold text-white">
            {category.categoryName}
          </h3>
          <span className="shrink-0 text-xs text-zinc-500">
            ({category.expenses.length})
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right text-sm font-semibold text-white">
            <AmountDisplay ars={category.ars} usd={category.usd} inline />
          </div>
          <span
            aria-hidden
            className={`text-xs text-zinc-500 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <ul
          id={panelId}
          className="divide-y divide-white/5 border-t border-white/10"
        >
          {category.expenses.map((expense) => (
            <li
              key={`${category.categoryKey}-${expense.expenseId}`}
              className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {expense.description}
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {expense.cardName}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm text-white">
                <AmountDisplay ars={expense.ars} usd={expense.usd} inline />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function DashboardView({ onBack }: DashboardViewProps) {
  const { t } = useTranslation();
  const { state } = useApp();
  const currentMonth = getCurrentMonth();

  const monthsRange = useMemo(
    () =>
      getMonthsRange(
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
      ),
    [state.expenses, state.balanceAdjustments, state.pendingCarryovers],
  );

  const defaultMonth = useMemo(() => {
    if (monthsRange.includes(currentMonth)) return currentMonth;
    const withData = monthsRange.filter((month) =>
      monthHasExpenseData(month, state.expenses),
    );
    return withData.at(-1) ?? monthsRange[0] ?? currentMonth;
  }, [monthsRange, currentMonth, state.expenses]);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedKeys(new Set());
  }, [selectedMonth]);

  function toggleCategory(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const uncategorizedLabel = t("dashboard.uncategorized");
  const summaries = useMemo(
    () =>
      getCategoryBreakdownForMonth(
        selectedMonth,
        state.expenses,
        state.expenseCategories,
        state.cards,
        uncategorizedLabel,
      ),
    [
      selectedMonth,
      state.expenses,
      state.expenseCategories,
      state.cards,
      uncategorizedLabel,
    ],
  );

  const monthTotals = useMemo(
    () => getMonthTotalsByPaymentType(selectedMonth, state.expenses),
    [selectedMonth, state.expenses],
  );

  const pieCurrency = primaryMonthTotal(
    monthTotals.total.ars,
    monthTotals.total.usd,
  ).currency;
  const pieSlices: PieSlice[] = summaries.map((item, index) => ({
    key: item.categoryKey,
    label: item.categoryName,
    value: item.chartValue,
    percent: item.share,
    formattedValue: formatMoney(item.chartValue, pieCurrency),
    color:
      item.categoryKey === UNCATEGORIZED_KEY
        ? "#64748b"
        : colorForCategoryIndex(index),
  }));

  const hasData = summaries.length > 0;

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer self-start text-xs text-zinc-500 transition-colors hover:text-zinc-200"
        >
          ← {t("dashboard.backToApp")}
        </button>
        <h1 className="text-lg font-bold text-white sm:text-xl">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-zinc-400">{t("dashboard.subtitle")}</p>
      </div>

      <div className="panel-surface flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-2 sm:max-w-xs">
          <label
            htmlFor="dashboard-month"
            className="text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            {t("dashboard.selectMonth")}
          </label>
          <MonthSelectField
            id="dashboard-month"
            value={selectedMonth}
            options={monthsRange}
            currentMonth={currentMonth}
            onChange={setSelectedMonth}
          />
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {formatMonthLong(selectedMonth)}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("dashboard.monthTotal")}
              </p>
              <div className="mt-1 text-xl font-bold text-white sm:text-2xl">
                <AmountDisplay
                  ars={monthTotals.total.ars}
                  usd={monthTotals.total.usd}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("dashboard.installmentsTotal")}
              </p>
              <div className="mt-1 text-xl font-bold text-white sm:text-2xl">
                <AmountDisplay ars={monthTotals.installments.ars} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("dashboard.oneTimeTotal")}
              </p>
              <div className="mt-1 text-xl font-bold text-white sm:text-2xl">
                <AmountDisplay ars={monthTotals.oneTime.ars} />
              </div>
            </div>
          </div>
        </div>

        {!hasData ? (
          <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
            {t("dashboard.noExpenses")}
          </p>
        ) : (
          <div className="flex justify-center py-2">
            <CategoryPieChart slices={pieSlices} />
          </div>
        )}
      </div>

      {hasData && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t("dashboard.detailTitle")}
          </h2>

          {summaries.map((category, index) => (
            <CategoryDetailSection
              key={category.categoryKey}
              category={category}
              color={
                category.categoryKey === UNCATEGORIZED_KEY
                  ? "#64748b"
                  : colorForCategoryIndex(index)
              }
              expanded={expandedKeys.has(category.categoryKey)}
              onToggle={() => toggleCategory(category.categoryKey)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
