import type { CurrencySymbol, MonthlyIncomeEntry } from "../types";
import type { UserUsdExchangeCasa } from "./usdExchange";
import {
  DEFAULT_USER_USD_EXCHANGE_CASA,
  isUserUsdExchangeCasa,
} from "./usdExchange";
import type { AppLanguage } from "../i18n";
import i18n from "../i18n";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_BUDGET_ALERT_COLOR,
  DEFAULT_CARD_COLUMN_COLOR,
  DEFAULT_TAB_DASHBOARD_COLOR,
  DEFAULT_TAB_DASHBOARD_TEXT_COLOR,
  DEFAULT_TAB_FUTURE_COLOR,
  DEFAULT_TAB_FUTURE_TEXT_COLOR,
  DEFAULT_TAB_NEWS_COLOR,
  DEFAULT_TAB_NEWS_TEXT_COLOR,
  DEFAULT_TAB_PROFILE_COLOR,
  DEFAULT_TAB_PROFILE_TEXT_COLOR,
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
  cardColumnColor: string;
  showPreviousMonths: boolean;
  showPaidRow: boolean;
  monthlyIncomeByMonth: Record<string, MonthlyIncomeEntry>;
  backgroundColor: string;
  titleColor: string;
  titleText: string;
  language: AppLanguage;
  tabFutureColor: string;
  tabFutureTextColor: string;
  tabNewsColor: string;
  tabNewsTextColor: string;
  tabDashboardColor: string;
  tabDashboardTextColor: string;
  tabProfileColor: string;
  tabProfileTextColor: string;
  /** When true, show USD amounts with ARS equivalent and add converted USD to ARS totals. */
  convertUsdToArs: boolean;
  /** ArgentinaDatos dollar rate used for USD→ARS conversion. */
  usdExchangeCasa: UserUsdExchangeCasa;
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
    cardColumnColor: DEFAULT_CARD_COLUMN_COLOR,
    showPreviousMonths: true,
    showPaidRow: true,
    monthlyIncomeByMonth: {},
    backgroundColor: DEFAULT_BACKGROUND,
    titleColor: DEFAULT_TITLE_COLOR,
    titleText: DEFAULT_WORKSPACE_TITLE,
    language: i18n.language === "es" ? "es" : "en",
    tabFutureColor: DEFAULT_TAB_FUTURE_COLOR,
    tabFutureTextColor: DEFAULT_TAB_FUTURE_TEXT_COLOR,
    tabNewsColor: DEFAULT_TAB_NEWS_COLOR,
    tabNewsTextColor: DEFAULT_TAB_NEWS_TEXT_COLOR,
    tabDashboardColor: DEFAULT_TAB_DASHBOARD_COLOR,
    tabDashboardTextColor: DEFAULT_TAB_DASHBOARD_TEXT_COLOR,
    tabProfileColor: DEFAULT_TAB_PROFILE_COLOR,
    tabProfileTextColor: DEFAULT_TAB_PROFILE_TEXT_COLOR,
    convertUsdToArs: false,
    usdExchangeCasa: DEFAULT_USER_USD_EXCHANGE_CASA,
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
    cardColumnColor: isValidHexColor(parsed.cardColumnColor ?? "")
      ? parsed.cardColumnColor!
      : defaults.cardColumnColor,
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
    tabFutureColor: isValidHexColor(parsed.tabFutureColor ?? "")
      ? parsed.tabFutureColor!
      : defaults.tabFutureColor,
    tabFutureTextColor: isValidHexColor(parsed.tabFutureTextColor ?? "")
      ? parsed.tabFutureTextColor!
      : defaults.tabFutureTextColor,
    tabNewsColor: isValidHexColor(parsed.tabNewsColor ?? "")
      ? parsed.tabNewsColor!
      : defaults.tabNewsColor,
    tabNewsTextColor: isValidHexColor(parsed.tabNewsTextColor ?? "")
      ? parsed.tabNewsTextColor!
      : defaults.tabNewsTextColor,
    tabDashboardColor: isValidHexColor(parsed.tabDashboardColor ?? "")
      ? parsed.tabDashboardColor!
      : defaults.tabDashboardColor,
    tabDashboardTextColor: isValidHexColor(parsed.tabDashboardTextColor ?? "")
      ? parsed.tabDashboardTextColor!
      : defaults.tabDashboardTextColor,
    tabProfileColor: isValidHexColor(parsed.tabProfileColor ?? "")
      ? parsed.tabProfileColor!
      : defaults.tabProfileColor,
    tabProfileTextColor: isValidHexColor(parsed.tabProfileTextColor ?? "")
      ? parsed.tabProfileTextColor!
      : defaults.tabProfileTextColor,
    convertUsdToArs: parsed.convertUsdToArs === true,
    usdExchangeCasa: isUserUsdExchangeCasa(parsed.usdExchangeCasa)
      ? parsed.usdExchangeCasa
      : defaults.usdExchangeCasa,
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

/** Recupera personalización local si la nube quedó con valores por defecto. */
export function reconcileAppSettings(
  remote: Partial<AppSettings> | null | undefined,
  local: AppSettings,
): { settings: AppSettings; shouldSyncToRemote: boolean } {
  const defaults = getDefaultSettings();
  const fromRemote = parseAppSettings(remote ?? {});
  const merged: Partial<AppSettings> = { ...fromRemote };
  let shouldSyncToRemote = false;

  const keys = Object.keys(defaults) as (keyof AppSettings)[];
  for (const key of keys) {
    if (key === "monthlyIncomeByMonth") {
      merged.monthlyIncomeByMonth = {
        ...local.monthlyIncomeByMonth,
        ...fromRemote.monthlyIncomeByMonth,
      };
      continue;
    }

    const remoteValue = fromRemote[key];
    const localValue = local[key];
    const defaultValue = defaults[key];

    if (remoteValue === defaultValue && localValue !== defaultValue) {
      merged[key] = localValue as never;
      shouldSyncToRemote = true;
    }
  }

  return { settings: parseAppSettings(merged), shouldSyncToRemote };
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
