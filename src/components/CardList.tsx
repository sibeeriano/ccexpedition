import { useApp } from "../context/AppContext";
import { AmountDisplay } from "./AmountDisplay";

export const ALL_CARDS_VIEW = "all";

type CardListProps = {
  selectedId: string; // card id or ALL_CARDS_VIEW
  onSelect: (id: string) => void;
};

export function CardList({ selectedId, onSelect }: CardListProps) {
  const { state } = useApp();

  const debtByCard = new Map<string, { ars: number; usd: number }>();
  for (const expense of state.expenses) {
    const current = debtByCard.get(expense.cardId) ?? { ars: 0, usd: 0 };
    debtByCard.set(expense.cardId, {
      ars: current.ars + expense.totalAmount,
      usd: current.usd + expense.totalAmountUsd,
    });
  }

  const grandDebt = state.expenses.reduce(
    (acc, expense) => ({
      ars: acc.ars + expense.totalAmount,
      usd: acc.usd + expense.totalAmountUsd,
    }),
    { ars: 0, usd: 0 },
  );

  const isAllSelected = selectedId === ALL_CARDS_VIEW;

  return (
    <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onSelect(ALL_CARDS_VIEW)}
        className={`flex shrink-0 flex-col gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
          isAllSelected
            ? "border-white/40 bg-surface"
            : "border-white/5 bg-transparent hover:bg-surface/60"
        }`}
      >
        <span className="text-sm font-medium text-white">All Cards</span>
        <span className="text-xs text-zinc-400">Consolidated</span>
        <AmountDisplay
          ars={grandDebt.ars}
          usd={grandDebt.usd}
          className="text-sm text-zinc-100"
        />
      </button>

      {state.cards.map((card) => {
        const isSelected = card.id === selectedId;
        const debt = debtByCard.get(card.id) ?? { ars: 0, usd: 0 };

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`flex shrink-0 flex-col gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
              isSelected
                ? "border-transparent bg-surface"
                : "border-white/5 bg-transparent hover:bg-surface/60"
            }`}
            style={
              isSelected
                ? { boxShadow: `inset 0 0 0 1px ${card.color}` }
                : undefined
            }
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
