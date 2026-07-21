import { useTranslation } from "react-i18next";

export type SettingsSectionId =
  | "appearance"
  | "preferences"
  | "cards"
  | "account"
  | "help";

const SECTION_IDS: SettingsSectionId[] = [
  "appearance",
  "preferences",
  "cards",
  "account",
  "help",
];

type SettingsNavProps = {
  active: SettingsSectionId;
  onChange: (section: SettingsSectionId) => void;
};

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("profile.settingsNav")}
      className="flex gap-1 overflow-x-auto pb-1 lg:w-44 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {SECTION_IDS.map((sectionId) => {
        const isActive = sectionId === active;
        return (
          <button
            key={sectionId}
            type="button"
            onClick={() => onChange(sectionId)}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:w-full ${
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            {t(`profile.nav.${sectionId}`)}
          </button>
        );
      })}
    </nav>
  );
}
