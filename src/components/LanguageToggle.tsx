import { useTranslation } from "react-i18next";
import { useApp, type AppLanguage } from "../context/AppContext";

const LANGUAGES: AppLanguage[] = ["es", "en"];

type LanguageToggleProps = {
  className?: string;
};

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { t } = useTranslation();
  const { state, setLanguage } = useApp();

  return (
    <div
      className={`flex shrink-0 rounded-md border border-white/10 bg-base p-0.5 ${className}`}
      role="group"
      aria-label={t("login.language")}
    >
      {LANGUAGES.map((lang) => {
        const isActive = state.settings.language === lang;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
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
