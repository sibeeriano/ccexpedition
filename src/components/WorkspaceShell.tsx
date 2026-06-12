import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConsolidatedTour } from "../hooks/useConsolidatedTour";
import { useWelcomeTour } from "../hooks/useOnboarding";
import { useDemoMode } from "../context/DemoModeContext";
import { Navbar } from "./Navbar";
import { CardList, ALL_CARDS_VIEW } from "./CardList";
import { CardDetail } from "./CardDetail";
import { ConsolidatedView } from "./ConsolidatedView";
import { AddCardModal } from "./AddCardModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { SettingsModal } from "./SettingsModal";
import { ImportModal } from "./ImportModal";
import { DevSignature } from "./DevSignature";
import { LanguageToggle } from "./LanguageToggle";
import { DemoBanner } from "./DemoBanner";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatTimestamp } from "../utils/format";
import {
  destroyActiveTour,
  markWelcomeTourComplete,
  type TourContext,
} from "../utils/onboarding";

type WorkspaceShellProps = {
  demoMode?: boolean;
};

export function WorkspaceShell({ demoMode = false }: WorkspaceShellProps) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { state } = useApp();
  const { exitDemo, goToSignUp } = useDemoMode();
  const [selectedView, setSelectedView] = useState<string>(ALL_CARDS_VIEW);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const selectedCard =
    selectedView === ALL_CARDS_VIEW
      ? null
      : (state.cards.find((card) => card.id === selectedView) ?? null);

  const tourContext: TourContext =
    state.cards.length === 0
      ? "empty"
      : selectedCard
        ? "card-detail"
        : "consolidated";

  const appReady = !state.loading && (demoMode || Boolean(session));
  const hasCards = state.cards.length > 0;
  const isConsolidatedView = hasCards && !selectedCard;
  const [justAddedFirstCard, setJustAddedFirstCard] = useState(false);
  const prevCardCount = useRef(state.cards.length);

  useEffect(() => {
    const prev = prevCardCount.current;
    const next = state.cards.length;
    if (prev === 0 && next > 0) {
      setSelectedView(ALL_CARDS_VIEW);
      setJustAddedFirstCard(true);
      const userId = session?.user.id;
      if (userId && !demoMode) {
        markWelcomeTourComplete(userId);
        destroyActiveTour(false);
      }
    }
    prevCardCount.current = next;
  }, [state.cards.length, session?.user.id, demoMode]);

  useEffect(() => {
    if (!justAddedFirstCard || !isConsolidatedView) return;
    const timer = window.setTimeout(() => setJustAddedFirstCard(false), 3000);
    return () => window.clearTimeout(timer);
  }, [justAddedFirstCard, isConsolidatedView]);

  useWelcomeTour({
    userId: demoMode ? undefined : session?.user.id,
    ready: appReady && !demoMode,
    hasCards,
  });

  useConsolidatedTour({
    userId: demoMode ? undefined : session?.user.id,
    ready: appReady && !demoMode,
    enabled: isConsolidatedView && !demoMode,
    delayMs: justAddedFirstCard ? 900 : 700,
  });

  if (!appReady) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
        <DevSignature />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {demoMode && <DemoBanner />}
      <Navbar
        onAddCard={() => setIsAddCardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        demoMode={demoMode}
        onExitDemo={exitDemo}
        onSignUp={goToSignUp}
      />

      <main className="relative z-0 mx-auto flex w-full min-w-0 max-w-5xl shrink-0 grow flex-col gap-5 px-4 py-5">
        {state.cards.length === 0 ? (
          <div className="panel-surface flex flex-col items-center px-6 py-12 text-center sm:py-16">
            <img
              src="/gatito1.png"
              alt=""
              className="mb-6 h-36 w-auto max-w-full object-contain sm:h-40"
            />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t("app.noCardsTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/80">
              {t("app.noCardsHint")}
            </p>
            <button
              type="button"
              data-tour="empty-add-card"
              onClick={() => setIsAddCardOpen(true)}
              className="btn-primary mt-8 px-6 py-2.5 text-sm sm:text-base"
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
                  onImport={() => setIsImportOpen(true)}
                  tourPaused={isAddExpenseOpen}
                />
              ) : (
                <ConsolidatedView />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 pb-5 text-center text-xs text-zinc-600">
        <LanguageToggle className="sm:hidden" />
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
        <SettingsModal
          tourContext={tourContext}
          onClose={() => setIsSettingsOpen(false)}
        />
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
