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

export const DEFAULT_CARD_BACKGROUND = CARD_BACKGROUND_PRESETS[7].color;

export function hasCardBackground(card: {
  backgroundColor: string | null;
}): boolean {
  return Boolean(
    card.backgroundColor && isValidHexColor(card.backgroundColor),
  );
}

export function getCardChipStyle(
  card: { color: string; backgroundColor: string | null },
  options?: { selected?: boolean },
): CSSProperties {
  const style: CSSProperties = {};
  if (hasCardBackground(card)) {
    style.backgroundColor = card.backgroundColor!;
  }
  if (options?.selected) {
    style.boxShadow = `inset 0 0 0 1px ${card.color}`;
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

export type ThemeSettings = {
  backgroundColor: string;
  titleColor: string;
  titleText: string;
  budgetAlertColor: string;
  cardColumnColor: string;
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

export function applyTheme({
  backgroundColor,
  titleColor,
  budgetAlertColor,
  cardColumnColor,
}: ThemeSettings): void {
  const base = isValidHexColor(backgroundColor)
    ? backgroundColor
    : DEFAULT_BACKGROUND;
  const title = isValidHexColor(titleColor) ? titleColor : DEFAULT_TITLE_COLOR;
  const alertColor = isValidHexColor(budgetAlertColor)
    ? budgetAlertColor
    : DEFAULT_BUDGET_ALERT_COLOR;
  const columnColor = isValidHexColor(cardColumnColor)
    ? cardColumnColor
    : DEFAULT_CARD_COLUMN_COLOR;
  const surface = getSurfaceColor(base);

  document.documentElement.style.setProperty("--color-base", base);
  document.documentElement.style.setProperty("--color-surface", surface);
  document.documentElement.style.setProperty("--color-brand-accent", BRAND_ACCENT);
  document.documentElement.style.setProperty("--color-brand-cc", BRAND_CC_COLOR);
  document.documentElement.style.setProperty("--color-workspace-title", title);
  document.documentElement.style.setProperty("--color-budget-alert", alertColor);
  document.documentElement.style.setProperty("--color-card-column", columnColor);
  document.documentElement.style.setProperty(
    "--color-card-column-total",
    deriveSurfaceColor(columnColor),
  );
  document.title = PAGE_TITLE;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", base);
}
