import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { DevSignature } from "./DevSignature";
import { LanguageToggle } from "./LanguageToggle";

type Mode = "sign-in" | "sign-up";

export function Login() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    const errorMessage =
      mode === "sign-in"
        ? await signIn(email, password, remember)
        : await signUp(email, password);

    setSubmitting(false);
    if (errorMessage) {
      setError(errorMessage);
    } else if (mode === "sign-up") {
      setNotice(t("login.accountCreated"));
      setMode("sign-in");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-surface p-6">
        <LanguageToggle className="absolute right-4 top-4" />

        <h1 className="brand-title text-center text-lg font-semibold">
          {t("login.brandName")}
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-300">
          {t("login.slogan")}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500">
          {mode === "sign-in"
            ? t("login.signInSubtitle")
            : t("login.signUpSubtitle")}
        </p>

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
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-xs font-medium text-zinc-400"
            >
              {t("login.password")}
            </label>
            <input
              id="login-password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
            />
          </div>

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
            {submitting
              ? t("login.pleaseWait")
              : mode === "sign-in"
                ? t("login.signIn")
                : t("login.signUp")}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setError(null);
            setNotice(null);
          }}
          className="mt-4 w-full text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {mode === "sign-in"
            ? t("login.toggleToSignUp")
            : t("login.toggleToSignIn")}
        </button>
      </div>

      <DevSignature />
    </div>
  );
}
