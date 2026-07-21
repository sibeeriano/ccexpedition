import { useTranslation } from "react-i18next";
import type { AppSettings } from "../../utils/settings";
import type { VisualTheme } from "../../utils/theme";

type ProfileSummaryProps = {
  draft: AppSettings;
  cardCount: number;
};

function themeLabelKey(theme: VisualTheme): string {
  switch (theme) {
    case "win95":
      return "settings.themeRetro";
    case "neobrutalism":
      return "settings.themeNeobrutalism";
    case "liquidGlass":
      return "settings.themeLiquidGlass";
    default:
      return "settings.themeExpedition";
  }
}

export function ProfileSummary({ draft, cardCount }: ProfileSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="panel-surface px-4 py-3 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {t("profile.settingsSummary")}
      </p>
      <p className="mt-1 text-sm text-zinc-200">
        {t(themeLabelKey(draft.visualTheme))} · {draft.currency} ·{" "}
        {draft.language === "es" ? t("settings.languageEs") : t("settings.languageEn")} ·{" "}
        {t("profile.cardCount", { count: cardCount })}
      </p>
    </div>
  );
}
