import type { CSSProperties } from "react";

/** Landing + app default page background. */
export const DEFAULT_BACKGROUND = "#020617";
/** Panel / card surface on the expedition theme. */
export const DEFAULT_SURFACE = "#0a1628";
export const BRAND_ACCENT = "#03b1b5";
export const BRAND_CC_COLOR = "#ffa549";
export const DEFAULT_TITLE_COLOR = "#ffffff";
export const DEFAULT_BUDGET_ALERT_COLOR = "#ef4444";
/** Sticky card-name column in the all-cards grid. */
export const DEFAULT_CARD_COLUMN_COLOR = "#0e1c32";

/** Retro (Windows 95) palette — applied when retroTheme is enabled. */
export const RETRO_BACKGROUND = "#008080";
export const RETRO_SURFACE = "#c0c0c0";
export const RETRO_TITLE_COLOR = "#000000";
export const RETRO_BUDGET_ALERT_COLOR = "#800000";
/** Default sticky column (card / income / balance labels) in retro mode. */
export const RETRO_DEFAULT_CARD_COLUMN_COLOR = "#a0a0a0";
/** Total row sticky column in retro when using the default column color. */
export const RETRO_DEFAULT_CARD_COLUMN_TOTAL = "#888888";
/** Card list chip for «Todas las tarjetas». */
export const RETRO_ALL_CARDS_CHIP_BG = "#c0c0c0";
/** Card list chips for individual cards. */
export const RETRO_CARD_CHIP_BG = "#dfdfdf";
export const RETRO_TAB_COLOR = "#c0c0c0";
export const RETRO_TAB_TEXT_COLOR = "#000000";
export const RETRO_BRAND_ACCENT = "#000080";

/** Neobrutalism palette — inspired by neobrutalism.dev defaults. */
export const NEO_BACKGROUND = "#dfe5f2";
export const NEO_SURFACE = "#ffffff";
export const NEO_TITLE_COLOR = "#000000";
export const NEO_BUDGET_ALERT_COLOR = "#ef4444";
export const NEO_DEFAULT_CARD_COLUMN_COLOR = "#ffffff";
export const NEO_DEFAULT_CARD_COLUMN_TOTAL = "#f0f0f0";
export const NEO_ALL_CARDS_CHIP_BG = "#88aaee";
export const NEO_CARD_CHIP_BG = "#ffffff";
export const NEO_TAB_COLOR = "#fde047";
export const NEO_TAB_TEXT_COLOR = "#000000";
export const NEO_BRAND_ACCENT = "#88aaee";
export const NEO_BORDER_COLOR = "#000000";
export const NEO_SHADOW = "4px 4px 0 0 #000000";

/** Liquid Glass — inspired by Apple macOS 27 UI Kit (light). */
export const GLASS_BACKGROUND = "#c5d0e0";
export const GLASS_SURFACE = "#f4f7fb";
export const GLASS_TITLE_COLOR = "#1d1d1f";
export const GLASS_BUDGET_ALERT_COLOR = "#ff3b30";
export const GLASS_DEFAULT_CARD_COLUMN_COLOR = "#eef2f8";
export const GLASS_DEFAULT_CARD_COLUMN_TOTAL = "#e4eaf3";
export const GLASS_ALL_CARDS_CHIP_BG = "rgba(255, 255, 255, 0.72)";
export const GLASS_CARD_CHIP_BG = "rgba(255, 255, 255, 0.55)";
export const GLASS_TAB_COLOR = "rgba(255, 255, 255, 0.55)";
export const GLASS_TAB_TEXT_COLOR = "#1d1d1f";
export const GLASS_BRAND_ACCENT = "#007aff";
export const GLASS_BORDER = "rgba(255, 255, 255, 0.55)";
export const GLASS_SHADOW =
  "0 8px 32px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65)";
/**
 * Liquid Glass font stack: SF on Apple (-apple-system), Inter elsewhere.
 * Inter from Google Fonts — https://fonts.google.com/specimen/Inter
 * SF Pro is not self-hosted (Apple license); -apple-system resolves on macOS/iOS.
 */
