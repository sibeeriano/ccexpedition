import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { validateNewPassword } from "../utils/authErrors";
import { Modal } from "./Modal";
import { PasswordField } from "./PasswordField";

type ChangePasswordModalProps = {
  email: string;
  onClose: () => void;
};

export function ChangePasswordModal({ email, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const { updatePassword, resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

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
      return;
    }

    setSaved(true);
    window.setTimeout(() => onClose(), 1200);
  }

  async function handleSendRecoveryEmail() {
    if (!email || sendingRecovery) return;
    setError(null);
    setSendingRecovery(true);
    const errorMessage = await resetPassword(email);
    setSendingRecovery(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setRecoverySent(true);
  }

  return (
    <Modal title={t("profile.changePassword")} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-400">{t("profile.changePasswordHint")}</p>

        <PasswordField
          id="profile-new-password"
          label={t("login.newPassword")}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          autoFocus
        />

        <PasswordField
          id="profile-confirm-password"
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

        {saved && (
          <p className="text-xs text-emerald-400">{t("profile.passwordUpdated")}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting || saved}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
          >
            {submitting ? t("common.saving") : t("profile.savePassword")}
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-sm text-zinc-200">{t("profile.recoveryEmailTitle")}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {t("profile.recoveryEmailHint")}
        </p>
        {recoverySent ? (
          <p className="mt-3 text-xs text-emerald-400">
            {t("login.resetEmailSent")}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void handleSendRecoveryEmail()}
            disabled={sendingRecovery || !email}
            className="mt-3 rounded-md border border-white/10 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {sendingRecovery
              ? t("login.pleaseWait")
              : t("profile.sendRecoveryEmail")}
          </button>
        )}
      </div>
    </Modal>
  );
}
