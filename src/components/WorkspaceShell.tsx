import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConsolidatedTour } from "../hooks/useConsolidatedTour";
import { useWorkspaceNavigation } from "../hooks/useWorkspaceNavigation";
import { useDemoMode } from "../context/DemoModeContext";
import { Navbar } from "./Navbar";
import { CardList, ALL_CARDS_VIEW } from "./CardList";
import { CardDetail } from "./CardDetail";
import { ConsolidatedView } from "./ConsolidatedView";
import { AddCardModal } from "./AddCardModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { ImportModal } from "./ImportModal";
import { DevSignature } from "./DevSignature";
import { LanguageToggle } from "./LanguageToggle";
import { DemoBanner } from "./DemoBanner";
import { ThankYouBanner } from "./ThankYouBanner";
import { NewsView } from "./NewsView";
import { DashboardView } from "./DashboardView";
import { ProfileView } from "./ProfileView";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatTimestamp } from "../utils/format";
import {
  destroyActiveTour,
  hasCompletedWelcomeTour,
  markWelcomeTourComplete,
  startWelcomeTour,
} from "../utils/onboarding";

const TOUR_START_DELAY_MS = 150;

type WorkspaceShellProps = {
  demoMode?: boolean;
};

export function WorkspaceShell({ demoMode = false }: WorkspaceShellProps) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { state } = useApp();
  const { exitDemo, goToSignUp } = useDemoMode();
  const {
    isNewsView,
    isDashboardView,
    isProfileView,
    newsSlug,
    openNewsList,
    openNewsPost,
    openDashboard,
    openProfile,
    backToWorkspace,
  } = useWorkspaceNavigation(demoMode);
  const [selectedView, setSelectedView] = useState<string>(ALL_CARDS_VIEW);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const selectedCard =
    selectedView === ALL_CARDS_VIEW
      ? null
      : (state.cards.find((card) => card.id === selectedView) ?? null);

  const appReady = !state.loading && (demoMode || Boolean(session));
  const hasCards = state.cards.length > 0;
  const isConsolidatedView = hasCards && !selectedCard;
  const [justAddedFirstCard, setJustAddedFirstCard] = useState(false);
  const prevCardCount = useRef(state.cards.length);
  const tourStartedRef = useRef(false);
  const userId = demoMode ? undefined : session?.user.id;

  useEffect(() => {
    const prev = prevCardCount.current;
    const next = state.cards.length;
    if (prev === 0 && next > 0) {
      setSelectedView(ALL_CARDS_VIEW);
      setJustAddedFirstCard(true);
      if (userId) {
        markWelcomeTourComplete(userId);
        destroyActiveTour(false);
        tourStartedRef.current = false;
      }
    }
    prevCardCount.current = next;
  }, [state.cards.length, userId]);

  useEffect(() => {
    if (
      !userId ||
      !appReady ||
      demoMode ||
      hasCards ||
      tourStartedRef.current ||
      hasCompletedWelcomeTour(userId)
    ) {
      return;
    }

    tourStartedRef.current = true;
    destroyActiveTour(false);

    const timer = window.setTimeout(() => {
      startWelcomeTour(t, userId);
    }, TOUR_START_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [userId, appReady, demoMode, hasCards, t]);

  useEffect(() => {
    if (!justAddedFirstCard || !isConsolidatedView) return;
    const timer = window.setTimeout(() => setJustAddedFirstCard(false), 3000);
    return () => window.clearTimeout(timer);
  }, [justAddedFirstCard, isConsolidatedView]);

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
        demoMode={demoMode}
        onExitDemo={exitDemo}
        onSignUp={goToSignUp}
      />

      <main className="relative z-0 mx-auto flex w-full min-w-0 max-w-5xl shrink-0 grow flex-col gap-5 px-4 py-5">
        {isNewsView ? (
          <NewsView
            slug={newsSlug}
            onBack={backToWorkspace}
            onOpenPost={openNewsPost}
          />
        ) : isDashboardView ? (
          <DashboardView onBack={backToWorkspace} />
        ) : isProfileView ? (
          <ProfileView onBack={backToWorkspace} demoMode={demoMode} />
        ) : state.cards.length === 0 ? (
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
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <button
                type="button"
                onClick={openProfile}
                data-tour="profile-link"
                className="cursor-pointer text-sm font-semibold text-brand-accent transition-colors hover:text-brand-accent/80"
              >
                {t("profile.cta")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <button
                type="button"
                onClick={openNewsList}
                className="cursor-pointer text-sm font-semibold text-brand-accent transition-colors hover:text-brand-accent/80"
              >
                {t("news.cta")}
              </button>
              <button
                type="button"
                onClick={openDashboard}
                className="cursor-pointer text-sm font-semibold text-brand-accent transition-colors hover:text-brand-accent/80"
              >
                {t("dashboard.cta")}
              </button>
              <button
                type="button"
                onClick={openProfile}
                data-tour="profile-link"
                className="cursor-pointer text-sm font-semibold text-brand-accent transition-colors hover:text-brand-accent/80"
              >
                {t("profile.cta")}
              </button>
            </div>
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

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 pb-5 text-center text-xs text-zinc-600">
        {!demoMode && <ThankYouBanner />}
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