export const GLASS_FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
export const GLASS_FONT_MONO =
  'ui-monospace, "SF Mono", "Inter", "Cascadia Mono", "Segoe UI Mono", Menlo, Consolas, monospace';

export type VisualTheme =
  | "expedition"
  | "win95"
  | "neobrutalism"
  | "liquidGlass";

const VISUAL_THEMES: VisualTheme[] = [
  "expedition",
  "win95",
  "neobrutalism",
  "liquidGlass",
];

const PRESET_CARD_COLUMN_DEFAULTS: Record<
  Exclude<VisualTheme, "expedition">,
  string
> = {
  win95: RETRO_DEFAULT_CARD_COLUMN_COLOR,
  neobrutalism: NEO_DEFAULT_CARD_COLUMN_COLOR,
  liquidGlass: GLASS_DEFAULT_CARD_COLUMN_COLOR,
};

export function parseVisualTheme(
  parsed: Partial<{ visualTheme?: string; retroTheme?: boolean }>,
): VisualTheme {
  if (
    parsed.visualTheme &&
    VISUAL_THEMES.includes(parsed.visualTheme as VisualTheme)
  ) {
    return parsed.visualTheme as VisualTheme;
  }
  if (parsed.retroTheme === true) return "win95";
  return "expedition";
}

export function isPresetVisualTheme(theme: VisualTheme): boolean {
  return theme !== "expedition";
}

export function isWin95Theme(theme: VisualTheme): boolean {
  return theme === "win95";
}

export function isNeobrutalismTheme(theme: VisualTheme): boolean {
  return theme === "neobrutalism";
}

export function isLiquidGlassTheme(theme: VisualTheme): boolean {
  return theme === "liquidGlass";
}

export function defaultCardColumnForTheme(theme: VisualTheme): string {
  if (theme === "expedition") return DEFAULT_CARD_COLUMN_COLOR;
  return PRESET_CARD_COLUMN_DEFAULTS[theme];
}
/** Fixed app brand — shown in navbar and login, not user-editable. */
export const BRAND_TITLE = "ccExpedition";
/** Fixed browser tab title — not user-editable. */
export const PAGE_TITLE = BRAND_TITLE;
/** Empty by default; each user sets their own workspace title in settings. */
export const DEFAULT_WORKSPACE_TITLE = "";
/** Legacy default before workspace titles were split from the brand. */
export const LEGACY_DEFAULT_TITLE_TEXT = "ccExpedition - Expense Tracker";
export const MAX_TITLE_TEXT_LENGTH = 80;

export type ColorPreset = { id: string; color: string };

export const BACKGROUND_PRESETS: ColorPreset[] = [
  { id: "expedition", color: DEFAULT_BACKGROUND },
  { id: "midnight", color: "#0f0f13" },
  { id: "slateBlue", color: "#0d1117" },
  { id: "purple", color: "#1a1025" },
  { id: "forest", color: "#0f1712" },
  { id: "warm", color: "#171310" },
  { id: "slate", color: "#141820" },
];

export function getSurfaceColor(baseHex: string): string {
  if (baseHex === DEFAULT_BACKGROUND) return DEFAULT_SURFACE;
  return deriveSurfaceColor(baseHex);
}

export const TITLE_PRESETS: ColorPreset[] = [
  { id: "white", color: DEFAULT_TITLE_COLOR },
  { id: "silver", color: "#d4d4d8" },
  { id: "gold", color: "#fbbf24" },
  { id: "sky", color: "#38bdf8" },
  { id: "mint", color: "#34d399" },
  { id: "rose", color: "#fb7185" },
];

export const CARD_COLOR_PRESETS: ColorPreset[] = [
  { id: "blue", color: "#3B82F6" },
  { id: "red", color: "#EF4444" },
  { id: "green", color: "#10B981" },
  { id: "amber", color: "#F59E0B" },
  { id: "purple", color: "#8B5CF6" },
  { id: "pink", color: "#EC4899" },
  { id: "cyan", color: "#06B6D4" },
  { id: "orange", color: "#F97316" },
];

