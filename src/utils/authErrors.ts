import type { AuthError, User } from "@supabase/supabase-js";
import i18n from "../i18n";

/** Supabase may return success with empty identities when the email already exists. */
export function isEmailAlreadyRegistered(
  error: AuthError | null,
  user: User | null,
): boolean {
  if (user && user.identities?.length === 0) return true;
  if (!error) return false;

  const message = error.message.toLowerCase();
  return (
    error.code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists")
  );
}

export function mapAuthError(error: AuthError | null): string | null {
  if (!error) return null;

  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return i18n.t("login.invalidCredentials");
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return i18n.t("login.emailNotConfirmed");
  }

  if (
    message.includes("password should be at least") ||
    code === "weak_password"
  ) {
    return i18n.t("login.passwordTooShort");
  }

  return i18n.t("login.authErrorGeneric");
}

export function mapSignUpError(
  error: AuthError | null,
  user: User | null,
): string | null {
  if (isEmailAlreadyRegistered(error, user)) {
    return i18n.t("login.emailAlreadyRegistered");
  }
  return mapAuthError(error);
}
