import { useTranslation } from "react-i18next";
import { useApp, type AppLanguage } from "../context/AppContext";

const LANGUAGES: AppLanguage[] = ["es", "en"];

type LanguageToggleProps = {
  className?: string;
  language?: AppLanguage;
  onLanguageChange?: (language: AppLanguage) => void;
};

export function LanguageToggle({
  className = "",
  language,
  onLanguageChange,
}: LanguageToggleProps) {
  const { t } = useTranslation();
  const { state, setLanguage } = useApp();
  const activeLanguage = language ?? state.settings.language;
  const handleLanguageChange = onLanguageChange ?? setLanguage;

  return (
    <div
      data-tour="language-toggle"
      className={`flex shrink-0 rounded-md border border-white/10 bg-base p-0.5 ${className}`}
      role="group"
      aria-label={t("login.language")}
    >
      {LANGUAGES.map((lang) => {
        const isActive = activeLanguage === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => handleLanguageChange(lang)}
            aria-pressed={isActive}
            aria-label={
              lang === "es"
                ? t("settings.languageEs")
                : t("settings.languageEn")
            }
            className={`min-w-9 rounded px-2 py-1 text-xs font-semibold tracking-wide transition-colors ${
              isActive
                ? "bg-white/15 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
