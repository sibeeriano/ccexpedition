import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import type { TFunction } from "i18next";

const STORAGE_PREFIX = "ccexpedition-onboarding-";

export function hasCompletedOnboarding(userId: string): boolean {
  return localStorage.getItem(`${STORAGE_PREFIX}${userId}`) === "done";
}

export function markOnboardingComplete(userId: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, "done");
}

export function resetOnboarding(userId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
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

export function buildOnboardingSteps(t: TFunction): DriveStep[] {
  return visibleSteps([
    step(undefined, t("onboarding.welcome.title"), t("onboarding.welcome.body")),
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
      '[data-tour="import-xlsx"]',
      t("onboarding.import.title"),
      t("onboarding.import.body"),
      "bottom",
    ),
    step(
      '[data-tour="add-card"]',
      t("onboarding.addCard.title"),
      t("onboarding.addCard.body"),
      "bottom",
    ),
    step(
      '[data-tour="settings"]',
      t("onboarding.settings.title"),
      t("onboarding.settings.body"),
      "bottom",
    ),
    step(
      '[data-tour="month-bar"]',
      t("onboarding.monthBar.title"),
      t("onboarding.monthBar.body"),
      "bottom",
    ),
    step(
      '[data-tour="add-expense"]',
      t("onboarding.addExpense.title"),
      t("onboarding.addExpense.body"),
      "top",
    ),
    step(
      undefined,
      t("onboarding.cardDetail.title"),
      t("onboarding.cardDetail.body"),
    ),
    step(
      '[data-tour="empty-add-card"]',
      t("onboarding.empty.title"),
      t("onboarding.empty.body"),
      "top",
    ),
  ]);
}

let activeTourUserId: string | null = null;

export function replayOnboardingTour(t: TFunction, userId: string): void {
  activeTourUserId = null;
  startOnboardingTour(t, userId, { force: true });
}

export function startOnboardingTour(
  t: TFunction,
  userId: string,
  options?: { force?: boolean },
): void {
  if (!options?.force && activeTourUserId === userId) return;

  const steps = buildOnboardingSteps(t);
  if (steps.length === 0) return;

  activeTourUserId = userId;

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
    steps,
    onDestroyed: () => {
      markOnboardingComplete(userId);
      activeTourUserId = null;
    },
  });

  driverObj.drive();
}
