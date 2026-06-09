export const DEFAULT_BACKGROUND = "#0f0f13";

export const BACKGROUND_PRESETS: { label: string; color: string }[] = [
  { label: "Default", color: DEFAULT_BACKGROUND },
  { label: "Midnight", color: "#0d1117" },
  { label: "Purple", color: "#1a1025" },
  { label: "Forest", color: "#0f1712" },
  { label: "Warm", color: "#171310" },
  { label: "Slate", color: "#141820" },
];

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

export function applyThemeColors(backgroundColor: string): void {
  const base = isValidHexColor(backgroundColor)
    ? backgroundColor
    : DEFAULT_BACKGROUND;
  const surface = deriveSurfaceColor(base);

  document.documentElement.style.setProperty("--color-base", base);
  document.documentElement.style.setProperty("--color-surface", surface);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", base);
}
