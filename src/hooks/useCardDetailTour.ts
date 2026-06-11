import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  hasCompletedCardDetailTour,
  hasCompletedConsolidatedTour,
  isTourActive,
  startCardDetailTour,
} from "../utils/onboarding";

type UseCardDetailTourOptions = {
  userId: string | null | undefined;
  paused?: boolean;
};

export function useCardDetailTour({
  userId,
  paused = false,
}: UseCardDetailTourOptions): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId || paused || hasCompletedCardDetailTour(userId)) return;
    if (!hasCompletedConsolidatedTour(userId)) return;

    const timer = window.setTimeout(() => {
      if (isTourActive()) return;
      startCardDetailTour(t, userId);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [userId, t, paused]);
}
