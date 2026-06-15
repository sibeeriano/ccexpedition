import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import type { TFunction } from "i18next";

export type TourContext = "empty" | "consolidated" | "card-detail";

const LEGACY_ONBOARDING_PREFIX = "ccexpedition-onboarding-";
const WELCOME_TOUR_PREFIX = "ccexpedition-tour-welcome-";
const CONSOLIDATED_TOUR_PREFIX = "ccexpedition-tour-consolidated-";
const CARD_DETAIL_TOUR_PREFIX = "ccexpedition-tour-card-detail-";

function isLegacyOnboardingDone(userId: string): boolean {
  return localStorage.getItem(`${LEGACY_ONBOARDING_PREFIX}${userId}`) === "done";
}

export function markWelcomeTourComplete(userId: string): void {
  localStorage.setItem(`${WELCOME_TOUR_PREFIX}${userId}`, "done");
}

export function hasCompletedWelcomeTour(userId: string): boolean {
  return (
    localStorage.getItem(`${WELCOME_TOUR_PREFIX}${userId}`) === "done" ||
    isLegacyOnboardingDone(userId)
  );
}

export function hasCompletedConsolidatedTour(userId: string): boolean {
  return (
    localStorage.getItem(`${CONSOLIDATED_TOUR_PREFIX}${userId}`) === "done" ||
    isLegacyOnboardingDone(userId)
  );
}

export function hasCompletedCardDetailTour(userId: string): boolean {
  return localStorage.getItem(`${CARD_DETAIL_TOUR_PREFIX}${userId}`) === "done";
}

export function resetOnboarding(userId: string): void {
  localStorage.removeItem(`${LEGACY_ONBOARDING_PREFIX}${userId}`);
  localStorage.removeItem(`${WELCOME_TOUR_PREFIX}${userId}`);
  localStorage.removeItem(`${CONSOLIDATED_TOUR_PREFIX}${userId}`);
  localStorage.removeItem(`${CARD_DETAIL_TOUR_PREFIX}${userId}`);
  localStorage.removeItem("ccexpedition-tour-add-expense-" + userId);
}

function step(
  selector: string | undefined,
  title: string,
  description: string,
  side: "top" | "bottom" | "left" | "right" = "bottom",
): DriveStep {
  if (!selector) {
    return { popover: { title, description, side } };
  }
  return {
    element: selector,
    popover: { title, description, side },
  };
}

function visibleSteps(steps: DriveStep[]): DriveStep[] {
  return steps.filter((s) => {
    if (!s.element) return true;
    const el =
      typeof s.element === "string"
        ? document.querySelector(s.element)
        : s.element;
    return Boolean(el);
  });
}

let activeTourKey: string | null = null;
let activeDriver: Driver | null = null;
let completeOnDestroy = true;

export function isTourActive(): boolean {
  return activeTourKey !== null;
}

/** Stops the current tour. Pass `complete: true` only when the user finished it normally. */
export function destroyActiveTour(complete = false): void {
  completeOnDestroy = complete;
  if (activeDriver?.isActive()) {
    activeDriver.destroy();
    return;
  }
  activeTourKey = null;
  activeDriver = null;
  completeOnDestroy = true;
}

type RunTourOptions = {
  force?: boolean;
};

function runTour(
  t: TFunction,
  tourKey: string,
  steps: DriveStep[],
  onComplete: () => void,
  options?: RunTourOptions,
): void {
  if (!options?.force && isTourActive()) return;

  const visible = visibleSteps(steps);
  if (visible.length === 0) return;

  activeTourKey = tourKey;
  completeOnDestroy = true;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayOpacity: 0.72,
    stagePadding: 10,
    stageRadius: 10,
    allowClose: true,
    nextBtnText: t("onboarding.next"),
    prevBtnText: t("onboarding.prev"),
    doneBtnText: t("onboarding.done"),
    progressText: t("onboarding.progress"),
    steps: visible,
    onDestroyed: () => {
      if (completeOnDestroy) onComplete();
      activeTourKey = null;
      activeDriver = null;
      completeOnDestroy = true;
    },
  });

  activeDriver = driverObj;
  driverObj.drive();
}

function buildWelcomeTourSteps(t: TFunction): DriveStep[] {
  return [
    step(undefined, t("onboarding.welcome.title"), t("onboarding.welcome.body")),
    step(
      '[data-tour="empty-add-card"]',
      t("onboarding.empty.title"),
      t("onboarding.empty.body"),
      "top",
    ),
    step(
      '[data-tour="add-card"]',
      t("onboarding.addCard.title"),
      t("onboarding.addCard.body"),
      "bottom",
    ),
    step(
      '[data-tour="language-toggle"]',
      t("onboarding.language.title"),
      t("onboarding.language.body"),
      "bottom",
    ),
    step(
      '[data-tour="settings"]',
      t("onboarding.settings.title"),
      t("onboarding.settings.body"),
      "bottom",
    ),
  ];
}

