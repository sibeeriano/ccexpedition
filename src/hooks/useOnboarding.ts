import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  isTourActive,
  startWelcomeTour,
} from "../utils/onboarding";
import { shouldShowWelcomeTour } from "../utils/thankYou";

type UseWelcomeTourOptions = {
  userId: string | null | undefined;
  ready: boolean;
  hasCards: boolean;
  /** When true, the welcome tour is deferred (e.g. thank-you modal is open). */
  blocked?: boolean;
};

/** Stage 1: welcome + add first card (empty state only). */
export function useWelcomeTour({
  userId,
  ready,
  hasCards,
  blocked = false,
}: UseWelcomeTourOptions): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId || !ready || blocked || hasCards || !shouldShowWelcomeTour(userId))
      return;

    const timer = window.setTimeout(() => {
      if (isTourActive()) return;
      startWelcomeTour(t, userId);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [userId, ready, blocked, hasCards, t]);
}
