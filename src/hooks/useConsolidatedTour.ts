import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  hasCompletedConsolidatedTour,
  isTourActive,
  startConsolidatedTour,
} from "../utils/onboarding";

type UseConsolidatedTourOptions = {
  userId: string | null | undefined;
  ready: boolean;
  enabled: boolean;
  delayMs?: number;
};

/** Stage 2: consolidated view (after the user has at least one card). */
export function useConsolidatedTour({
  userId,
  ready,
  enabled,
  delayMs = 700,
}: UseConsolidatedTourOptions): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId || !ready || !enabled || hasCompletedConsolidatedTour(userId)) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isTourActive()) return;
      startConsolidatedTour(t, userId);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [userId, ready, enabled, delayMs, t]);
}
