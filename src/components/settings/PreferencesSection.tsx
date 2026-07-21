import { useTranslation } from "react-i18next";
import type { CurrencySymbol } from "../../types";
import type { AppSettings } from "../../utils/settings";
import { LanguageToggle } from "../LanguageToggle";
import { SettingsCheckbox, ALERT_CURRENCIES } from "./SettingsFields";
import { UsdExchangeSettings } from "./UsdExchangeSettings";

type PreferencesSectionProps = {
  draft: AppSettings;
  patchDraft: (patch: Partial<AppSettings>) => void;
  onLanguageChange: (language: AppSettings["language"]) => void;
  onExportCsv: () => void;
  idPrefix?: string;
};

export function PreferencesSection({
  draft,
  patchDraft,
  onLanguageChange,
  onExportCsv,
  idPrefix = "settings-preferences",
}: PreferencesSectionProps) {
  const { t } = useTranslation();
  const { currency, showPreviousMonths, showPaidRow, language } = draft;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">{t("settings.language")}</p>
          <p className="text-xs text-zinc-500">{t("profile.languageHint")}</p>
        </div>
        <LanguageToggle
          language={language}
          onLanguageChange={(lang) => {
            patchDraft({ language: lang });
            onLanguageChange(lang);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-white/10 pt-6">
        <label
          htmlFor={`${idPrefix}-currency`}
          className="text-sm font-medium text-zinc-200"
        >
          {t("settings.currency")}
        </label>
        <p className="text-xs text-zinc-500">{t("profile.currencyHint")}</p>
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

      <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">
            {t("profile.displayOptions")}
          </h3>
          <p className="text-xs text-zinc-500">{t("profile.displayOptionsHint")}</p>
        </div>
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

      <div className="border-t border-white/10 pt-6">
        <UsdExchangeSettings draft={draft} patchDraft={patchDraft} />
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">{t("profile.exportCsv")}</p>
          <p className="text-xs text-zinc-500">{t("profile.exportCsvHint")}</p>
        </div>
        <button
          type="button"
          onClick={onExportCsv}
          className="self-start rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 sm:self-auto"
        >
          {t("profile.exportCsv")}
        </button>
      </div>
    </div>
  );
}
