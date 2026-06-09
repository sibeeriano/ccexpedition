import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Modal } from "./Modal";

type SettingsModalProps = {
  onClose: () => void;
};

export function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <SettingsContent />
    </Modal>
  );
}

function SettingsContent() {
  const { state, deleteCard } = useApp();
  const [confirmCardId, setConfirmCardId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmCard =
    state.cards.find((card) => card.id === confirmCardId) ?? null;

  async function handleDelete() {
    if (!confirmCard || deleting) return;
    setDeleting(true);
    setError(null);
    const errorMessage = await deleteCard(confirmCard.id);
    setDeleting(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setConfirmCardId(null);
  }

  // Confirmation step
  if (confirmCard) {
    const expenseCount = state.expenses.filter(
      (e) => e.cardId === confirmCard.id,
    ).length;

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-300">
          Delete{" "}
          <span className="font-medium text-white">{confirmCard.name}</span> (
          {confirmCard.holder})?
        </p>
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          This will permanently remove the card and its {expenseCount}{" "}
          {expenseCount === 1 ? "expense" : "expenses"}. This cannot be undone.
        </p>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmCardId(null)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete Card"}
          </button>
        </div>
      </div>
    );
  }

  // Card list
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Cards
      </p>
      {state.cards.length === 0 ? (
        <p className="py-2 text-sm text-zinc-500">No cards yet.</p>
      ) : (
        <ul className="flex flex-col">
          {state.cards.map((card) => {
            const expenseCount = state.expenses.filter(
              (e) => e.cardId === card.id,
            ).length;

            return (
              <li
                key={card.id}
                className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5 last:border-b-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="truncate text-sm font-medium text-zinc-200">
                    {card.name}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {card.holder} · {expenseCount}{" "}
                    {expenseCount === 1 ? "expense" : "expenses"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmCardId(card.id)}
                  className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
