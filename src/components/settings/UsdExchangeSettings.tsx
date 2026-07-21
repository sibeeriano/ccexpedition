import { useTranslation } from "react-i18next";
import type { AppSettings } from "../../utils/settings";
import { useUsdExchangeQuotes } from "../../hooks/useUsdExchangeQuotes";
import { UsdExchangeCasaTabs } from "./UsdExchangeCasaTabs";
import { SettingsCheckbox } from "./SettingsFields";

type UsdExchangeSettingsProps = {
  draft: AppSettings;
  patchDraft: (patch: Partial<AppSettings>) => void;
};

function formatRateAmount(
  amount: number | null,
  language: AppSettings["language"],
): string {
  if (amount === null) return "—";
  return amount.toLocaleString(language === "es" ? "es-AR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function UsdExchangeSettings({
  draft,
  patchDraft,
}: UsdExchangeSettingsProps) {
  const { t } = useTranslation();
  const locale = draft.language === "es" ? "es-AR" : "en-US";
  const activeCasa = draft.usdExchangeCasa;
  const { activeQuote, loading, error } = useUsdExchangeQuotes(activeCasa);
  const rateTypeLabel = t(`profile.usdExchange.${activeCasa}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-white/10 bg-base/40 p-3">
        <p className="text-sm font-medium text-zinc-200">
          {t("profile.usdRateTitle")}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{t("profile.usdRateSubtitle")}</p>

        <UsdExchangeCasaTabs
          name="usd-exchange-casa"
          value={activeCasa}
          onChange={(casa) => {
            if (activeCasa !== casa) {
              patchDraft({ usdExchangeCasa: casa });
            }
          }}
        />

        <div className="mt-3 rounded-md bg-base/60 px-3 py-2 text-xs text-zinc-400">
          {loading ? (
            t("profile.usdRateLoading")
          ) : error || !activeQuote ? (
            t("profile.usdRateError")
          ) : (
            <>
              <p className="font-medium text-zinc-300">
                {t("profile.usdRateCurrentTitle", { type: rateTypeLabel })}
              </p>
              <p className="mt-1 font-mono text-zinc-200">
                {t("profile.usdRateBuySell", {
                  buy: formatRateAmount(activeQuote.compra, draft.language),
                  sell: formatRateAmount(activeQuote.venta, draft.language),
                })}
              </p>
              <p className="mt-1 text-zinc-500">
                {t("profile.usdRateDate", {
                  date: activeQuote.fecha
                    ? new Date(`${activeQuote.fecha}T12:00:00`).toLocaleDateString(
                        locale,
                        { dateStyle: "medium" },
                      )
                    : "—",
                })}
              </p>
              <p className="mt-2 text-zinc-500">{t("profile.usdRateConversionNote")}</p>
            </>
          )}
        </div>
      </div>

      <SettingsCheckbox
        id="profile-show-usd-rate-home"
        label={t("profile.showUsdRateOnHome")}
        hint={t("profile.showUsdRateOnHomeHint")}
        checked={draft.showUsdRateOnHome}
        onChange={(checked) => patchDraft({ showUsdRateOnHome: checked })}
      />

      <SettingsCheckbox
        id="profile-convert-usd"
        label={t("profile.convertUsdToArs")}
        hint={t("profile.convertUsdToArsHint")}
        checked={draft.convertUsdToArs}
        onChange={(checked) => patchDraft({ convertUsdToArs: checked })}
      />
    </div>
  );
}
