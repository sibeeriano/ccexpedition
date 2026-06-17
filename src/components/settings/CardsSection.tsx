import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import type { Card } from "../../types";
import {
  CARD_BACKGROUND_PRESETS,
  CARD_COLOR_PRESETS,
  DEFAULT_CARD_BACKGROUND,
  getCardChipStyle,
  hasCardBackground,
} from "../../utils/theme";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import {
  ColorPickerField,
  SettingsCheckbox,
} from "./SettingsFields";

export function CardsSection() {
  const { t } = useTranslation();
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

  if (state.cards.length === 0) {
    return <p className="text-sm text-zinc-500">{t("settings.noCards")}</p>;
  }

  return (
    <>
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