export const CARD_BACKGROUND_PRESETS: ColorPreset[] = [
  { id: "blueTint", color: "#172554" },
  { id: "redTint", color: "#450a0a" },
  { id: "greenTint", color: "#052e16" },
  { id: "amberTint", color: "#451a03" },
  { id: "purpleTint", color: "#2e1065" },
  { id: "pinkTint", color: "#500724" },
  { id: "cyanTint", color: "#083344" },
  { id: "slateTint", color: "#1e293b" },
];

export const CARD_BACKGROUND_PRESETS_WIN95: ColorPreset[] = [
  { id: "grayLight", color: "#dfdfdf" },
  { id: "gray", color: "#c0c0c0" },
  { id: "grayMid", color: "#a0a0a0" },
  { id: "grayDark", color: "#808080" },
  { id: "navy", color: "#000080" },
  { id: "teal", color: "#008080" },
  { id: "maroon", color: "#800000" },
  { id: "white", color: "#ffffff" },
];

export const CARD_BACKGROUND_PRESETS_NEO: ColorPreset[] = [
  { id: "white", color: "#ffffff" },
  { id: "yellow", color: "#fde047" },
  { id: "blue", color: "#88aaee" },
  { id: "green", color: "#86efac" },
  { id: "pink", color: "#fbcfe8" },
  { id: "orange", color: "#fed7aa" },
  { id: "purple", color: "#c4b5fd" },
  { id: "gray", color: "#f0f0f0" },
];

export const CARD_BACKGROUND_PRESETS_GLASS: ColorPreset[] = [
  { id: "surface", color: "#f4f7fb" },
  { id: "column", color: "#eef2f8" },
  { id: "blue", color: "#dbeafe" },
  { id: "pink", color: "#fce7f3" },
  { id: "green", color: "#d1fae5" },
  { id: "amber", color: "#ffedd5" },
  { id: "purple", color: "#ede9fe" },
  { id: "white", color: "#ffffff" },
];

export const DEFAULT_CARD_BACKGROUND = CARD_BACKGROUND_PRESETS[7].color;

export function getCardBackgroundPresetsForTheme(
  theme: VisualTheme,
): ColorPreset[] {
  switch (theme) {
    case "win95":
      return CARD_BACKGROUND_PRESETS_WIN95;
    case "neobrutalism":
      return CARD_BACKGROUND_PRESETS_NEO;
    case "liquidGlass":
      return CARD_BACKGROUND_PRESETS_GLASS;
    default:
      return CARD_BACKGROUND_PRESETS;
  }
}

export function getDefaultCardBackgroundForTheme(theme: VisualTheme): string {
  switch (theme) {
    case "win95":
      return RETRO_CARD_CHIP_BG;
    case "neobrutalism":
      return NEO_CARD_CHIP_BG;
    case "liquidGlass":
      return GLASS_SURFACE;
    default:
      return DEFAULT_CARD_BACKGROUND;
  }
}

export function hasCardBackground(card: {
  backgroundColor: string | null;
}): boolean {
  return Boolean(
    card.backgroundColor && isValidHexColor(card.backgroundColor),
  );
}

function normalizeCardBackgroundHex(color: string): string {
  return color.trim().toLowerCase();
}

/** Whether a stored chip background belongs to the active theme's palette. */
export function isCardBackgroundForTheme(
  color: string,
  theme: VisualTheme,
): boolean {
  if (theme === "expedition") return isValidHexColor(color);
  return getCardBackgroundPresetsForTheme(theme).some(
    (preset) =>
      normalizeCardBackgroundHex(preset.color) ===
      normalizeCardBackgroundHex(color),
  );
}

/**
 * Chip background to render for the current theme.
 * Expedition dark tints are ignored on Win95 / Neo / Liquid Glass so contrast
 * stays correct after switching themes.
 */
