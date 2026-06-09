export const DEFAULT_BACKGROUND = "#0f0f13";
export const DEFAULT_TITLE_COLOR = "#ffffff";
export const DEFAULT_TITLE_TEXT = "ccExpedition - Expense Tracker";
export const MAX_TITLE_TEXT_LENGTH = 80;

export type ColorPreset = { label: string; color: string };

export const BACKGROUND_PRESETS: ColorPreset[] = [
  { label: "Default", color: DEFAULT_BACKGROUND },
  { label: "Midnight", color: "#0d1117" },
  { label: "Purple", color: "#1a1025" },
  { label: "Forest", color: "#0f1712" },
  { label: "Warm", color: "#171310" },
  { label: "Slate", color: "#141820" },
];

export const TITLE_PRESETS: ColorPreset[] = [
  { label: "White", color: DEFAULT_TITLE_COLOR },
  { label: "Silver", color: "#d4d4d8" },
  { label: "Gold", color: "#fbbf24" },
  { label: "Sky", color: "#38bdf8" },
  { label: "Mint", color: "#34d399" },
  { label: "Rose", color: "#fb7185" },
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

export function getPresetLabel(
  presets: ColorPreset[],
  color: string,
): string {
  return presets.find((preset) => preset.color === color)?.label ?? "Custom";
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
  titleText,
}: ThemeSettings): void {
  const base = isValidHexColor(backgroundColor)
    ? backgroundColor
    : DEFAULT_BACKGROUND;
  const title = isValidHexColor(titleColor) ? titleColor : DEFAULT_TITLE_COLOR;
  const surface = deriveSurfaceColor(base);

  document.documentElement.style.setProperty("--color-base", base);
  document.documentElement.style.setProperty("--color-surface", surface);
  document.documentElement.style.setProperty("--color-title", title);
  document.title = getDisplayTitle(titleText);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", base);
}
