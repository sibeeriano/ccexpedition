import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { validateNewPassword } from "../utils/authErrors";
import { DevSignature } from "./DevSignature";
import { LanguageToggle } from "./LanguageToggle";
import { PasswordField } from "./PasswordField";

export function ResetPassword() {
  const { t } = useTranslation();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t("login.passwordMismatch"));
      return;
    }

    const validationError = validateNewPassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const errorMessage = await updatePassword(password);
    setSubmitting(false);

    if (errorMessage) {
      setError(errorMessage);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-surface p-6">
        <LanguageToggle className="absolute right-4 top-4" />

        <div className="flex justify-center">
          <img
            src="/logo2.png"
            alt={t("login.brandName")}
            className="h-40 w-auto max-w-full object-contain"
          />
        </div>
        <p className="mt-2 text-center text-sm font-medium text-white">
          {t("login.resetPasswordTitle")}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500">
          {t("login.resetPasswordSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <PasswordField
            id="reset-password"
            label={t("login.newPassword")}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            autoFocus
          />

          <PasswordField
            id="reset-password-confirm"
            label={t("login.confirmPassword")}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            {submitting ? t("login.pleaseWait") : t("login.saveNewPassword")}
          </button>
        </form>
      </div>

      <DevSignature />
    </div>
  );
}