export function getEffectiveCardBackground(
  card: { backgroundColor: string | null },
  theme: VisualTheme,
): string | null {
  if (!hasCardBackground(card)) return null;
  const color = card.backgroundColor!;
  return isCardBackgroundForTheme(color, theme) ? color : null;
}

export function hasEffectiveCardBackground(
  card: { backgroundColor: string | null },
  theme: VisualTheme,
): boolean {
  return getEffectiveCardBackground(card, theme) !== null;
}

export function getCardChipStyle(
  card: { color: string; backgroundColor: string | null },
  options?: { selected?: boolean; visualTheme?: VisualTheme },
): CSSProperties {
  const style: CSSProperties = {};
  const theme = options?.visualTheme ?? "expedition";
  const effectiveBg = getEffectiveCardBackground(card, theme);
  const customBg = effectiveBg !== null;

  if (theme === "win95") {
    style.backgroundColor = customBg ? effectiveBg : RETRO_CARD_CHIP_BG;
  } else if (theme === "neobrutalism") {
    style.backgroundColor = customBg ? effectiveBg : NEO_CARD_CHIP_BG;
    style.border = `2px solid ${NEO_BORDER_COLOR}`;
    style.boxShadow = NEO_SHADOW;
  } else if (theme === "liquidGlass") {
    style.backgroundColor = customBg ? effectiveBg : GLASS_CARD_CHIP_BG;
    style.border = `1px solid ${GLASS_BORDER}`;
    style.boxShadow = GLASS_SHADOW;
    style.backdropFilter = "blur(16px)";
    style.WebkitBackdropFilter = "blur(16px)";
  } else if (customBg) {
    style.backgroundColor = effectiveBg;
  }

  if (options?.selected) {
    if (theme === "neobrutalism") {
      style.boxShadow = "2px 2px 0 0 #000000";
      style.transform = "translate(2px, 2px)";
    } else if (theme === "liquidGlass") {
      style.boxShadow = `inset 0 0 0 1.5px ${card.color}, ${GLASS_SHADOW}`;
      if (!customBg) {
        style.backgroundColor = "rgba(255, 255, 255, 0.82)";
      }
    } else {
      style.boxShadow = `inset 0 0 0 ${theme === "win95" ? 2 : 1}px ${card.color}`;
    }
  }
  return style;
}

export const ALERT_COLOR_PRESETS: ColorPreset[] = [
  { id: "red", color: DEFAULT_BUDGET_ALERT_COLOR },
  { id: "rose", color: "#fb7185" },
  { id: "amber", color: "#fbbf24" },
  { id: "orange", color: "#f97316" },
  { id: "sky", color: "#38bdf8" },
  { id: "mint", color: "#34d399" },
];

export const CARD_COLUMN_PRESETS: ColorPreset[] = [
  { id: "expedition", color: DEFAULT_CARD_COLUMN_COLOR },
  { id: "slateBlue", color: "#0d1117" },
  { id: "midnight", color: "#12121a" },
  { id: "blueTint", color: "#172554" },
  { id: "slateTint", color: "#1e293b" },
  { id: "purpleTint", color: "#2e1065" },
  { id: "forest", color: "#0f1712" },
  { id: "warm", color: "#171310" },
];

export const TAB_COLOR_PRESETS: ColorPreset[] = [
  { id: "slate", color: "#8a96a8" },
  { id: "blue", color: "#2f6eb5" },
  { id: "green", color: "#2d9a58" },
  { id: "amber", color: "#d9921f" },
  { id: "red", color: "#ef4444" },
  { id: "purple", color: "#8b5cf6" },
  { id: "cyan", color: "#06b6d4" },
  { id: "pink", color: "#ec4899" },
];

export const TAB_TEXT_PRESETS: ColorPreset[] = [
  { id: "white", color: "#ffffff" },
  { id: "darkSlate", color: "#1e293b" },
  { id: "silver", color: "#d4d4d8" },
  { id: "gold", color: "#fbbf24" },
  { id: "sky", color: "#38bdf8" },
  { id: "mint", color: "#34d399" },
];

