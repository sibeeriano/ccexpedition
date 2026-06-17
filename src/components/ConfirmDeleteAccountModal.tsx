import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

const CONFIRM_TOKEN = "DELETE";

type ConfirmDeleteAccountModalProps = {
  onClose: () => void;
  onConfirm: () => Promise<string | null | void>;
};

export function ConfirmDeleteAccountModal({
  onClose,
  onConfirm,
}: ConfirmDeleteAccountModalProps) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText === CONFIRM_TOKEN;

  async function handleConfirm() {
    if (!canConfirm || deleting) return;
    setDeleting(true);
    setError(null);
    const result = await onConfirm();
    setDeleting(false);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  }

  return (
    <Modal title={t("profile.deleteAccount")} onClose={onClose} closeOnBackdropClick>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-300">{t("profile.deleteAccountMessage")}</p>
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {t("profile.deleteAccountWarning")}
        </p>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="delete-account-confirm"
            className="text-sm text-zinc-300"
          >
            {t("profile.deleteAccountConfirmLabel", { token: CONFIRM_TOKEN })}
          </label>
          <input
            id="delete-account-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="rounded-md border border-white/10 bg-base px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
            placeholder={CONFIRM_TOKEN}
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!canConfirm || deleting}
            className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? t("confirmDelete.deleting") : t("profile.deleteAccount")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
