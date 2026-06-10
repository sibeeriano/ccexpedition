export const DEFAULT_BACKGROUND = "#0f0f13";
export const DEFAULT_TITLE_COLOR = "#ffffff";
export const DEFAULT_TITLE_TEXT = "ccExpedition - Expense Tracker";
/** Fixed browser tab title — not user-editable. */
export const PAGE_TITLE = "ccExpedition";
export const MAX_TITLE_TEXT_LENGTH = 80;

export type ColorPreset = { id: string; color: string };

export const BACKGROUND_PRESETS: ColorPreset[] = [
  { id: "default", color: DEFAULT_BACKGROUND },
  { id: "midnight", color: "#0d1117" },
  { id: "purple", color: "#1a1025" },
  { id: "forest", color: "#0f1712" },
  { id: "warm", color: "#171310" },
  { id: "slate", color: "#141820" },
];

export const TITLE_PRESETS: ColorPreset[] = [
  { id: "white", color: DEFAULT_TITLE_COLOR },
  { id: "silver", color: "#d4d4d8" },
  { id: "gold", color: "#fbbf24" },
  { id: "sky", color: "#38bdf8" },
  { id: "mint", color: "#34d399" },
  { id: "rose", color: "#fb7185" },
];

export type ThemeSettings = {
  backgroundColor: string;
  titleColor: string;
  titleText: string;
};

export function getDisplayTitle(titleText: string): string {
  const trimmed = titleText.trim();
  return trimmed || DEFAULT_TITLE_TEXT;
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
}: ThemeSettings): void {
  const base = isValidHexColor(backgroundColor)
    ? backgroundColor
    : DEFAULT_BACKGROUND;
  const title = isValidHexColor(titleColor) ? titleColor : DEFAULT_TITLE_COLOR;
  const surface = deriveSurfaceColor(base);

  document.documentElement.style.setProperty("--color-base", base);
  document.documentElement.style.setProperty("--color-surface", surface);
  document.documentElement.style.setProperty("--color-title", title);
  document.title = PAGE_TITLE;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", base);
}