export const WORKSPACE_TAB_KEYS = [
  "future",
  "news",
  "dashboard",
  "profile",
] as const;

export type WorkspaceTabKey = (typeof WORKSPACE_TAB_KEYS)[number];

export const DEFAULT_TAB_FUTURE_COLOR = TAB_COLOR_PRESETS[0].color;
export const DEFAULT_TAB_FUTURE_TEXT_COLOR = TAB_TEXT_PRESETS[1].color;
export const DEFAULT_TAB_NEWS_COLOR = TAB_COLOR_PRESETS[1].color;
export const DEFAULT_TAB_NEWS_TEXT_COLOR = TAB_TEXT_PRESETS[0].color;
export const DEFAULT_TAB_DASHBOARD_COLOR = TAB_COLOR_PRESETS[2].color;
export const DEFAULT_TAB_DASHBOARD_TEXT_COLOR = TAB_TEXT_PRESETS[0].color;
export const DEFAULT_TAB_PROFILE_COLOR = TAB_COLOR_PRESETS[3].color;
export const DEFAULT_TAB_PROFILE_TEXT_COLOR = TAB_TEXT_PRESETS[0].color;

export function getWorkspaceTabGradientStyle(
  color: string,
  textColor: string,
): CSSProperties {
  const bg = isValidHexColor(color) ? color : DEFAULT_TAB_NEWS_COLOR;
  const text = isValidHexColor(textColor) ? textColor : "#ffffff";
  return {
    background: `linear-gradient(180deg, color-mix(in srgb, ${bg} 72%, white) 0%, ${bg} 55%, color-mix(in srgb, ${bg} 82%, black) 100%)`,
    color: text,
    boxShadow:
      "inset 0 1px 0 rgb(255 255 255 / 0.22), 0 -1px 3px rgb(0 0 0 / 0.25)",
  };
}

export type ThemeSettings = {
  backgroundColor: string;
  titleColor: string;
  titleText: string;
  budgetAlertColor: string;
  cardColumnColor: string;
  tabFutureColor: string;
  tabFutureTextColor: string;
  tabNewsColor: string;
  tabNewsTextColor: string;
  tabDashboardColor: string;
  tabDashboardTextColor: string;
  tabProfileColor: string;
  tabProfileTextColor: string;
  visualTheme?: VisualTheme;
};

export function normalizeWorkspaceTitle(titleText: string): string {
  const trimmed = titleText.trim();
  if (!trimmed || trimmed === LEGACY_DEFAULT_TITLE_TEXT) return "";
  return trimmed.slice(0, MAX_TITLE_TEXT_LENGTH);
}

/** User-editable workspace title, or null when unset. */
export function getWorkspaceTitle(titleText: string): string | null {
  const normalized = normalizeWorkspaceTitle(titleText);
  return normalized || null;
}

