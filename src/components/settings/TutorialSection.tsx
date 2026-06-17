import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import {
  replayTourForContext,
  type TourContext,
} from "../../utils/onboarding";

const TUTORIAL_OPTIONS: {
  context: TourContext;
  titleKey: string;
  hintKey: string;
}[] = [
  {
    context: "empty",
    titleKey: "settings.repeatTutorialEmpty",
    hintKey: "profile.tutorialEmptyHint",
  },
  {
    context: "consolidated",
    titleKey: "settings.repeatTutorialConsolidated",
    hintKey: "profile.tutorialConsolidatedHint",
  },
  {
    context: "card-detail",
    titleKey: "settings.repeatTutorialCardDetail",
    hintKey: "profile.tutorialCardDetailHint",
  },
];

type TutorialSectionProps = {
  demoMode?: boolean;
  onStartTour: () => void;
};

export function TutorialSection({
  demoMode = false,
  onStartTour,
}: TutorialSectionProps) {
  const { t } = useTranslation();
  const { session } = useAuth();

  function handleReplay(context: TourContext) {
    const userId = session?.user.id;
    if (!userId || demoMode) return;
    onStartTour();
    replayTourForContext(t, userId, context);
  }

  if (demoMode) {
    return (
      <p className="text-sm text-zinc-400">{t("profile.tutorialDemoHint")}</p>
    );
  }

  if (!session?.user.id) {
    return (
      <p className="text-sm text-zinc-400">{t("profile.tutorialSignInHint")}</p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-white/10">
      {TUTORIAL_OPTIONS.map((option) => (
        <li key={option.context} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm font-medium text-zinc-200">{t(option.titleKey)}</p>
            <p className="mt-1 text-xs text-zinc-500">{t(option.hintKey)}</p>
          </div>
          <button
            type="button"
            onClick={() => handleReplay(option.context)}
            className="self-start rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            {t("profile.startTutorial")}
          </button>
        </li>
      ))}
    </ul>
  );
}
