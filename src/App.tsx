import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { CardList, ALL_CARDS_VIEW } from "./components/CardList";
import { CardDetail } from "./components/CardDetail";
import { ConsolidatedView } from "./components/ConsolidatedView";
import { AddCardModal } from "./components/AddCardModal";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { SettingsModal } from "./components/SettingsModal";
import { Login } from "./components/Login";
import { useApp } from "./context/AppContext";
import { useAuth } from "./context/AuthContext";
import { formatTimestamp } from "./utils/format";

function App() {
  const { session, loading: authLoading } = useAuth();
  const { state } = useApp();
  // ALL_CARDS_VIEW (consolidated) is the default landing view.
  const [selectedView, setSelectedView] = useState<string>(ALL_CARDS_VIEW);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Falls back to consolidated view if the selected card was deleted.
  const selectedCard =
    selectedView === ALL_CARDS_VIEW
      ? null
      : (state.cards.find((card) => card.id === selectedView) ?? null);

  if (authLoading || state.loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar
        onAddCard={() => setIsAddCardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-5">
        {state.cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-16 text-center">
            <p className="text-sm font-medium text-zinc-300">No cards yet</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">
              Add your first credit card to start tracking purchases and
              installments month by month.
            </p>
            <button
              type="button"
              onClick={() => setIsAddCardOpen(true)}
              className="mt-4 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              + Add Card
            </button>
          </div>
        ) : (
          <>
            <CardList
              selectedId={selectedCard?.id ?? ALL_CARDS_VIEW}
              onSelect={setSelectedView}
            />
            {selectedCard ? (
              <CardDetail
                card={selectedCard}
                onAddExpense={() => setIsAddExpenseOpen(true)}
              />
            ) : (
              <ConsolidatedView />
            )}
          </>
        )}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-5 text-center text-xs text-zinc-600">
        {state.lastUpdated
          ? `Last updated: ${formatTimestamp(state.lastUpdated)}`
          : "Card Tracker — data stays on this device"}
      </footer>

      {isAddCardOpen && <AddCardModal onClose={() => setIsAddCardOpen(false)} />}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
      {isAddExpenseOpen && selectedCard && (
        <AddExpenseModal
          card={selectedCard}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
