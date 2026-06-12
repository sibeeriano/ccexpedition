const SIGNUP_PENDING_KEY = "ccexpedition-thank-you-pending-signup";
const FIRST_SIGNIN_PENDING_PREFIX = "ccexpedition-thank-you-pending-signin-";
const HAS_SIGNED_IN_PREFIX = "ccexpedition-has-signed-in-";
const VIEW_COUNT_PREFIX = "ccexpedition-thank-you-views-";
const POPUP_DISMISSED_PREFIX = "ccexpedition-thank-you-dismissed-";
const ACTIVE_SESSION_PREFIX = "ccexpedition-first-experience-active-";
const POST_RESET_SYNC_PREFIX = "ccexpedition-first-experience-post-reset-";

const RESET_VERSION_KEY = "ccexpedition-first-experience-reset-version";
/** Subir este número para reiniciar popup + tutorial en todos los usuarios. */
const RESET_VERSION = 1;

const MAX_VIEWS = 2;

const LOCAL_STORAGE_PREFIXES = [
  FIRST_SIGNIN_PENDING_PREFIX,
  HAS_SIGNED_IN_PREFIX,
  VIEW_COUNT_PREFIX,
  POPUP_DISMISSED_PREFIX,
  POST_RESET_SYNC_PREFIX,
  "ccexpedition-thank-you-seen-",
  "ccexpedition-pending-thank-you",
  "ccexpedition-tour-welcome-",
  "ccexpedition-onboarding-",
];

const SESSION_STORAGE_PREFIXES = [
  SIGNUP_PENDING_KEY,
  FIRST_SIGNIN_PENDING_PREFIX,
  POPUP_DISMISSED_PREFIX,
  ACTIVE_SESSION_PREFIX,
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
    SIGNUP_PENDING_KEY,
  ]);
  clearStorageByPrefixes(sessionStorage, SESSION_STORAGE_PREFIXES, [
    SIGNUP_PENDING_KEY,
  ]);
}

/**
 * Ejecutar al iniciar la app. Si RESET_VERSION cambió, borra el estado
 * guardado de popup/tutorial para todos los usuarios en este navegador.
 */
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

function isSignupPending(): boolean {
  return (
    sessionStorage.getItem(SIGNUP_PENDING_KEY) === "1" ||
    localStorage.getItem(SIGNUP_PENDING_KEY) === "1"
  );
}

function isFirstSignInPending(userId: string): boolean {
  const key = `${FIRST_SIGNIN_PENDING_PREFIX}${userId}`;
  return (
    sessionStorage.getItem(key) === "1" || localStorage.getItem(key) === "1"
  );
}

function hasPendingTrigger(userId: string): boolean {
  return isSignupPending() || isFirstSignInPending(userId);
}

function isActiveSession(userId: string): boolean {
  return sessionStorage.getItem(`${ACTIVE_SESSION_PREFIX}${userId}`) === "1";
}

function setPending(key: string): void {
  sessionStorage.setItem(key, "1");
  localStorage.setItem(key, "1");
}

function clearPending(key: string): void {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

function clearSessionFlags(userId: string): void {
  sessionStorage.removeItem(`${POPUP_DISMISSED_PREFIX}${userId}`);
  sessionStorage.removeItem(`${ACTIVE_SESSION_PREFIX}${userId}`);
}

function hasViewsRemaining(userId: string): boolean {
  return getViewCount(userId) < MAX_VIEWS;
}

/**
 * Tras un reset global, ofrece una oportunidad a usuarios ya logueados
 * sin pedirles que cierren sesión.
 */
export function syncFirstExperienceAfterReset(userId: string): void {
  if (localStorage.getItem(`${POST_RESET_SYNC_PREFIX}${userId}`) === "1") return;
  localStorage.setItem(`${POST_RESET_SYNC_PREFIX}${userId}`, "1");

  if (!hasViewsRemaining(userId)) return;

  clearSessionFlags(userId);
  setPending(`${FIRST_SIGNIN_PENDING_PREFIX}${userId}`);
}

/** Tras un registro exitoso — primera oportunidad de popup + tutorial. */
export function markThankYouPendingSignUp(): void {
  setPending(SIGNUP_PENDING_KEY);
}

/**
 * Tras el primer inicio de sesión explícito — segunda oportunidad.
 * Ignorado si el usuario ya había iniciado sesión antes en este dispositivo.
 */
export function markThankYouPendingFirstSignIn(userId: string): void {
  if (localStorage.getItem(`${HAS_SIGNED_IN_PREFIX}${userId}`) === "1") return;
  localStorage.setItem(`${HAS_SIGNED_IN_PREFIX}${userId}`, "1");
  clearSessionFlags(userId);
  setPending(`${FIRST_SIGNIN_PENDING_PREFIX}${userId}`);
}

export function shouldShowThankYou(userId: string): boolean {
  if (!hasViewsRemaining(userId)) return false;
  if (sessionStorage.getItem(`${POPUP_DISMISSED_PREFIX}${userId}`) === "1") {
    return false;
  }
  return hasPendingTrigger(userId);
}

/** Tutorial de bienvenida: mismas 2 oportunidades que el popup. */
export function shouldShowWelcomeTour(userId: string): boolean {
  if (!hasViewsRemaining(userId)) return false;
  return hasPendingTrigger(userId) || isActiveSession(userId);
}

/** Cierra el popup sin consumir la oportunidad (el tutorial la consume al terminar). */
export function dismissThankYouPopup(userId: string): void {
  sessionStorage.setItem(`${POPUP_DISMISSED_PREFIX}${userId}`, "1");
  sessionStorage.setItem(`${ACTIVE_SESSION_PREFIX}${userId}`, "1");
}

/**
 * Marca una oportunidad como usada (popup y/o tutorial).
 * Llamar al terminar el tutorial o si no aplica (ej. ya tiene tarjetas).
 */
export function finalizeFirstExperience(userId: string): void {
  const nextCount = Math.min(getViewCount(userId) + 1, MAX_VIEWS);
  localStorage.setItem(`${VIEW_COUNT_PREFIX}${userId}`, String(nextCount));

  clearPending(SIGNUP_PENDING_KEY);
  clearPending(`${FIRST_SIGNIN_PENDING_PREFIX}${userId}`);
  clearSessionFlags(userId);
}
