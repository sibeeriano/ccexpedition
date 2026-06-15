import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

type ConfirmDeleteModalProps = {
  title: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<string | null | void>;
  onClose: () => void;
};

export function ConfirmDeleteModal({
  title,
  message,
  warning,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (deleting) return;
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
    <Modal title={title} onClose={onClose} closeOnBackdropClick>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-300">{message}</p>
        {warning && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {warning}
          </p>
        )}
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
            disabled={deleting}
            className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {deleting
              ? t("confirmDelete.deleting")
              : (confirmLabel ?? t("common.delete"))}
          </button>
        </div>
      </div>
    </Modal>
  );
}
