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
  return "es";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

// Keep resources in sync when locale JSON hot-reloads in dev.
if (import.meta.hot) {
  import.meta.hot.accept("./locales/es.json", (mod) => {
    if (mod?.default) {
      i18n.addResourceBundle("es", "translation", mod.default, true, true);
    }
  });
  import.meta.hot.accept("./locales/en.json", (mod) => {
    if (mod?.default) {
      i18n.addResourceBundle("en", "translation", mod.default, true, true);
    }
  });
}

export default i18n;
