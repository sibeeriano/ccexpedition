import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

export type AppLanguage = "en" | "es";

const SETTINGS_KEY = "ccexpedition-settings";

function detectInitialLanguage(): AppLanguage {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { language?: string };
      if (parsed.language === "en" || parsed.language === "es") {
        return parsed.language;
      }
    }
  } catch {
    // fall through
  }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
