import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChangePasswordModal } from "../ChangePasswordModal";
import { ConfirmDeleteAccountModal } from "../ConfirmDeleteAccountModal";
import { SettingsCheckbox } from "./SettingsFields";

type AccountSectionProps = {
  demoMode: boolean;
  email: string;
  keepSignedIn: boolean;
  onKeepSignedInChange: (checked: boolean) => void;
  onSendRecoveryEmail: () => Promise<boolean>;
  onDeleteAccount: () => Promise<string | null>;
};

export function AccountSection({
  demoMode,
  email,
  keepSignedIn,
  onKeepSignedInChange,
  onSendRecoveryEmail,
  onDeleteAccount,
}: AccountSectionProps) {
  const { t } = useTranslation();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  async function handleSendRecoveryEmail() {
    if (!email || sendingRecovery || demoMode) return;
    setSendingRecovery(true);
    setRecoverySent(false);
    const ok = await onSendRecoveryEmail();
    setSendingRecovery(false);
    if (ok) {
      setRecoverySent(true);
    }
  }

  if (demoMode) {
    return (
      <p className="text-sm text-zinc-400">{t("profile.demoAccountHint")}</p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("profile.userEmail")}
          </span>
          <span className="break-all text-sm text-white">{email}</span>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
          <p className="text-sm font-medium text-zinc-200">
            {t("profile.securitySection")}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="self-start rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              {t("profile.changePassword")}
            </button>
            <button
              type="button"
              onClick={() => void handleSendRecoveryEmail()}
              disabled={sendingRecovery}
              className="self-start rounded-md border border-white/10 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              {sendingRecovery
                ? t("login.pleaseWait")
                : t("profile.sendRecoveryEmail")}
            </button>
          </div>
          {recoverySent && (
            <p className="text-xs text-emerald-400">{t("login.resetEmailSent")}</p>
          )}
          <p className="text-xs text-zinc-500">
            {t("profile.changePasswordShortHint")}
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <SettingsCheckbox
            id="profile-keep-signed-in"
            label={t("login.keepSignedIn")}
            hint={t("profile.keepSignedInHint")}
            checked={keepSignedIn}
            onChange={onKeepSignedInChange}
          />
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-4">
          <p className="text-sm font-medium text-red-300">{t("profile.dangerZone")}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {t("profile.deleteAccountShortHint")}
          </p>
          <button
            type="button"
            onClick={() => setDeleteAccountOpen(true)}
            className="mt-3 rounded-md border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            {t("profile.deleteAccount")}
          </button>
        </div>
      </div>

      {changePasswordOpen && (
        <ChangePasswordModal
          email={email}
          onClose={() => setChangePasswordOpen(false)}
        />
      )}

      {deleteAccountOpen && (
        <ConfirmDeleteAccountModal
          onClose={() => setDeleteAccountOpen(false)}
          onConfirm={onDeleteAccount}
        />
      )}
    </>
  );
}
