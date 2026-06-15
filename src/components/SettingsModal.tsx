import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import type { CurrencySymbol } from "../types";
import {
  type AppSettings,
  settingsSnapshot,
} from "../utils/settings";
import { BrandName } from "./BrandName";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { LanguageToggle } from "./LanguageToggle";

const CURRENCIES: CurrencySymbol[] = ["$", "€", "ARS"];
import type { Card } from "../types";
import {
  ALERT_COLOR_PRESETS,
  BACKGROUND_PRESETS,
  CARD_BACKGROUND_PRESETS,
  CARD_COLOR_PRESETS,
  DEFAULT_BACKGROUND,
  DEFAULT_BUDGET_ALERT_COLOR,
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_TITLE_COLOR,
  DEFAULT_WORKSPACE_TITLE,
  getCardChipStyle,
  getWorkspaceTitle,
  getPresetId,
  hasCardBackground,
  MAX_TITLE_TEXT_LENGTH,
  TITLE_PRESETS,
  type ColorPreset,
} from "../utils/theme";
import { useAuth } from "../context/AuthContext";
import { replayTourForContext, type TourContext } from "../utils/onboarding";
import { Modal, useModalClose } from "./Modal";

type SettingsModalProps = {
  tourContext: TourContext;
  onClose: () => void;
};

