import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  hasCompletedWelcomeTour,
  isTourActive,
  startWelcomeTour,
} from "../utils/onboarding";

type UseWelcomeTourOptions = {
  userId: string | null | undefined;
  ready: boolean;
  hasCards: boolean;
};

/** Stage 1: welcome + add first card (empty state only). */
export function useWelcomeTour({
  userId,
  ready,
  hasCards,
}: UseWelcomeTourOptions): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId || !ready || hasCards || hasCompletedWelcomeTour(userId)) return;

    const timer = window.setTimeout(() => {
      if (isTourActive()) return;
      startWelcomeTour(t, userId);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [userId, ready, hasCards, t]);
}
