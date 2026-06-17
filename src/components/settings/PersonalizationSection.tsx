import { useTranslation } from "react-i18next";
import type { CurrencySymbol } from "../../types";
import type { AppSettings } from "../../utils/settings";
import {
  ALERT_COLOR_PRESETS,
  BACKGROUND_PRESETS,
  CARD_COLUMN_PRESETS,
  DEFAULT_BACKGROUND,
  DEFAULT_BUDGET_ALERT_COLOR,
  DEFAULT_CARD_COLUMN_COLOR,
  DEFAULT_TITLE_COLOR,
  DEFAULT_WORKSPACE_TITLE,
  deriveSurfaceColor,
  getWorkspaceTitle,
  MAX_TITLE_TEXT_LENGTH,
  TITLE_PRESETS,
} from "../../utils/theme";
import { BrandName } from "../BrandName";
import {
  ALERT_CURRENCIES,
  ColorPickerField,
  SettingsCheckbox,
} from "./SettingsFields";

type PersonalizationSectionProps = {
  draft: AppSettings;
  patchDraft: (patch: Partial<AppSettings>) => void;
  idPrefix?: string;
};

export function PersonalizationSection({
  draft,
  patchDraft,
  idPrefix = "profile",
}: PersonalizationSectionProps) {
  const { t } = useTranslation();
  const {
    backgroundColor,
    titleColor,
    titleText,
    currency,
    budgetAlertColor,
    cardColumnColor,
    showPreviousMonths,
    showPaidRow,
  } = draft;
  const workspaceTitle = getWorkspaceTitle(titleText);

  return (
    <div className="flex flex-col divide-y divide-white/10">
      <div className="pb-5">
        <p className="mb-2 text-xs text-zinc-500">{t("settings.previewLabel")}</p>
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

      <div className="py-5">
        <ColorPickerField
          label={t("settings.backgroundColor")}
          color={backgroundColor}
          presets={BACKGROUND_PRESETS}
          defaultColor={DEFAULT_BACKGROUND}
          inputId={`${idPrefix}-background-color`}
          onChange={(color) => patchDraft({ backgroundColor: color })}
        />
      </div>

      <div className="py-5">
        <ColorPickerField
          label={t("settings.titleColor")}
          color={titleColor}
          presets={TITLE_PRESETS}
          defaultColor={DEFAULT_TITLE_COLOR}
          inputId={`${idPrefix}-title-color`}
          onChange={(color) => patchDraft({ titleColor: color })}
        />
      </div>

      <div className="py-5">
        <ColorPickerField
          label={t("settings.alertColor")}
          color={budgetAlertColor}
          presets={ALERT_COLOR_PRESETS}
          defaultColor={DEFAULT_BUDGET_ALERT_COLOR}
          inputId={`${idPrefix}-alert-color`}
          onChange={(color) => patchDraft({ budgetAlertColor: color })}
        />
        <div className="mt-3 overflow-hidden rounded-md border border-white/10">
          <p className="border-b border-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
            {t("settings.alertColorPreview")}
          </p>
          <div className="grid grid-cols-2 text-xs">
            <div className="border-r border-white/5 px-2.5 py-2 text-zinc-500">
              {t("settings.alertPreviewNormal")}
            </div>
            <div className="px-2.5 py-2 text-right text-zinc-300">
              {t("settings.alertPreviewNormalAmount", { currency })}
            </div>
            <div className="border-r border-t border-white/5 px-2.5 py-2 text-zinc-500">
              {t("settings.alertPreviewOver")}
            </div>
            <div
              className="border-t border-white/5 px-2.5 py-2 text-right font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, ${budgetAlertColor} 20%, transparent)`,
                color: budgetAlertColor,
              }}
            >
              {t("settings.alertPreviewOverAmount", { currency })}
            </div>
          </div>
        </div>
      </div>

      <div className="py-5">
        <ColorPickerField
          label={t("settings.cardColumnColor")}
          color={cardColumnColor}
          presets={CARD_COLUMN_PRESETS}
          defaultColor={DEFAULT_CARD_COLUMN_COLOR}
          inputId={`${idPrefix}-card-column-color`}
          onChange={(color) => patchDraft({ cardColumnColor: color })}
        />
        <div className="mt-3 overflow-hidden rounded-md border border-white/10">
          <p className="border-b border-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
            {t("settings.cardColumnPreview")}
          </p>
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] text-xs">
            <div
              className="flex items-center gap-1.5 border-r border-white/10 px-2.5 py-2"
              style={{ backgroundColor: cardColumnColor }}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: "#3B82F6" }}
                aria-hidden
              />
              <span className="truncate text-zinc-200">
                {t("settings.columnPreviewCard")}
              </span>
            </div>
            <div
              className="px-2.5 py-2 text-right text-zinc-300"
              style={{ backgroundColor: backgroundColor }}
            >
              {t("settings.columnPreviewAmount", { currency })}
            </div>
            <div
              className="flex items-center border-r border-t border-white/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
              style={{ backgroundColor: deriveSurfaceColor(cardColumnColor) }}
            >
              {t("consolidated.totalAllCards")}
            </div>
            <div
              className="border-t border-white/5 px-2.5 py-1.5 text-right text-[11px] font-medium text-zinc-200"
              style={{ backgroundColor: "color-mix(in srgb, white 3%, transparent)" }}
            >
              {t("settings.columnPreviewTotalAmount", { currency })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-zinc-200">
            {t("profile.displayOptions")}
          </h3>
          <p className="text-xs text-zinc-500">{t("profile.displayOptionsHint")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <SettingsCheckbox
            id={`${idPrefix}-show-previous-months`}
            label={t("settings.showPreviousMonths")}
            hint={t("settings.showPreviousMonthsHint")}
            checked={showPreviousMonths}
            onChange={(show) => patchDraft({ showPreviousMonths: show })}
          />
          <SettingsCheckbox
            id={`${idPrefix}-show-paid-row`}
            label={t("settings.showPaidRow")}
            hint={t("settings.showPaidRowHint")}
            checked={showPaidRow}
            onChange={(show) => patchDraft({ showPaidRow: show })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 py-5">
        <label
          htmlFor={`${idPrefix}-title-text`}
          className="text-sm text-zinc-300"
        >
          {t("settings.workspaceTitle")}
        </label>
        <p className="text-xs text-zinc-500">{t("settings.workspaceTitleHint")}</p>
        <input
          id={`${idPrefix}-title-text`}
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

      <div className="flex flex-col gap-1.5 pt-5">
        <label
          htmlFor={`${idPrefix}-currency`}
          className="text-sm text-zinc-300"
        >
          {t("settings.currency")}
        </label>
        <select
          id={`${idPrefix}-currency`}
          data-tour="currency"
          aria-label={t("settings.currency")}
          value={currency}
          onChange={(e) =>
            patchDraft({ currency: e.target.value as CurrencySymbol })
          }
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          {ALERT_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