export function SettingsModal({ tourContext, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { state, applySettings } = useApp();
  const [draft, setDraft] = useState<AppSettings>(() => ({ ...state.settings }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const settingsDirty =
    settingsSnapshot(draft) !== settingsSnapshot(state.settings);

  function patchDraft(patch: Partial<AppSettings>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function handleSaveSettings() {
    setSaving(true);
    setSaveError(null);
    const errorMessage = await applySettings(draft);
    setSaving(false);
    if (errorMessage) {
      setSaveError(errorMessage);
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  const saveLabel = saving
    ? t("common.saving")
    : saved
      ? t("settings.saved")
      : t("common.save");

  return (
    <Modal
      title={t("settings.title")}
      onClose={onClose}
      headerActions={
        <div className="flex items-center gap-2">
          {saveError && (
            <span role="alert" className="max-w-28 truncate text-xs text-red-400">
              {saveError}
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleSaveSettings()}
            disabled={saving || (!settingsDirty && !saved)}
            className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/15 disabled:cursor-default disabled:opacity-50"
          >
            {saveLabel}
          </button>
        </div>
      }
    >
      <SettingsContent
        tourContext={tourContext}
        draft={draft}
        patchDraft={patchDraft}
      />
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

function SettingsDivider() {
  return <hr className="border-0 border-t border-white/10" />;
}

type SettingsCheckboxProps = {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function SettingsCheckbox({
  id,
  label,
  hint,
  checked,
  onChange,
}: SettingsCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-md py-0.5"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-base text-white focus:ring-white/20"
      />
      <span className="min-w-0">
        <span className="block text-sm text-zinc-200">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

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

function repeatTutorialLabel(
  t: ReturnType<typeof useTranslation>["t"],
  context: TourContext,
): string {
  switch (context) {
    case "empty":
      return t("settings.repeatTutorialEmpty");
    case "consolidated":
      return t("settings.repeatTutorialConsolidated");
    case "card-detail":
      return t("settings.repeatTutorialCardDetail");
  }
}

type SettingsContentProps = {
  tourContext: TourContext;
  draft: AppSettings;
  patchDraft: (patch: Partial<AppSettings>) => void;
};

function SettingsContent({
  tourContext,
  draft,
  patchDraft,
}: SettingsContentProps) {
  const { t } = useTranslation();
  const close = useModalClose();
  const { session } = useAuth();
  const { state, deleteCard, updateCard } = useApp();
  const [confirmCardId, setConfirmCardId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHolder, setEditHolder] = useState("");
  const [editColor, setEditColor] = useState(CARD_COLOR_PRESETS[0].color);
  const [editUseBackground, setEditUseBackground] = useState(false);
  const [editBackgroundColor, setEditBackgroundColor] = useState(
    DEFAULT_CARD_BACKGROUND,
  );
  const [savingCard, setSavingCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmCard =
    state.cards.find((card) => card.id === confirmCardId) ?? null;
  const confirmCardExpenseCount = confirmCard
    ? state.expenses.filter((expense) => expense.cardId === confirmCard.id)
        .length
    : 0;

  function startEditingCard(card: Card) {
    setEditingCardId(card.id);
    setEditName(card.name);
    setEditHolder(card.holder);
    setEditColor(card.color);
    setEditUseBackground(hasCardBackground(card));
    setEditBackgroundColor(card.backgroundColor ?? DEFAULT_CARD_BACKGROUND);
    setError(null);
  }

  function cancelEditingCard() {
    setEditingCardId(null);
    setEditName("");
    setEditHolder("");
    setEditColor(CARD_COLOR_PRESETS[0].color);
    setEditUseBackground(false);
    setEditBackgroundColor(DEFAULT_CARD_BACKGROUND);
    setError(null);
  }

  async function handleSaveCard(card: Card) {
    const trimmedName = editName.trim();
    const trimmedHolder = editHolder.trim();
    const backgroundColor = editUseBackground ? editBackgroundColor : null;
    if (!trimmedName) {
      setError(t("settings.cardNameRequired"));
      return;
    }
    if (!trimmedHolder) {
      setError(t("settings.holderRequired"));
      return;
    }
    if (
      trimmedName === card.name &&
      trimmedHolder === card.holder &&
      editColor === card.color &&
      backgroundColor === card.backgroundColor
    ) {
      cancelEditingCard();
      return;
    }

    setSavingCard(true);
    setError(null);
    const errorMessage = await updateCard(card.id, {
      name: trimmedName,
      holder: trimmedHolder,
      color: editColor,
      backgroundColor,
    });
    setSavingCard(false);

    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    cancelEditingCard();
  }

  const {
    backgroundColor,
    titleColor,
    titleText,
    language,
    currency,
    budgetAlertColor,
    showPreviousMonths,
    showPaidRow,
  } = draft;
  const workspaceTitle = getWorkspaceTitle(titleText);

  function handleRepeatTutorial() {
    const userId = session?.user.id;
    if (!userId) return;
    const context = tourContext;
    close();
    window.setTimeout(() => {
      replayTourForContext(t, userId, context);
    }, 200);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
      <SettingsDropdown
        title={t("settings.personalize")}
        summary={
          <>
            <span
              className="size-4 shrink-0 rounded border border-white/10"
              style={{ backgroundColor: titleColor }}
            />
            <span
              className="size-4 shrink-0 rounded border border-white/10"
              style={{ backgroundColor }}
            />
            <span
              className="size-4 shrink-0 rounded border border-white/10"
              style={{ backgroundColor: budgetAlertColor }}
            />
            <span className="shrink-0 text-xs text-zinc-500">{currency}</span>
            <span className="truncate text-xs text-zinc-500">
              {workspaceTitle ?? t("settings.workspaceTitleEmpty")}
            </span>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-currency"
              className="text-sm text-zinc-300"
            >
              {t("settings.currency")}
            </label>
            <select
              id="settings-currency"
              data-tour="currency"
              aria-label={t("settings.currency")}
              value={currency}
              onChange={(e) =>
                patchDraft({ currency: e.target.value as CurrencySymbol })
              }
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <ColorPickerField
            label={t("settings.alertColor")}
            color={budgetAlertColor}
            presets={ALERT_COLOR_PRESETS}
            defaultColor={DEFAULT_BUDGET_ALERT_COLOR}
            inputId="settings-alert-color"
            onChange={(color) => patchDraft({ budgetAlertColor: color })}
          />

          <SettingsDivider />

          <div className="flex flex-col gap-3">
            <SettingsCheckbox
              id="settings-show-previous-months"
              label={t("settings.showPreviousMonths")}
              hint={t("settings.showPreviousMonthsHint")}
              checked={showPreviousMonths}
              onChange={(show) => patchDraft({ showPreviousMonths: show })}
            />
            <SettingsCheckbox
              id="settings-show-paid-row"
              label={t("settings.showPaidRow")}
              hint={t("settings.showPaidRowHint")}
              checked={showPaidRow}
              onChange={(show) => patchDraft({ showPaidRow: show })}
            />
          </div>

          <SettingsDivider />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="settings-title-text"
              className="text-sm text-zinc-300"
            >
              {t("settings.workspaceTitle")}
            </label>
            <p className="text-xs text-zinc-500">{t("settings.workspaceTitleHint")}</p>
            <input
              id="settings-title-text"
              type="text"
              value={titleText}
              maxLength={MAX_TITLE_TEXT_LENGTH}
              onChange={(e) => patchDraft({ titleText: e.target.value })}
              placeholder={t("settings.workspaceTitlePlaceholder")}
              className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500">
                {titleText.length}/{MAX_TITLE_TEXT_LENGTH}
              </span>
              {titleText !== DEFAULT_WORKSPACE_TITLE && (
                <button
                  type="button"
                  onClick={() => patchDraft({ titleText: DEFAULT_WORKSPACE_TITLE })}
                  className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                >
                  {t("common.reset")}
                </button>
              )}
            </div>
          </div>

          <SettingsDivider />

          <ColorPickerField
            label={t("settings.titleColor")}
            color={titleColor}
            presets={TITLE_PRESETS}
            defaultColor={DEFAULT_TITLE_COLOR}
            inputId="settings-title-color"
            onChange={(color) => patchDraft({ titleColor: color })}
          />
          <ColorPickerField
            label={t("settings.backgroundColor")}
            color={backgroundColor}
            presets={BACKGROUND_PRESETS}
            defaultColor={DEFAULT_BACKGROUND}
            inputId="settings-background-color"
            onChange={(color) => patchDraft({ backgroundColor: color })}
          />
          <div
            className="rounded-md border border-white/10 px-3 py-2 text-center"
            style={{ backgroundColor }}
          >
            <p className="text-sm font-semibold">
              <BrandName />
            </p>
            {workspaceTitle ? (
              <p
                className="mt-0.5 truncate text-xs font-medium sm:text-sm"
                style={{ color: titleColor }}
              >
                {workspaceTitle}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-zinc-500">
                {t("settings.workspaceTitleEmpty")}
              </p>
            )}
          </div>
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
                            style={{ backgroundColor: editColor }}
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

                        <ColorPickerField
                          label={t("settings.cardColor")}
                          color={editColor}
                          presets={CARD_COLOR_PRESETS}
                          defaultColor={CARD_COLOR_PRESETS[0].color}
                          inputId={`edit-card-color-${card.id}`}
                          onChange={setEditColor}
                        />

                        <SettingsCheckbox
                          id={`edit-card-use-bg-${card.id}`}
                          label={t("settings.cardBackground")}
                          hint={t("settings.cardBackgroundHint")}
                          checked={editUseBackground}
                          onChange={setEditUseBackground}
                        />
                        {editUseBackground && (
                          <ColorPickerField
                            label={t("settings.cardBackground")}
                            color={editBackgroundColor}
                            presets={CARD_BACKGROUND_PRESETS}
                            defaultColor={DEFAULT_CARD_BACKGROUND}
                            inputId={`edit-card-bg-${card.id}`}
                            onChange={setEditBackgroundColor}
                          />
                        )}

                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs font-medium text-zinc-400">
                            {t("settings.cardPreview")}
                          </p>
                          <div
                            className="rounded-lg border border-white/10 px-3 py-2"
                            style={getCardChipStyle(
                              {
                                color: editColor,
                                backgroundColor: editUseBackground
                                  ? editBackgroundColor
                                  : null,
                              },
                              { selected: true },
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: editColor }}
                              />
                              <span className="text-sm font-medium text-white">
                                {editName.trim() || card.name}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs text-zinc-400">
                              {editHolder.trim() || card.holder}
                            </span>
                          </div>
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
                            onClick={() => handleSaveCard(card)}
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
                            className="flex size-6 shrink-0 items-center justify-center rounded-md border border-white/10"
                            style={getCardChipStyle(card)}
                          >
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: card.color }}
                            />
                          </span>
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
                            onClick={() => startEditingCard(card)}
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

      <SettingsDropdown title={t("settings.tutorial")}>
        <button
          type="button"
          onClick={handleRepeatTutorial}
          className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          {repeatTutorialLabel(t, tourContext)}
        </button>
      </SettingsDropdown>

      <SettingsDropdown
        title={t("settings.language")}
        summary={
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {language}
          </span>
        }
      >
        <LanguageToggle
          language={language}
          onLanguageChange={(nextLanguage) =>
            patchDraft({ language: nextLanguage })
          }
        />
      </SettingsDropdown>
      </div>

      {confirmCard && (
        <ConfirmDeleteModal
          title={t("settings.deleteCard")}
          message={t("settings.deleteConfirm", {
            name: confirmCard.name,
            holder: confirmCard.holder,
          })}
          warning={t("settings.deleteWarning", {
            count: confirmCardExpenseCount,
            expenseLabel: t("common.expense", {
              count: confirmCardExpenseCount,
            }),
          })}
          confirmLabel={t("settings.deleteCard")}
          onClose={() => setConfirmCardId(null)}
          onConfirm={() => deleteCard(confirmCard.id)}
        />
      )}
    </>
  );
}
