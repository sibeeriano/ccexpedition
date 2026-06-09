import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "../context/AppContext";
import { useApp } from "../context/AppContext";
import {
  BACKGROUND_PRESETS,
  DEFAULT_BACKGROUND,
  DEFAULT_TITLE_COLOR,
  DEFAULT_TITLE_TEXT,
  getDisplayTitle,
  getPresetId,
  MAX_TITLE_TEXT_LENGTH,
  TITLE_PRESETS,
  type ColorPreset,
} from "../utils/theme";
import { Modal } from "./Modal";

type SettingsModalProps = {
  onClose: () => void;
};

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={t("settings.title")} onClose={onClose}>
      <SettingsContent />
    </Modal>
  );
}

type SettingsDropdownProps = {
  title: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

function SettingsDropdown({
  title,
  summary,
  defaultOpen = false,
  children,
}: SettingsDropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="rounded-lg border border-white/10 bg-base/50">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">{title}</span>
          {summary}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-xs text-zinc-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          className="border-t border-white/5 px-3.5 py-3"
        >
          {children}
        </div>
      )}
    </div>
  );
}

type ColorPickerFieldProps = {
  label: string;
  color: string;
  presets: ColorPreset[];
  defaultColor: string;
  inputId: string;
  onChange: (color: string) => void;
};

function ColorPickerField({
  label,
  color,
  presets,
  defaultColor,
  inputId,
  onChange,
}: ColorPickerFieldProps) {
  const { t } = useTranslation();
  const presetId = getPresetId(presets, color);
  const activeLabel = presetId
    ? t(`theme.presets.${presetId}`)
    : t("common.custom");

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-300">{label}</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = color === preset.color;
          const presetLabel = t(`theme.presets.${preset.id}`);
          return (
            <button
              key={preset.id}
              type="button"
              title={presetLabel}
              aria-label={`${presetLabel} ${label}`}
              aria-pressed={isSelected}
              onClick={() => onChange(preset.color)}
              className={`size-9 rounded-md border transition-transform hover:scale-105 ${
                isSelected
                  ? "border-white/50 ring-2 ring-white/20"
                  : "border-white/10"
              }`}
              style={{ backgroundColor: preset.color }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <input
          id={inputId}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 cursor-pointer rounded-md border border-white/10 bg-transparent p-0.5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-mono text-sm text-zinc-200">
            {color}
          </span>
          <span className="text-xs text-zinc-500">{activeLabel}</span>
        </div>
        {color !== defaultColor && (
          <button
            type="button"
            onClick={() => onChange(defaultColor)}
            className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t("common.reset")}
          </button>
        )}
      </div>
    </div>
  );
}