export function getPresetId(
  presets: ColorPreset[],
  color: string,
): string | null {
  return presets.find((preset) => preset.color === color)?.id ?? null;
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Slightly lighter panel color derived from the page background. */
export function deriveSurfaceColor(baseHex: string): string {
  const [r, g, b] = hexToRgb(baseHex);
  const lift = (channel: number, extra = 0) =>
    Math.min(255, channel + 11 + extra);
  return rgbToHex(lift(r), lift(g), lift(b, 4));
}

const PRESET_COLUMN_TOTALS: Record<
  Exclude<VisualTheme, "expedition">,
  string
> = {
  win95: RETRO_DEFAULT_CARD_COLUMN_TOTAL,
  neobrutalism: NEO_DEFAULT_CARD_COLUMN_TOTAL,
  liquidGlass: GLASS_DEFAULT_CARD_COLUMN_TOTAL,
};

export function usesAltThemeDefaultCardColumn(
  cardColumnColor: string,
  visualTheme: VisualTheme,
): boolean {
  if (visualTheme === "expedition") return false;
  if (
    !isValidHexColor(cardColumnColor) ||
    cardColumnColor === DEFAULT_CARD_COLUMN_COLOR
  ) {
    return true;
  }
  const ownDefault = defaultCardColumnForTheme(visualTheme);
  if (cardColumnColor === ownDefault) return false;
  return Object.values(PRESET_CARD_COLUMN_DEFAULTS).includes(cardColumnColor);
}

export function resolveCardColumnColor(
  cardColumnColor: string,
  visualTheme: VisualTheme,
): string {
  if (usesAltThemeDefaultCardColumn(cardColumnColor, visualTheme)) {
    return defaultCardColumnForTheme(visualTheme);
  }
  return isValidHexColor(cardColumnColor)
    ? cardColumnColor
    : DEFAULT_CARD_COLUMN_COLOR;
}

export function resolveCardColumnTotalColor(
  cardColumnColor: string,
  visualTheme: VisualTheme,
): string {
  if (usesAltThemeDefaultCardColumn(cardColumnColor, visualTheme)) {
    return visualTheme === "expedition"
      ? deriveSurfaceColor(DEFAULT_CARD_COLUMN_COLOR)
      : PRESET_COLUMN_TOTALS[visualTheme];
  }
  return deriveSurfaceColor(resolveCardColumnColor(cardColumnColor, visualTheme));
}

export function applyTheme({
  backgroundColor,
  titleColor,
  budgetAlertColor,
  cardColumnColor,
  tabFutureColor,
  tabFutureTextColor,
  tabNewsColor,
  tabNewsTextColor,
  tabDashboardColor,
  tabDashboardTextColor,
  tabProfileColor,
  tabProfileTextColor,
  visualTheme = "expedition",
}: ThemeSettings): void {
  if (visualTheme === "expedition") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = visualTheme;
  }

  const isWin95 = visualTheme === "win95";
  const isNeo = visualTheme === "neobrutalism";
  const isGlass = visualTheme === "liquidGlass";

  const base = isWin95
    ? RETRO_BACKGROUND
    : isNeo
      ? NEO_BACKGROUND
      : isGlass
        ? GLASS_BACKGROUND
        : isValidHexColor(backgroundColor)
          ? backgroundColor
          : DEFAULT_BACKGROUND;
  const title = isWin95
    ? RETRO_TITLE_COLOR
    : isNeo
      ? NEO_TITLE_COLOR
      : isGlass
        ? GLASS_TITLE_COLOR
        : isValidHexColor(titleColor)
          ? titleColor
          : DEFAULT_TITLE_COLOR;
  const alertColor = isWin95
    ? RETRO_BUDGET_ALERT_COLOR
    : isNeo
      ? NEO_BUDGET_ALERT_COLOR
      : isGlass
        ? GLASS_BUDGET_ALERT_COLOR
        : isValidHexColor(budgetAlertColor)
          ? budgetAlertColor
          : DEFAULT_BUDGET_ALERT_COLOR;
  const columnColor = resolveCardColumnColor(cardColumnColor, visualTheme);
  const surface = isWin95
    ? RETRO_SURFACE
    : isNeo
      ? NEO_SURFACE
      : isGlass
        ? GLASS_SURFACE
        : getSurfaceColor(base);

  const brandAccent = isWin95
    ? RETRO_BRAND_ACCENT
    : isNeo
      ? NEO_BRAND_ACCENT
      : isGlass
        ? GLASS_BRAND_ACCENT
        : BRAND_ACCENT;

  const tabVars: [string, string, string][] = isWin95
    ? [
        ["--tab-future-bg", RETRO_TAB_COLOR, RETRO_TAB_COLOR],
        ["--tab-future-text", RETRO_TAB_TEXT_COLOR, RETRO_TAB_TEXT_COLOR],
        ["--tab-news-bg", RETRO_TAB_COLOR, RETRO_TAB_COLOR],
        ["--tab-news-text", RETRO_TAB_TEXT_COLOR, RETRO_TAB_TEXT_COLOR],
        ["--tab-dashboard-bg", RETRO_TAB_COLOR, RETRO_TAB_COLOR],
        ["--tab-dashboard-text", RETRO_TAB_TEXT_COLOR, RETRO_TAB_TEXT_COLOR],
        ["--tab-profile-bg", RETRO_TAB_COLOR, RETRO_TAB_COLOR],
        ["--tab-profile-text", RETRO_TAB_TEXT_COLOR, RETRO_TAB_TEXT_COLOR],
      ]
    : isNeo
      ? [
          ["--tab-future-bg", NEO_TAB_COLOR, NEO_TAB_COLOR],
          ["--tab-future-text", NEO_TAB_TEXT_COLOR, NEO_TAB_TEXT_COLOR],
          ["--tab-news-bg", "#97ee88", "#97ee88"],
          ["--tab-news-text", NEO_TAB_TEXT_COLOR, NEO_TAB_TEXT_COLOR],
          ["--tab-dashboard-bg", "#88aaee", "#88aaee"],
          ["--tab-dashboard-text", NEO_TAB_TEXT_COLOR, NEO_TAB_TEXT_COLOR],
          ["--tab-profile-bg", "#f9a8d4", "#f9a8d4"],
          ["--tab-profile-text", NEO_TAB_TEXT_COLOR, NEO_TAB_TEXT_COLOR],
        ]
      : isGlass
        ? [
            ["--tab-future-bg", "#dbeafe", "#dbeafe"],
            ["--tab-future-text", GLASS_TAB_TEXT_COLOR, GLASS_TAB_TEXT_COLOR],
            ["--tab-news-bg", "#d1fae5", "#d1fae5"],
            ["--tab-news-text", GLASS_TAB_TEXT_COLOR, GLASS_TAB_TEXT_COLOR],
            ["--tab-dashboard-bg", "#e0e7ff", "#e0e7ff"],
            ["--tab-dashboard-text", GLASS_TAB_TEXT_COLOR, GLASS_TAB_TEXT_COLOR],
            ["--tab-profile-bg", "#fce7f3", "#fce7f3"],
            ["--tab-profile-text", GLASS_TAB_TEXT_COLOR, GLASS_TAB_TEXT_COLOR],
          ]
        : [
            ["--tab-future-bg", tabFutureColor, DEFAULT_TAB_FUTURE_COLOR],
            [
              "--tab-future-text",
              tabFutureTextColor,
              DEFAULT_TAB_FUTURE_TEXT_COLOR,
            ],
            ["--tab-news-bg", tabNewsColor, DEFAULT_TAB_NEWS_COLOR],
            ["--tab-news-text", tabNewsTextColor, DEFAULT_TAB_NEWS_TEXT_COLOR],
            ["--tab-dashboard-bg", tabDashboardColor, DEFAULT_TAB_DASHBOARD_COLOR],
            [
              "--tab-dashboard-text",
              tabDashboardTextColor,
              DEFAULT_TAB_DASHBOARD_TEXT_COLOR,
            ],
            ["--tab-profile-bg", tabProfileColor, DEFAULT_TAB_PROFILE_COLOR],
            [
              "--tab-profile-text",
              tabProfileTextColor,
              DEFAULT_TAB_PROFILE_TEXT_COLOR,
            ],
          ];

  document.documentElement.style.setProperty("--color-base", base);
  document.documentElement.style.setProperty("--color-surface", surface);
  document.documentElement.style.setProperty(
    "--color-brand-accent",
    brandAccent,
  );
  document.documentElement.style.setProperty("--color-brand-cc", BRAND_CC_COLOR);
  document.documentElement.style.setProperty("--color-workspace-title", title);
  document.documentElement.style.setProperty("--color-budget-alert", alertColor);
  document.documentElement.style.setProperty("--color-card-column", columnColor);
  document.documentElement.style.setProperty(
    "--color-card-column-total",
    resolveCardColumnTotalColor(cardColumnColor, visualTheme),
  );

  for (const [name, value, fallback] of tabVars) {
    document.documentElement.style.setProperty(
      name,
      isValidHexColor(value) ? value : fallback,
    );
  }

  document.title = PAGE_TITLE;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", base);
}
