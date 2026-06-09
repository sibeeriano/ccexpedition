import { useApp } from "../context/AppContext";
import { formatMoney } from "../utils/format";

export const ALL_CARDS_VIEW = "all";

type CardListProps = {
  selectedId: string; // card id or ALL_CARDS_VIEW
  onSelect: (id: string) => void;
};

export function CardList({ selectedId, onSelect }: CardListProps) {
  const { state } = useApp();
  const currency = state.settings.currency;

  // Total debt = sum of every expense's full amount (all installments).
  const totalDebtByCard = new Map<string, number>();
  for (const expense of state.expenses) {
    totalDebtByCard.set(
      expense.cardId,
      (totalDebtByCard.get(expense.cardId) ?? 0) + expense.totalAmount,
    );
  }
  const grandTotal = state.expenses.reduce(
    (sum, expense) => sum + expense.totalAmount,
    0,
  );

  const isAllSelected = selectedId === ALL_CARDS_VIEW;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
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
        <span className="font-mono text-sm text-zinc-100">
          {formatMoney(grandTotal, currency)}
        </span>
      </button>

      {state.cards.map((card) => {
        const isSelected = card.id === selectedId;
        const totalDebt = totalDebtByCard.get(card.id) ?? 0;

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
            <span className="font-mono text-sm text-zinc-100">
              {formatMoney(totalDebt, currency)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