function buildConsolidatedTourSteps(t: TFunction): DriveStep[] {
  return [
    step(
      undefined,
      t("onboarding.consolidatedTour.welcome.title"),
      t("onboarding.consolidatedTour.welcome.body"),
    ),
    step(
      '[data-tour="card-list"]',
      t("onboarding.cardList.title"),
      t("onboarding.cardList.body"),
      "bottom",
    ),
    step(
      '[data-tour="budget-alert"]',
      t("onboarding.consolidated.title"),
      t("onboarding.consolidated.body"),
      "bottom",
    ),
    step(
      '[data-tour="consolidated-table"]',
      t("onboarding.table.title"),
      t("onboarding.table.body"),
      "top",
    ),
    step(
      '[data-tour="paid-row"]',
      t("onboarding.paidRow.title"),
      t("onboarding.paidRow.body"),
      "top",
    ),
    step(
      undefined,
      t("onboarding.payments.title"),
      t("onboarding.payments.body"),
    ),
    step(
      '[data-tour="export-csv"]',
      t("onboarding.exportCsv.title"),
      t("onboarding.exportCsv.body"),
      "top",
    ),
    step(
      '[data-tour="add-card"]',
      t("onboarding.addCard.title"),
      t("onboarding.addCard.body"),
      "bottom",
    ),
    step(
      undefined,
      t("onboarding.consolidatedTour.nextCard.title"),
      t("onboarding.consolidatedTour.nextCard.body"),
    ),
  ];
}

function buildCardDetailTourSteps(t: TFunction): DriveStep[] {
  return [
    step(
      undefined,
      t("onboarding.cardDetailTour.welcome.title"),
      t("onboarding.cardDetailTour.welcome.body"),
    ),
    step(
      '[data-tour="month-bar"]',
      t("onboarding.cardDetailTour.monthBar.title"),
      t("onboarding.cardDetailTour.monthBar.body"),
      "bottom",
    ),
    step(
      '[data-tour="import-xlsx"]',
      t("onboarding.cardDetailTour.import.title"),
      t("onboarding.cardDetailTour.import.body"),
      "bottom",
    ),
    step(
      '[data-tour="add-expense"]',
      t("onboarding.cardDetailTour.addExpense.title"),
      t("onboarding.cardDetailTour.addExpense.body"),
      "top",
    ),
    step(
      '[data-tour="add-adjustment"]',
      t("onboarding.cardDetailTour.addAdjustment.title"),
      t("onboarding.cardDetailTour.addAdjustment.body"),
      "top",
    ),
    step(
      '[data-tour="card-expense-list"]',
      t("onboarding.cardDetailTour.expenseList.title"),
      t("onboarding.cardDetailTour.expenseList.body"),
      "top",
    ),
    step(
      undefined,
      t("onboarding.cardDetailTour.edit.title"),
      t("onboarding.cardDetailTour.edit.body"),
    ),
  ];
}

export function replayTourForContext(
  t: TFunction,
  userId: string,
  context: TourContext,
): void {
  destroyActiveTour(false);

  window.setTimeout(() => {
    switch (context) {
      case "empty":
        startWelcomeTour(t, userId, { force: true });
        break;
      case "consolidated":
        startConsolidatedTour(t, userId, { force: true });
        break;
      case "card-detail":
        startCardDetailTour(t, userId, { force: true });
        break;
    }
  }, 250);
}

export function startWelcomeTour(
  t: TFunction,
  userId: string,
  options?: { force?: boolean },
): void {
  if (!options?.force && hasCompletedWelcomeTour(userId)) return;

  runTour(
    t,
    `welcome:${userId}`,
    buildWelcomeTourSteps(t),
    () => {
      markWelcomeTourComplete(userId);
    },
    options,
  );
}

export function startConsolidatedTour(
  t: TFunction,
  userId: string,
  options?: { force?: boolean },
): void {
  if (!options?.force && hasCompletedConsolidatedTour(userId)) return;

  runTour(
    t,
    `consolidated:${userId}`,
    buildConsolidatedTourSteps(t),
    () => {
      localStorage.setItem(`${CONSOLIDATED_TOUR_PREFIX}${userId}`, "done");
    },
    options,
  );
}

export function startCardDetailTour(
  t: TFunction,
  userId: string,
  options?: { force?: boolean },
): void {
  if (!options?.force && hasCompletedCardDetailTour(userId)) return;
  if (!options?.force && !hasCompletedConsolidatedTour(userId)) return;

  runTour(
    t,
    `card-detail:${userId}`,
    buildCardDetailTourSteps(t),
    () => {
      localStorage.setItem(`${CARD_DETAIL_TOUR_PREFIX}${userId}`, "done");
    },
    options,
  );
}
