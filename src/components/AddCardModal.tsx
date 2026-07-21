import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import {
  CARD_COLOR_PRESETS,
  getCardBackgroundPresetsForTheme,
  getCardChipStyle,
  getDefaultCardBackgroundForTheme,
} from "../utils/theme";
import { Modal, useModalClose } from "./Modal";

type AddCardModalProps = {
  onClose: () => void;
};

export function AddCardModal({ onClose }: AddCardModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={t("addCard.title")} onClose={onClose}>
      <CardForm />
    </Modal>
  );
}

type ColorSwatchPickerProps = {
  name: string;
  value: string;
  presets: { color: string }[];
  onChange: (color: string) => void;
  getAriaLabel: (hex: string) => string;
};

function ColorSwatchPicker({
  name,
  value,
  presets,
  onChange,
  getAriaLabel,
}: ColorSwatchPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-2 pt-1">
      {presets.map(({ color: hex }) => (
        <label key={hex} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={hex}
            checked={value === hex}
            onChange={() => onChange(hex)}
            className="sr-only"
            aria-label={getAriaLabel(hex)}
          />
          <span
            className={`block size-7 rounded-full transition-transform ${
              value === hex
                ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-base"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: hex }}
          />
        </label>
      ))}
    </div>
  );
}

function CardForm() {
  const { t } = useTranslation();
  const { state, addCard } = useApp();
  const visualTheme = state.settings.visualTheme;
  const backgroundPresets = getCardBackgroundPresetsForTheme(visualTheme);
  const defaultBackground = getDefaultCardBackgroundForTheme(visualTheme);
  const close = useModalClose();
  const [name, setName] = useState("");
  const [holder, setHolder] = useState("");
  const [color, setColor] = useState(CARD_COLOR_PRESETS[0].color);
  const [useBackground, setUseBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackground);
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
      backgroundColor: useBackground ? backgroundColor : null,
    });
    if (errorMessage) {
      setError(errorMessage);
      setSaving(false);
      return;
    }
    close();
  }

  const previewName = name.trim() || t("addCard.cardNamePlaceholder");
  const previewHolder = holder.trim() || t("addCard.holderPlaceholder");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="card-name" className="text-xs font-medium text-zinc-400">
          {t("addCard.cardName")}
        </label>
        <input
          id="card-name"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("addCard.cardNamePlaceholder")}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="card-holder" className="text-xs font-medium text-zinc-400">
          {t("addCard.holderLabel")}
        </label>
        <input
          id="card-holder"
          type="text"
          required
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
          placeholder={t("addCard.holderPlaceholder")}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-medium text-zinc-400">
          {t("addCard.color")}
        </legend>
        <ColorSwatchPicker
          name="card-color"
          value={color}
          presets={CARD_COLOR_PRESETS}
          onChange={setColor}
          getAriaLabel={(hex) => t("addCard.colorOption", { hex })}
        />
      </fieldset>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={useBackground}
            onChange={(e) => {
              const checked = e.target.checked;
              setUseBackground(checked);
              if (checked) {
                setBackgroundColor(defaultBackground);
              }
            }}
            className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-base text-white focus:ring-white/20"
          />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-zinc-400">
              {t("addCard.backgroundColor")}
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              {t("addCard.backgroundHint")}
            </span>
          </span>
        </label>
        {useBackground && (
          <ColorSwatchPicker
            name="card-background"
            value={backgroundColor}
            presets={backgroundPresets}
            onChange={setBackgroundColor}
            getAriaLabel={(hex) => t("addCard.colorOption", { hex })}
          />
        )}
      </div>

      <div
        className="rounded-lg border border-white/10 px-3 py-2"
        style={getCardChipStyle(
          {
            color,
            backgroundColor: useBackground ? backgroundColor : null,
          },
          { selected: true, visualTheme },
        )}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-white">{previewName}</span>
        </span>
        <span className="mt-0.5 block text-xs text-zinc-400">{previewHolder}</span>
      </div>

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
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
        >
          {saving ? t("common.saving") : t("addCard.submit")}
        </button>
      </div>
    </form>
  );
}
