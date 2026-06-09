import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Modal, useModalClose } from "./Modal";

const PALETTE = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

type AddCardModalProps = {
  onClose: () => void;
};

export function AddCardModal({ onClose }: AddCardModalProps) {
  return (
    <Modal title="Add Card" onClose={onClose}>
      <CardForm />
    </Modal>
  );
}

// Rendered inside <Modal> so useModalClose can trigger the exit animation.
function CardForm() {
  const { addCard } = useApp();
  const close = useModalClose();
  const [name, setName] = useState("");
  const [holder, setHolder] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedHolder = holder.trim();
    if (!trimmedName || !trimmedHolder || saving) return;

    setSaving(true);
    setError(null);
    const errorMessage = await addCard({
      name: trimmedName,
      holder: trimmedHolder,
      color,
    });
    if (errorMessage) {
      setError(errorMessage);
      setSaving(false);
      return;
    }
    close();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="card-name" className="text-xs font-medium text-zinc-400">
          Card Name
        </label>
        <input
          id="card-name"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mastercard BBVA"
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="card-holder" className="text-xs font-medium text-zinc-400">
          Holder
        </label>
        <input
          id="card-holder"
          type="text"
          required
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
          placeholder="e.g. Lourdes"
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs font-medium text-zinc-400">
          Color
        </legend>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((hex) => (
            <label key={hex} className="cursor-pointer">
              <input
                type="radio"
                name="card-color"
                value={hex}
                checked={color === hex}
                onChange={() => setColor(hex)}
                className="sr-only"
                aria-label={`Color ${hex}`}
              />
              <span
                className={`block size-7 rounded-full transition-transform ${
                  color === hex
                    ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-surface"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: hex }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add Card"}
        </button>
      </div>
    </form>
  );
}
