/**
 * Primera experiencia: popup de agradecimiento → tutorial de bienvenida.
 * Máximo 2 veces por usuario (registro + primer inicio de sesión explícito).
 *
 * Fases en sessionStorage (por pestaña):
 *   (vacío)        → mostrar popup si hay trigger pendiente
 *   awaiting-tour  → popup ya visto; arrancar tutorial
 */

const SIGNUP_TRIGGER_KEY = "ccexpedition-fe-signup-trigger";
const FIRST_SIGNIN_TRIGGER_PREFIX = "ccexpedition-fe-first-signin-";
const PHASE_PREFIX = "ccexpedition-fe-phase-";
const VIEW_COUNT_PREFIX = "ccexpedition-fe-views-";
const POST_RESET_SYNC_PREFIX = "ccexpedition-fe-post-reset-";

const RESET_VERSION_KEY = "ccexpedition-first-experience-reset-version";
/** Subir para reiniciar popup + tutorial en todos los usuarios. */
const RESET_VERSION = 2;

const MAX_VIEWS = 2;

export type FirstExperiencePhase = "none" | "popup" | "tour";

const LOCAL_STORAGE_PREFIXES = [
  FIRST_SIGNIN_TRIGGER_PREFIX,
  VIEW_COUNT_PREFIX,
  POST_RESET_SYNC_PREFIX,
  PHASE_PREFIX,
  "ccexpedition-thank-you-",
  "ccexpedition-first-experience-",
  "ccexpedition-fe-",
  "ccexpedition-tour-welcome-",
  "ccexpedition-onboarding-",
];

const SESSION_STORAGE_PREFIXES = [
  SIGNUP_TRIGGER_KEY,
  FIRST_SIGNIN_TRIGGER_PREFIX,
  PHASE_PREFIX,
  "ccexpedition-thank-you-",
  "ccexpedition-first-experience-",
  "ccexpedition-fe-",
  "ccexpedition-pending-thank-you",
];

function clearStorageByPrefixes(
  storage: Storage,
  prefixes: string[],
  exactKeys: string[] = [],
): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    if (
      exactKeys.includes(key) ||
      prefixes.some((prefix) => key.startsWith(prefix))
    ) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
}

function resetAllFirstExperienceState(): void {
  clearStorageByPrefixes(localStorage, LOCAL_STORAGE_PREFIXES, [
    SIGNUP_TRIGGER_KEY,
  ]);
  clearStorageByPrefixes(sessionStorage, SESSION_STORAGE_PREFIXES, [
    SIGNUP_TRIGGER_KEY,
  ]);
}

export function ensureFirstExperienceReset(): void {
  const stored = localStorage.getItem(RESET_VERSION_KEY);
  if (stored === String(RESET_VERSION)) return;

  resetAllFirstExperienceState();
  localStorage.setItem(RESET_VERSION_KEY, String(RESET_VERSION));
}

function getViewCount(userId: string): number {
  const raw = localStorage.getItem(`${VIEW_COUNT_PREFIX}${userId}`);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(count) ? count : 0;
}

function hasViewsRemaining(userId: string): boolean {
  return getViewCount(userId) < MAX_VIEWS;
}

function getPhase(userId: string): string | null {
  return sessionStorage.getItem(`${PHASE_PREFIX}${userId}`);
}

function setPhase(userId: string, phase: "awaiting-tour" | null): void {
  const key = `${PHASE_PREFIX}${userId}`;
  if (phase) sessionStorage.setItem(key, phase);
  else sessionStorage.removeItem(key);
}

function hasSignupTrigger(): boolean {
  return sessionStorage.getItem(SIGNUP_TRIGGER_KEY) === "1";
}

function hasFirstSignInTrigger(userId: string): boolean {
  return (
    sessionStorage.getItem(`${FIRST_SIGNIN_TRIGGER_PREFIX}${userId}`) === "1"
  );
}

function hasAnyTrigger(userId: string): boolean {
  return hasSignupTrigger() || hasFirstSignInTrigger(userId);
}

function setSignupTrigger(): void {
  sessionStorage.setItem(SIGNUP_TRIGGER_KEY, "1");
}

function setFirstSignInTrigger(userId: string): void {
  sessionStorage.setItem(`${FIRST_SIGNIN_TRIGGER_PREFIX}${userId}`, "1");
}

function clearTriggers(userId: string): void {
  sessionStorage.removeItem(SIGNUP_TRIGGER_KEY);
  sessionStorage.removeItem(`${FIRST_SIGNIN_TRIGGER_PREFIX}${userId}`);
}

/** Fase actual: qué mostrar ahora (popup, tour o nada). */
export function getFirstExperiencePhase(userId: string): FirstExperiencePhase {
  if (!hasViewsRemaining(userId)) return "none";

  if (getPhase(userId) === "awaiting-tour") return "tour";
  if (hasAnyTrigger(userId)) return "popup";

  return "none";
}

/**
 * Tras deploy: una oportunidad para usuarios ya logueados sin cerrar sesión.
 */
export function syncFirstExperienceAfterReset(userId: string): void {
  if (localStorage.getItem(`${POST_RESET_SYNC_PREFIX}${userId}`) === "1") return;
  localStorage.setItem(`${POST_RESET_SYNC_PREFIX}${userId}`, "1");

  if (!hasViewsRemaining(userId)) return;

  setFirstSignInTrigger(userId);
}

/** Tras registro exitoso — oportunidad 1. */
export function markThankYouPendingSignUp(): void {
  setSignupTrigger();
}

/**
 * Tras el primer inicio de sesión explícito — oportunidad 2.
 * No se dispara al restaurar sesión al recargar la página.
 */
export function markThankYouPendingFirstSignIn(userId: string): void {
  if (!hasViewsRemaining(userId)) return;
  if (hasSignupTrigger()) return;

  if (getViewCount(userId) === 0) {
    setFirstSignInTrigger(userId);
    return;
  }

  if (getViewCount(userId) === 1) {
    setFirstSignInTrigger(userId);
  }
}

/** El popup se cerró; la siguiente fase es el tutorial. */
export function onThankYouPopupClosed(userId: string): void {
  setPhase(userId, "awaiting-tour");
}

/** Solo arrancar el tutorial de bienvenida en esta fase. */
export function canStartWelcomeTour(userId: string): boolean {
  return getPhase(userId) === "awaiting-tour" && hasViewsRemaining(userId);
}

/** Consumir una oportunidad (tutorial terminado o usuario con tarjetas). */
export function finalizeFirstExperience(userId: string): void {
  const nextCount = Math.min(getViewCount(userId) + 1, MAX_VIEWS);
  localStorage.setItem(`${VIEW_COUNT_PREFIX}${userId}`, String(nextCount));

  clearTriggers(userId);
  setPhase(userId, null);
}