function SettingsContent() {
  const { t } = useTranslation();
  const {
    state,
    deleteCard,
    updateCard,
    setBackgroundColor,
    setTitleColor,
    setTitleText,
    setLanguage,
  } = useApp();
  const [confirmCardId, setConfirmCardId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHolder, setEditHolder] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmCard =
    state.cards.find((card) => card.id === confirmCardId) ?? null;

  function startEditingCard(
    cardId: string,
    currentName: string,
    currentHolder: string,
  ) {
    setEditingCardId(cardId);
    setEditName(currentName);
    setEditHolder(currentHolder);
    setError(null);
  }

  function cancelEditingCard() {
    setEditingCardId(null);
    setEditName("");
    setEditHolder("");
    setError(null);
  }

  async function handleSaveCard(
    cardId: string,
    currentName: string,
    currentHolder: string,
  ) {
    const trimmedName = editName.trim();
    const trimmedHolder = editHolder.trim();
    if (!trimmedName) {
      setError(t("settings.cardNameRequired"));
      return;
    }
    if (!trimmedHolder) {
      setError(t("settings.holderRequired"));
      return;
    }
    if (
      trimmedName === currentName &&
      trimmedHolder === currentHolder
    ) {
      cancelEditingCard();
      return;
    }

    setSavingCard(true);
    setError(null);
    const errorMessage = await updateCard(cardId, {
      name: trimmedName,
      holder: trimmedHolder,
    });
    setSavingCard(false);

    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    cancelEditingCard();
  }

  async function handleDelete() {
    if (!confirmCard || deleting) return;
    setDeleting(true);
    setError(null);
    const errorMessage = await deleteCard(confirmCard.id);
    setDeleting(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setConfirmCardId(null);
  }

  // Confirmation step
  if (confirmCard) {
    const expenseCount = state.expenses.filter(
      (e) => e.cardId === confirmCard.id,
    ).length;

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-300">
          {t("settings.deleteConfirm", {
            name: confirmCard.name,
            holder: confirmCard.holder,
          })}
        </p>
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {t("settings.deleteWarning", {
            count: expenseCount,
            expenseLabel: t("common.expense", { count: expenseCount }),
          })}
        </p>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmCardId(null)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? t("settings.deleting") : t("settings.deleteCard")}
          </button>
        </div>
      </div>
    );
  }

  const { backgroundColor, titleColor, titleText, language } = state.settings;
  const displayTitle = getDisplayTitle(titleText);

  return (
    <div className="flex flex-col gap-3">
      <SettingsDropdown
        title={t("settings.personalize")}
        summary={
          <>
            <span
              className="size-4 shrink-0 rounded border border-white/10"
              style={{ backgroundColor }}
            />
            <span
              className="size-4 shrink-0 rounded border border-white/10"
              style={{ backgroundColor: titleColor }}
            />
            <span className="truncate text-xs text-zinc-500">{displayTitle}</span>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-language"
              className="text-sm text-zinc-300"
            >
              {t("settings.language")}
            </label>
            <select
              id="settings-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="en">{t("settings.languageEn")}</option>
              <option value="es">{t("settings.languageEs")}</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="settings-title-text"
              className="text-sm text-zinc-300"
            >
              {t("settings.titleText")}
            </label>
            <input
              id="settings-title-text"
              type="text"
              value={titleText}
              maxLength={MAX_TITLE_TEXT_LENGTH}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder={DEFAULT_TITLE_TEXT}
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500">
                {titleText.length}/{MAX_TITLE_TEXT_LENGTH}
              </span>
              {titleText !== DEFAULT_TITLE_TEXT && (
                <button
                  type="button"
                  onClick={() => setTitleText(DEFAULT_TITLE_TEXT)}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                >
                  {t("common.reset")}
                </button>
              )}
            </div>
          </div>

          <ColorPickerField
            label={t("settings.backgroundColor")}
            color={backgroundColor}
            presets={BACKGROUND_PRESETS}
            defaultColor={DEFAULT_BACKGROUND}
            inputId="settings-background-color"
            onChange={setBackgroundColor}
          />
          <ColorPickerField
            label={t("settings.titleColor")}
            color={titleColor}
            presets={TITLE_PRESETS}
            defaultColor={DEFAULT_TITLE_COLOR}
            inputId="settings-title-color"
            onChange={setTitleColor}
          />
          <p
            className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm font-semibold"
            style={{ color: titleColor }}
          >
            {displayTitle}
          </p>
        </div>
      </SettingsDropdown>

      <SettingsDropdown
        title={t("settings.cards")}
        summary={
          <span className="text-xs text-zinc-500">
            {t("common.card", { count: state.cards.length })}
          </span>
        }
      >
        {state.cards.length === 0 ? (
          <p className="py-1 text-sm text-zinc-500">{t("settings.noCards")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {error && editingCardId && (
              <p role="alert" className="text-xs text-red-400">
                {error}
              </p>
            )}
            <ul className="flex flex-col">
              {state.cards.map((card) => {
                const expenseCount = state.expenses.filter(
                  (e) => e.cardId === card.id,
                ).length;
                const isEditing = editingCardId === card.id;

                return (
                  <li
                    key={card.id}
                    className="border-b border-white/5 py-2.5 last:border-b-0"
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: card.color }}
                          />
                          <span className="text-xs text-zinc-500">
                            {expenseCount}{" "}
                            {t("common.expense", { count: expenseCount })}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`edit-card-name-${card.id}`}
                            className="text-xs font-medium text-zinc-400"
                          >
                            {t("settings.cardName")}
                          </label>
                          <input
                            id={`edit-card-name-${card.id}`}
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            className="rounded-md border border-white/10 bg-base px-2.5 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`edit-card-holder-${card.id}`}
                            className="text-xs font-medium text-zinc-400"
                          >
                            {t("common.holder")}
                          </label>
                          <input
                            id={`edit-card-holder-${card.id}`}
                            type="text"
                            value={editHolder}
                            onChange={(e) => setEditHolder(e.target.value)}
                            className="rounded-md border border-white/10 bg-base px-2.5 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditingCard}
                            disabled={savingCard}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveCard(
                                card.id,
                                card.name,
                                card.holder,
                              )
                            }
                            disabled={savingCard}
                            className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
                          >
                            {savingCard ? t("common.saving") : t("common.save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: card.color }}
                          />
                          <span className="truncate text-sm font-medium text-zinc-200">
                            {card.name}
                          </span>
                          <span className="shrink-0 text-xs text-zinc-500">
                            {card.holder} · {expenseCount}{" "}
                            {t("common.expense", { count: expenseCount })}
                          </span>
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              startEditingCard(
                                card.id,
                                card.name,
                                card.holder,
                              )
                            }
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCardId(card.id)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            {t("common.delete")}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </SettingsDropdown>
    </div>
  );
}
