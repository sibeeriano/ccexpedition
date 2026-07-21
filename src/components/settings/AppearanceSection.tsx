import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings } from "../../utils/settings";
import {
  ALERT_COLOR_PRESETS,
  BACKGROUND_PRESETS,
  CARD_COLUMN_PRESETS,
  DEFAULT_BACKGROUND,
  DEFAULT_BUDGET_ALERT_COLOR,
  DEFAULT_CARD_COLUMN_COLOR,
  DEFAULT_TAB_DASHBOARD_COLOR,
  DEFAULT_TAB_DASHBOARD_TEXT_COLOR,
  DEFAULT_TAB_FUTURE_COLOR,
  DEFAULT_TAB_FUTURE_TEXT_COLOR,
  DEFAULT_TAB_NEWS_COLOR,
  DEFAULT_TAB_NEWS_TEXT_COLOR,
  DEFAULT_TAB_PROFILE_COLOR,
  DEFAULT_TAB_PROFILE_TEXT_COLOR,
  DEFAULT_TITLE_COLOR,
  DEFAULT_WORKSPACE_TITLE,
  GLASS_BACKGROUND,
  GLASS_TITLE_COLOR,
  MAX_TITLE_TEXT_LENGTH,
  NEO_BACKGROUND,
  NEO_TITLE_COLOR,
  RETRO_BACKGROUND,
  RETRO_TITLE_COLOR,
  defaultCardColumnForTheme,
  getWorkspaceTabGradientStyle,
  getWorkspaceTitle,
  isPresetVisualTheme,
  resolveCardColumnColor,
  resolveCardColumnTotalColor,
  type VisualTheme,
  TAB_COLOR_PRESETS,
  TAB_TEXT_PRESETS,
  TITLE_PRESETS,
  WORKSPACE_TAB_KEYS,
  type WorkspaceTabKey,
} from "../../utils/theme";
import { BrandName } from "../BrandName";
import { ColorPickerField } from "./SettingsFields";

type AppearanceSectionProps = {
  draft: AppSettings;
  patchDraft: (patch: Partial<AppSettings>) => void;
  idPrefix?: string;
};

const TAB_SETTING_FIELDS: Record<
  WorkspaceTabKey,
  {
    colorKey: keyof AppSettings;
    textKey: keyof AppSettings;
    defaultColor: string;
    defaultText: string;
    labelKey: string;
  }
> = {
  future: {
    colorKey: "tabFutureColor",
    textKey: "tabFutureTextColor",
    defaultColor: DEFAULT_TAB_FUTURE_COLOR,
    defaultText: DEFAULT_TAB_FUTURE_TEXT_COLOR,
    labelKey: "future.cta",
  },
  news: {
    colorKey: "tabNewsColor",
    textKey: "tabNewsTextColor",
    defaultColor: DEFAULT_TAB_NEWS_COLOR,
    defaultText: DEFAULT_TAB_NEWS_TEXT_COLOR,
    labelKey: "news.cta",
  },
  dashboard: {
    colorKey: "tabDashboardColor",
    textKey: "tabDashboardTextColor",
    defaultColor: DEFAULT_TAB_DASHBOARD_COLOR,
    defaultText: DEFAULT_TAB_DASHBOARD_TEXT_COLOR,
    labelKey: "dashboard.cta",
  },
  profile: {
    colorKey: "tabProfileColor",
    textKey: "tabProfileTextColor",
    defaultColor: DEFAULT_TAB_PROFILE_COLOR,
    defaultText: DEFAULT_TAB_PROFILE_TEXT_COLOR,
    labelKey: "profile.cta",
  },
};

function themeLockedHintKey(theme: VisualTheme): string {
  if (theme === "neobrutalism") return "settings.neoColorsLocked";
  if (theme === "liquidGlass") return "settings.glassColorsLocked";
  return "settings.retroColorsLocked";
}

