import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { getOutstandingDebt } from "../utils/expenses";
import { getMonthsRange } from "../utils/months";
import { getCardChipStyle, hasCardBackground } from "../utils/theme";
import { AmountDisplay } from "./AmountDisplay";

export const ALL_CARDS_VIEW = "all";

type CardListProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CardList({ selectedId, onSelect }: CardListProps) {
  const { t } = useTranslation();
  const { state } = useApp();

  const monthsRange = useMemo(
    () =>
      getMonthsRange(
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
      ),
    [state.expenses, state.balanceAdjustments, state.pendingCarryovers],
  );

  const debtByCard = useMemo(() => {
    const map = new Map<string, { ars: number; usd: number }>();
    for (const card of state.cards) {
      map.set(
        card.id,
        getOutstandingDebt(
          [card.id],
          monthsRange,
          state.expenses,
          state.balanceAdjustments,
          state.pendingCarryovers,
          state.monthlyPayments,
        ),
      );
    }
    return map;
  }, [
    state.cards,
    monthsRange,
    state.expenses,
    state.balanceAdjustments,
    state.pendingCarryovers,
    state.monthlyPayments,
  ]);

  const grandDebt = useMemo(
    () =>
      getOutstandingDebt(
        state.cards.map((card) => card.id),
        monthsRange,
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
        state.monthlyPayments,
      ),
    [
      state.cards,
      monthsRange,
      state.expenses,
      state.balanceAdjustments,
      state.pendingCarryovers,
      state.monthlyPayments,
    ],
  );

  const isAllSelected = selectedId === ALL_CARDS_VIEW;

  return (
    <div
      data-tour="card-list"
      className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1"
    >
      <button
        type="button"
        onClick={() => onSelect(ALL_CARDS_VIEW)}
        className={`flex shrink-0 flex-col gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
          isAllSelected
            ? "border-white/40 bg-surface"
            : "border-white/5 bg-transparent hover:bg-surface/60"
        }`}
      >
        <span className="text-sm font-medium text-white">
          {t("cardList.allCards")}
        </span>
        <span className="text-xs text-zinc-400">
          {t("cardList.consolidated")}
        </span>
        <AmountDisplay
          ars={grandDebt.ars}
          usd={grandDebt.usd}
          className="text-sm text-zinc-100"
        />
      </button>

      {state.cards.map((card) => {
        const isSelected = card.id === selectedId;
        const debt = debtByCard.get(card.id) ?? { ars: 0, usd: 0 };
        const customBg = hasCardBackground(card);

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`flex shrink-0 flex-col gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
              isSelected
                ? customBg
                  ? "border-transparent"
                  : "border-transparent bg-surface"
                : customBg
                  ? "border-white/5 hover:brightness-110"
                  : "border-white/5 bg-transparent hover:bg-surface/60"
            }`}
            style={getCardChipStyle(card, { selected: isSelected })}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: card.color }}
              />
              <span className="text-sm font-medium text-white">
                {card.name}
              </span>
            </span>
            <span className="text-xs text-zinc-400">{card.holder}</span>
            <AmountDisplay
              ars={debt.ars}
              usd={debt.usd}
              className="text-sm text-zinc-100"
            />
          </button>
        );
      })}
    </div>
  );
}
