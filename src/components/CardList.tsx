import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { getOutstandingDebt } from "../utils/expenses";
import { getRegularCards } from "../utils/cards";
import { getMonthsRange } from "../utils/months";
import {
  getCardChipStyle,
  hasEffectiveCardBackground,
  isLiquidGlassTheme,
  isNeobrutalismTheme,
  isWin95Theme,
  GLASS_ALL_CARDS_CHIP_BG,
  GLASS_BORDER,
  GLASS_SHADOW,
  NEO_ALL_CARDS_CHIP_BG,
  NEO_SHADOW,
  RETRO_ALL_CARDS_CHIP_BG,
} from "../utils/theme";
import { AmountDisplay } from "./AmountDisplay";

export const ALL_CARDS_VIEW = "all";

type CardListProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CardList({ selectedId, onSelect }: CardListProps) {
  const { t } = useTranslation();
  const { state } = useApp();
  const visualTheme = state.settings.visualTheme;
  const isWin95 = isWin95Theme(visualTheme);
  const isNeo = isNeobrutalismTheme(visualTheme);
  const isGlass = isLiquidGlassTheme(visualTheme);

  const monthsRange = useMemo(
    () =>
      getMonthsRange(
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
      ),
    [state.expenses, state.balanceAdjustments, state.pendingCarryovers],
  );

  const regularCards = useMemo(
    () => getRegularCards(state.cards),
    [state.cards],
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
        regularCards.map((card) => card.id),
        monthsRange,
        state.expenses,
        state.balanceAdjustments,
        state.pendingCarryovers,
        state.monthlyPayments,
      ),
    [
      regularCards,
      monthsRange,
      state.expenses,
      state.balanceAdjustments,
      state.pendingCarryovers,
      state.monthlyPayments,
    ],
  );

  const isAllSelected = selectedId === ALL_CARDS_VIEW;
  const firstCardRef = useRef<HTMLButtonElement>(null);
  const [chipSize, setChipSize] = useState<{ width: number; height: number }>();

  useLayoutEffect(() => {
    const el = firstCardRef.current;
    if (!el) {
      setChipSize(undefined);
      return;
    }

    function measure() {
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      setChipSize({ width: Math.ceil(width), height: Math.ceil(height) });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [state.cards]);

  const chipStyle = chipSize
    ? {
        width: chipSize.width,
        minWidth: chipSize.width,
        maxWidth: chipSize.width,
        height: chipSize.height,
        minHeight: chipSize.height,
      }
    : undefined;

  const chipClass =
    "flex shrink-0 flex-col gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors";

  const allCardsStyle = {
    ...chipStyle,
    ...(isWin95 && isAllSelected
      ? { backgroundColor: RETRO_ALL_CARDS_CHIP_BG }
      : undefined),
    ...(isNeo && isAllSelected
      ? {
          backgroundColor: NEO_ALL_CARDS_CHIP_BG,
          border: "2px solid #000",
          boxShadow: isAllSelected ? "2px 2px 0 0 #000" : NEO_SHADOW,
        }
      : isNeo
        ? { border: "2px solid #000", boxShadow: NEO_SHADOW }
        : undefined),
    ...(isGlass
      ? {
          backgroundColor: isAllSelected
            ? "rgba(255, 255, 255, 0.82)"
            : GLASS_ALL_CARDS_CHIP_BG,
          border: `1px solid ${GLASS_BORDER}`,
          boxShadow: GLASS_SHADOW,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }
      : undefined),
  };

  return (
    <div
      data-tour="card-list"
      className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1"
    >
      <button
        type="button"
        onClick={() => onSelect(ALL_CARDS_VIEW)}
        style={allCardsStyle}
        className={`${chipClass} ${
          isWin95
            ? isAllSelected
              ? "card-chip--retro-all border-[#808080]"
              : "border-white/5 bg-transparent hover:bg-[#dfdfdf]/60"
            : isNeo
              ? isAllSelected
                ? "card-chip--neo card-chip--neo-selected"
                : "card-chip--neo bg-white hover:translate-x-px hover:translate-y-px"
              : isGlass
                ? isAllSelected
                  ? "card-chip--glass card-chip--glass-selected"
                  : "card-chip--glass hover:bg-white/70"
                : isAllSelected
                  ? "border-white/40 bg-surface"
                  : "border-white/5 bg-transparent hover:bg-surface/60"
        }`}
      >
        <span className="truncate text-sm font-medium text-white">
          {t("cardList.allCards")}
        </span>
        <span className="truncate text-xs text-zinc-400">
          {t("cardList.consolidated")}
        </span>
        <AmountDisplay
          ars={grandDebt.ars}
          usd={grandDebt.usd}
          className="truncate text-sm text-zinc-100"
        />
      </button>

      {state.cards.map((card, index) => {
        const isSelected = card.id === selectedId;
        const debt = debtByCard.get(card.id) ?? { ars: 0, usd: 0 };
        const customBg = hasEffectiveCardBackground(card, visualTheme);

        return (
          <button
            key={card.id}
            ref={index === 0 ? firstCardRef : undefined}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`${chipClass} ${
              customBg ? "card-chip--custom-bg " : ""
            }${
              isWin95
                ? isSelected
                  ? "card-chip--retro border-[#808080]"
                  : "border-white/5 hover:brightness-95"
                : isNeo
                  ? isSelected
                    ? "card-chip--neo card-chip--neo-selected"
                    : "card-chip--neo hover:translate-x-px hover:translate-y-px"
                  : isGlass
                    ? isSelected
                      ? "card-chip--glass card-chip--glass-selected"
                      : "card-chip--glass hover:bg-white/70"
                    : isSelected
                      ? customBg
                        ? "border-transparent"
                        : "border-transparent bg-surface"
                      : customBg
                        ? "border-white/5 hover:brightness-110"
                        : "border-white/5 bg-transparent hover:bg-surface/60"
            }`}
            style={{
              ...chipStyle,
              ...getCardChipStyle(card, { selected: isSelected, visualTheme }),
            }}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: card.color }}
              />
              <span className="truncate text-sm font-medium text-white">
                {card.name}
              </span>
            </span>
            <span className="truncate text-xs text-zinc-400">{card.holder}</span>
            <AmountDisplay
              ars={debt.ars}
              usd={debt.usd}
              className="truncate text-sm text-zinc-100"
            />
          </button>
        );
      })}
    </div>
  );
}