export function AppearanceSection({
  draft,
  patchDraft,
  idPrefix = "settings-appearance",
}: AppearanceSectionProps) {
  const { t } = useTranslation();
  const {
    backgroundColor,
    titleColor,
    titleText,
    currency,
    budgetAlertColor,
    cardColumnColor,
    visualTheme,
  } = draft;
  const workspaceTitle = getWorkspaceTitle(titleText);
  const [selectedTabId, setSelectedTabId] = useState<WorkspaceTabKey>("future");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const selectedTabFields = TAB_SETTING_FIELDS[selectedTabId];
  const selectedTabColor = draft[selectedTabFields.colorKey] as string;
  const selectedTabTextColor = draft[selectedTabFields.textKey] as string;
  const isPreset = isPresetVisualTheme(visualTheme);
  const previewBackground =
    visualTheme === "win95"
      ? RETRO_BACKGROUND
      : visualTheme === "neobrutalism"
        ? NEO_BACKGROUND
        : visualTheme === "liquidGlass"
          ? GLASS_BACKGROUND
          : backgroundColor;
  const previewTitleColor =
    visualTheme === "win95"
      ? RETRO_TITLE_COLOR
      : visualTheme === "neobrutalism"
        ? NEO_TITLE_COLOR
        : visualTheme === "liquidGlass"
          ? GLASS_TITLE_COLOR
          : titleColor;
  const effectiveCardColumnColor = resolveCardColumnColor(
    cardColumnColor,
    visualTheme,
  );
  const effectiveCardColumnTotalColor = resolveCardColumnTotalColor(
    cardColumnColor,
    visualTheme,
  );

  function handleThemeChange(nextTheme: VisualTheme) {
    const patch: Partial<AppSettings> = { visualTheme: nextTheme };
    const nextDefault = defaultCardColumnForTheme(nextTheme);
    const knownDefaults = [
      DEFAULT_CARD_COLUMN_COLOR,
      defaultCardColumnForTheme("win95"),
      defaultCardColumnForTheme("neobrutalism"),
      defaultCardColumnForTheme("liquidGlass"),
    ];
    if (knownDefaults.includes(cardColumnColor)) {
      patch.cardColumnColor = nextDefault;
    }
    patchDraft(patch);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${idPrefix}-visual-theme`}
          className="text-sm font-medium text-zinc-200"
        >
          {t("settings.visualTheme")}
        </label>
        <select
          id={`${idPrefix}-visual-theme`}
          value={visualTheme}
          onChange={(e) => handleThemeChange(e.target.value as VisualTheme)}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
        >
          <option value="expedition">{t("settings.themeExpedition")}</option>
          <option value="win95">{t("settings.themeRetro")}</option>
          <option value="neobrutalism">{t("settings.themeNeobrutalism")}</option>
          <option value="liquidGlass">{t("settings.themeLiquidGlass")}</option>
        </select>
        <p className="text-xs text-zinc-500">
          {isPreset
            ? t(themeLockedHintKey(visualTheme))
            : t("settings.retroThemeHint")}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs text-zinc-500">{t("settings.previewLabel")}</p>
        <div
          className="rounded-md border border-white/10 px-3 py-2 text-center"
          style={{ backgroundColor: previewBackground }}
        >
          <p className="text-sm font-semibold">
            <BrandName />
          </p>
          {workspaceTitle ? (
            <p
              className="mt-0.5 truncate text-xs font-medium sm:text-sm"
              style={{ color: previewTitleColor }}
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

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${idPrefix}-title-text`}
          className="text-sm font-medium text-zinc-200"
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

      <details
        open={advancedOpen}
        onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
        className="group rounded-lg border border-white/10"
      >
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-200 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            {t("profile.advancedColors")}
            <span className="text-xs text-zinc-500 transition-transform group-open:rotate-180">
              ▾
            </span>
          </span>
          <span className="mt-0.5 block text-xs font-normal text-zinc-500">
            {t("profile.advancedColorsHint")}
          </span>
        </summary>

        <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 px-4">
          {!isPreset && (
            <>
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
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-zinc-200">
                      {t("settings.tabColors")}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {t("settings.tabColorsHint")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${idPrefix}-tab-select`}
                      className="text-sm text-zinc-300"
                    >
                      {t("settings.tabSelect")}
                    </label>
                    <select
                      id={`${idPrefix}-tab-select`}
                      value={selectedTabId}
                      onChange={(e) =>
                        setSelectedTabId(e.target.value as WorkspaceTabKey)
                      }
                      className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                    >
                      {WORKSPACE_TAB_KEYS.map((tabId) => (
                        <option key={tabId} value={tabId}>
                          {t(TAB_SETTING_FIELDS[tabId].labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ColorPickerField
                    label={t("settings.tabColor")}
                    color={selectedTabColor}
                    presets={TAB_COLOR_PRESETS}
                    defaultColor={selectedTabFields.defaultColor}
                    inputId={`${idPrefix}-tab-${selectedTabId}-color`}
                    onChange={(color) =>
                      patchDraft({ [selectedTabFields.colorKey]: color })
                    }
                  />
                  <ColorPickerField
                    label={t("settings.tabTextColor")}
                    color={selectedTabTextColor}
                    presets={TAB_TEXT_PRESETS}
                    defaultColor={selectedTabFields.defaultText}
                    inputId={`${idPrefix}-tab-${selectedTabId}-text`}
                    onChange={(color) =>
                      patchDraft({ [selectedTabFields.textKey]: color })
                    }
                  />

                  <div className="overflow-hidden rounded-md border border-white/10 px-3 py-3">
                    <p className="mb-2 text-[10px] uppercase tracking-wide text-zinc-500">
                      {t("settings.tabColorPreview")}
                    </p>
                    <span
                      className="folder-tab-preview truncate"
                      style={getWorkspaceTabGradientStyle(
                        selectedTabColor,
                        selectedTabTextColor,
                      )}
                    >
                      {t(selectedTabFields.labelKey)}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-md border border-white/10 px-3 py-3">
                    <p className="mb-2 text-[10px] uppercase tracking-wide text-zinc-500">
                      {t("settings.tabColorsPreview")}
                    </p>
                    <div className="flex flex-wrap items-end gap-1">
                      {WORKSPACE_TAB_KEYS.map((tabId) => {
                        const fields = TAB_SETTING_FIELDS[tabId];
                        const tabColor = draft[fields.colorKey] as string;
                        const tabTextColor = draft[fields.textKey] as string;
                        return (
                          <span
                            key={tabId}
                            className="folder-tab-preview min-w-[4.75rem] flex-1 truncate"
                            style={getWorkspaceTabGradientStyle(
                              tabColor,
                              tabTextColor,
                            )}
                          >
                            {t(fields.labelKey)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
            </>
          )}

          <div className="py-5">
            <ColorPickerField
              label={t("settings.cardColumnColor")}
              color={cardColumnColor}
              presets={CARD_COLUMN_PRESETS}
              defaultColor={defaultCardColumnForTheme(visualTheme)}
              inputId={`${idPrefix}-card-column-color`}
              onChange={(color) => patchDraft({ cardColumnColor: color })}
            />
            {isPreset && (
              <p className="mt-2 text-xs text-zinc-500">
                {t("settings.retroGridColumnHint")}
              </p>
            )}
            <div className="mt-3 overflow-hidden rounded-md border border-white/10">
              <p className="border-b border-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
                {t("settings.cardColumnPreview")}
              </p>
              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] text-xs">
                <div
                  className="flex items-center gap-1.5 border-r border-white/10 px-2.5 py-2"
                  style={{ backgroundColor: effectiveCardColumnColor }}
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
                  style={{ backgroundColor: previewBackground }}
                >
                  {t("settings.columnPreviewAmount", { currency })}
                </div>
                <div
                  className="flex items-center border-r border-t border-white/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
                  style={{ backgroundColor: effectiveCardColumnTotalColor }}
                >
                  {t("consolidated.totalAllCards")}
                </div>
                <div
                  className="border-t border-white/5 px-2.5 py-1.5 text-right text-[11px] font-medium text-zinc-200"
                  style={{
                    backgroundColor: "color-mix(in srgb, white 3%, transparent)",
                  }}
                >
                  {t("settings.columnPreviewTotalAmount", { currency })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
