import type { LocalizedText } from "../data/news";

export function pickLocalized(
  text: LocalizedText,
  lang: "es" | "en",
): string {
  return text[lang] ?? text.es;
}

export function formatNewsDate(date: string, lang: "es" | "en"): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day);
  const locale = lang === "es" ? "es-AR" : "en-US";
  return value.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function newsBasePath(demoMode: boolean): string {
  return demoMode ? "/demo/novedades" : "/novedades";
}

export function parseNewsRoute(
  path: string,
  demoMode: boolean,
): { active: boolean; slug?: string } {
  const base = newsBasePath(demoMode);
  if (path === base) return { active: true };
  if (path.startsWith(`${base}/`)) {
    const slug = path.slice(base.length + 1);
    return slug ? { active: true, slug } : { active: true };
  }
  return { active: false };
}
