export const ADMIN_LOGIN_ALIAS = "admin";
export const DEFAULT_ADMIN_EMAIL = "admin@ccexpedition.app";
export const ADMIN_REDIRECT_KEY = "ccexpedition-admin-redirect";

export function getAdminEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL?.trim();
  return fromEnv || DEFAULT_ADMIN_EMAIL;
}

export function isAdminLoginAlias(identifier: string): boolean {
  return identifier.trim().toLowerCase() === ADMIN_LOGIN_ALIAS;
}

/** Maps login alias "admin" to the real Supabase Auth email. */
export function resolveLoginEmail(identifier: string): string {
  if (isAdminLoginAlias(identifier)) {
    return getAdminEmail();
  }
  return identifier.trim();
}

export function markAdminRedirectIntent(): void {
  sessionStorage.setItem(ADMIN_REDIRECT_KEY, "1");
}

export function consumeAdminRedirectIntent(): boolean {
  const value = sessionStorage.getItem(ADMIN_REDIRECT_KEY);
  if (value !== "1") return false;
  sessionStorage.removeItem(ADMIN_REDIRECT_KEY);
  return true;
}
