import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  hasCompletedOnboarding,
  startOnboardingTour,
} from "../utils/onboarding";

type UseOnboardingOptions = {
  userId: string | null | undefined;
  ready: boolean;
};

export function useOnboarding({ userId, ready }: UseOnboardingOptions): void {
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId || !ready || hasCompletedOnboarding(userId)) return;

    const timer = window.setTimeout(() => {
      startOnboardingTour(t, userId);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [userId, ready, t]);
}
