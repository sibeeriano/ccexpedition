import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { validateNewPassword } from "../utils/authErrors";
import {
  isAdminLoginIdentifier,
  markAdminRedirectIntent,
  resolveLoginEmail,
} from "../utils/adminAuth";
import { DevSignature } from "./DevSignature";
import { LanguageToggle } from "./LanguageToggle";
import { PasswordField } from "./PasswordField";

type Mode = "sign-in" | "sign-up" | "forgot-password";

type LoginProps = {
  onBackToHome: () => void;
  initialMode?: "sign-in" | "sign-up";
};

export function Login({ onBackToHome, initialMode = "sign-in" }: LoginProps) {
  const { t } = useTranslation();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    if (next !== "sign-up") {
      setConfirmPassword("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    let errorMessage: string | null = null;

    if (mode === "forgot-password") {
      errorMessage = await resetPassword(email);
      setSubmitting(false);
      if (errorMessage) {
        setError(errorMessage);
      } else {
        setNotice(t("login.resetEmailSent"));
      }
      return;
    }

    if (mode === "sign-up") {
      const validationError = validateNewPassword(password);
      if (validationError) {
        setSubmitting(false);
        setError(validationError);
        return;
      }
      if (password !== confirmPassword) {
        setSubmitting(false);
        setError(t("login.passwordMismatch"));
        return;
      }

      const signUpResult = await signUp(email, password);
      setSubmitting(false);

      if (signUpResult.error) {
        setError(signUpResult.error);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMode("sign-in");
      setNotice(
        signUpResult.needsEmailConfirmation
          ? t("login.confirmEmailSent", { email })
          : t("login.accountCreated"),
      );
      return;
    }

    const adminLogin = mode === "sign-in" && isAdminLoginIdentifier(email);
    if (adminLogin) {
      markAdminRedirectIntent();
    }

    const signInError = await signIn(
      resolveLoginEmail(email),
      password,
      remember,
    );
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    if (adminLogin) {
      window.location.assign("/admin");
    }
  }

  const subtitle =
    mode === "sign-in"
      ? t("login.signInSubtitle")
      : mode === "sign-up"
        ? t("login.signUpSubtitle")
        : t("login.forgotPasswordSubtitle");

  const submitLabel =
    mode === "sign-in"
      ? t("login.signIn")
      : mode === "sign-up"
        ? t("login.signUp")
        : t("login.sendResetLink");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-surface p-6">
        <button
          type="button"
          onClick={onBackToHome}
          className="absolute left-4 top-4 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
        >
          ← {t("login.backToHome")}
        </button>
        <LanguageToggle className="absolute right-4 top-4" />

        <div className="flex justify-center">
          <img
            src="/logo2.png"
            alt={t("login.brandName")}
            className="h-40 w-auto max-w-full object-contain"
          />
        </div>
        <p className="mt-2 text-center text-sm text-zinc-300">
          {t("login.slogan")}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-xs font-medium text-zinc-400"
            >
              {t("login.email")}
            </label>
            <input
              id="login-email"
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
            />
          </div>

          {mode !== "forgot-password" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-400">
                  {t("login.password")}
                </span>
                {mode === "sign-in" && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {t("login.forgotPassword")}
                  </button>
                )}
              </div>
              <PasswordField
                id="login-password"
                value={password}
                onChange={setPassword}
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
              />
            </div>
          )}

          {mode === "sign-up" && (
            <PasswordField
              id="login-password-confirm"
              label={t("login.confirmPassword")}
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          )}

          {mode === "sign-in" && (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-3.5 cursor-pointer accent-zinc-300"
              />
              {t("login.keepSignedIn")}
            </label>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
          {notice && <p className="text-xs text-emerald-400">{notice}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            {submitting ? t("login.pleaseWait") : submitLabel}
          </button>
        </form>

        {mode === "forgot-password" ? (
          <button
            type="button"
            onClick={() => switchMode("sign-in")}
            className="mt-4 w-full text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {t("login.backToSignIn")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              switchMode(mode === "sign-in" ? "sign-up" : "sign-in")
            }
            className="mt-4 w-full text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {mode === "sign-in"
              ? t("login.toggleToSignUp")
              : t("login.toggleToSignIn")}
          </button>
        )}
      </div>

      <DevSignature />
    </div>
  );
}
