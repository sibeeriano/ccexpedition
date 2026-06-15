import type { CurrencySymbol, MonthlyIncomeEntry } from "../types";
import type { AppLanguage } from "../i18n";
import i18n from "../i18n";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_BUDGET_ALERT_COLOR,
  DEFAULT_TITLE_COLOR,
  DEFAULT_WORKSPACE_TITLE,
  isValidHexColor,
  normalizeWorkspaceTitle,
} from "./theme";

const SETTINGS_KEY_PREFIX = "ccexpedition-settings";
const LEGACY_SETTINGS_KEY = "ccexpedition-settings";
const LEGACY_STATE_KEY = "ccexpedition-state";

const CURRENCIES: CurrencySymbol[] = ["$", "€", "ARS"];

export type AppSettings = {
  currency: CurrencySymbol;
  /** 0 = alert disabled */
  budgetAlert: number;
  budgetAlertColor: string;
  showPreviousMonths: boolean;
  showPaidRow: boolean;
  monthlyIncomeByMonth: Record<string, MonthlyIncomeEntry>;
  backgroundColor: string;
  titleColor: string;
  titleText: string;
  language: AppLanguage;
};

export function settingsStorageKey(userId: string | null): string {
  return userId
    ? `${SETTINGS_KEY_PREFIX}-${userId}`
    : `${SETTINGS_KEY_PREFIX}-guest`;
}

export function getDefaultSettings(): AppSettings {
  return {
    currency: "$",
    budgetAlert: 0,
    budgetAlertColor: DEFAULT_BUDGET_ALERT_COLOR,
    showPreviousMonths: true,
    showPaidRow: true,
    monthlyIncomeByMonth: {},
    backgroundColor: DEFAULT_BACKGROUND,
    titleColor: DEFAULT_TITLE_COLOR,
    titleText: DEFAULT_WORKSPACE_TITLE,
    language: i18n.language === "es" ? "es" : "en",
  };
}

export function parseAppSettings(
  parsed: Partial<AppSettings>,
  options: { migratingLegacyForUser?: boolean } = {},
): AppSettings {
  const defaults = getDefaultSettings();
  return {
    currency: CURRENCIES.includes(parsed.currency as CurrencySymbol)
      ? (parsed.currency as CurrencySymbol)
      : defaults.currency,
    budgetAlert:
      typeof parsed.budgetAlert === "number" && parsed.budgetAlert >= 0
        ? parsed.budgetAlert
        : defaults.budgetAlert,
    budgetAlertColor: isValidHexColor(parsed.budgetAlertColor ?? "")
      ? parsed.budgetAlertColor!
      : defaults.budgetAlertColor,
    showPreviousMonths: parsed.showPreviousMonths !== false,
    showPaidRow: parsed.showPaidRow !== false,
    monthlyIncomeByMonth: parseMonthlyIncomeByMonth(parsed.monthlyIncomeByMonth),
    backgroundColor: isValidHexColor(parsed.backgroundColor ?? "")
      ? parsed.backgroundColor!
      : defaults.backgroundColor,
    titleColor: isValidHexColor(parsed.titleColor ?? "")
      ? parsed.titleColor!
      : defaults.titleColor,
    titleText: options.migratingLegacyForUser
      ? defaults.titleText
      : typeof parsed.titleText === "string"
        ? normalizeWorkspaceTitle(parsed.titleText)
        : defaults.titleText,
    language:
      parsed.language === "en" || parsed.language === "es"
        ? parsed.language
        : defaults.language,
  };
}

export function loadSettingsFromLocalStorage(userId: string | null): AppSettings {
  try {
    const key = settingsStorageKey(userId);
    const hadSavedUserSettings = Boolean(localStorage.getItem(key));
    let raw = localStorage.getItem(key);
    const migratingLegacyForUser = Boolean(userId) && !hadSavedUserSettings;

    if (!raw && userId) {
      raw =
        localStorage.getItem(LEGACY_SETTINGS_KEY) ??
        JSON.stringify(
          JSON.parse(localStorage.getItem(LEGACY_STATE_KEY) ?? "{}").settings ??
            {},
        );
    }

    if (!raw) return getDefaultSettings();

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return parseAppSettings(parsed, { migratingLegacyForUser });
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettingsToLocalStorage(
  userId: string | null,
  settings: AppSettings,
): void {
  localStorage.setItem(settingsStorageKey(userId), JSON.stringify(settings));
}

export function settingsSnapshot(value: AppSettings): string {
  return JSON.stringify(value);
}

function parseMonthlyIncomeByMonth(
  raw: unknown,
): Record<string, MonthlyIncomeEntry> {
  if (!raw || typeof raw !== "object") return {};

  const result: Record<string, MonthlyIncomeEntry> = {};
  for (const [month, entry] of Object.entries(
    raw as Record<string, unknown>,
  )) {
    if (!/^\d{4}-\d{2}$/.test(month)) continue;
    const parsed = entry as Partial<MonthlyIncomeEntry>;
    if (typeof parsed.amount !== "number" || !Number.isFinite(parsed.amount)) {
      continue;
    }
    result[month] = {
      amount: Math.max(0, parsed.amount),
      confirmed: parsed.confirmed === true,
    };
  }
  return result;
}
