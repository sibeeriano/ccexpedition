import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "./hooks/useOnboarding";
import { Navbar } from "./components/Navbar";
import { CardList, ALL_CARDS_VIEW } from "./components/CardList";
import { CardDetail } from "./components/CardDetail";
import { ConsolidatedView } from "./components/ConsolidatedView";
import { AddCardModal } from "./components/AddCardModal";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { SettingsModal } from "./components/SettingsModal";
import { ImportModal } from "./components/ImportModal";
import { DevSignature } from "./components/DevSignature";
import { Login } from "./components/Login";
import { useApp } from "./context/AppContext";
import { useAuth } from "./context/AuthContext";
import { formatTimestamp } from "./utils/format";

function App() {
  const { t } = useTranslation();
  const { session, loading: authLoading } = useAuth();
  const { state } = useApp();
  const [selectedView, setSelectedView] = useState<string>(ALL_CARDS_VIEW);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const selectedCard =
    selectedView === ALL_CARDS_VIEW
      ? null
      : (state.cards.find((card) => card.id === selectedView) ?? null);

  useOnboarding({
    userId: session?.user.id,
    ready: !authLoading && !state.loading && Boolean(session),
  });

  if (authLoading || state.loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
        <DevSignature />
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

      <main className="relative z-0 mx-auto flex w-full min-w-0 max-w-5xl shrink-0 grow flex-col gap-5 px-4 py-5">
        {state.cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-16 text-center">
            <p className="text-sm font-medium text-zinc-300">
              {t("app.noCardsTitle")}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">
              {t("app.noCardsHint")}
            </p>
            <button
              type="button"
              data-tour="empty-add-card"
              onClick={() => setIsAddCardOpen(true)}
              className="mt-4 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              {t("nav.addCard")}
            </button>
          </div>
        ) : (
          <>
            <CardList
              selectedId={selectedCard?.id ?? ALL_CARDS_VIEW}
              onSelect={setSelectedView}
            />
            <div className="min-w-0 shrink-0">
              {selectedCard ? (
                <CardDetail
                  card={selectedCard}
                  onAddExpense={() => setIsAddExpenseOpen(true)}
                />
              ) : (
                <ConsolidatedView onImport={() => setIsImportOpen(true)} />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1 px-4 pb-5 text-center text-xs text-zinc-600">
        {state.lastUpdated && (
          <span>
            {t("app.lastUpdated", {
              date: formatTimestamp(state.lastUpdated),
            })}
          </span>
        )}
        <DevSignature />
      </footer>

      {isAddCardOpen && <AddCardModal onClose={() => setIsAddCardOpen(false)} />}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
      {isImportOpen && (
        <ImportModal onClose={() => setIsImportOpen(false)} />
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
