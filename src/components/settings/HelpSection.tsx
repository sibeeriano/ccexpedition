import { useTranslation } from "react-i18next";
import { TutorialSection } from "./TutorialSection";

type HelpSectionProps = {
  demoMode: boolean;
  onStartTour: () => void;
};

export function HelpSection({ demoMode, onStartTour }: HelpSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">{t("profile.helpIntro")}</p>
      <TutorialSection demoMode={demoMode} onStartTour={onStartTour} />
    </div>
  );
}
