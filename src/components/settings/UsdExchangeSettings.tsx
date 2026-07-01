import { useTranslation } from "react-i18next";
import type { AppSettings } from "../../utils/settings";
import {
  USER_USD_EXCHANGE_CASAS,
  type UserUsdExchangeCasa,
} from "../../utils/usdExchange";
import type { UsdExchangeState } from "../../context/AppContext";
import { SettingsCheckbox } from "./SettingsFields";

type UsdExchangeSettingsProps = {
  settings: AppSettings;
  usdExchange: UsdExchangeState;
  onApplySettings: (settings: AppSettings) => void;
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
  settings,
  usdExchange,
  onApplySettings,
}: UsdExchangeSettingsProps) {
  const { t } = useTranslation();
  const locale = settings.language === "es" ? "es-AR" : "en-US";

  function handleCasaChange(casa: UserUsdExchangeCasa) {
    if (settings.usdExchangeCasa === casa) return;
    onApplySettings({ ...settings, usdExchangeCasa: casa });
  }

  const rateTypeLabel = t(`profile.usdExchange.${usdExchange.casa}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-white/10 bg-base/40 p-3">
        <p className="text-sm font-medium text-zinc-200">
          {t("profile.usdRateTitle")}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{t("profile.usdRateSubtitle")}</p>

        <fieldset className="mt-3">
          <legend className="sr-only">{t("profile.usdRateTitle")}</legend>
          <div className="grid grid-cols-3 gap-1 rounded-md bg-base p-1">
            {USER_USD_EXCHANGE_CASAS.map((casa) => (
              <label
                key={casa}
                className={`cursor-pointer rounded px-2 py-1.5 text-center text-xs font-medium transition-colors sm:text-sm ${
                  settings.usdExchangeCasa === casa
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="usd-exchange-casa"
                  value={casa}
                  checked={settings.usdExchangeCasa === casa}
                  onChange={() => handleCasaChange(casa)}
                  className="sr-only"
                />
                {t(`profile.usdExchange.${casa}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-3 rounded-md bg-base/60 px-3 py-2 text-xs text-zinc-400">
          {usdExchange.loading ? (
            t("profile.usdRateLoading")
          ) : usdExchange.error ? (
            t("profile.usdRateError")
          ) : usdExchange.rate ? (
            <>
              <p className="font-medium text-zinc-300">
                {t("profile.usdRateCurrentTitle", { type: rateTypeLabel })}
              </p>
              <p className="mt-1 font-mono text-zinc-200">
                {t("profile.usdRateBuySell", {
                  buy: formatRateAmount(usdExchange.compra, settings.language),
                  sell: formatRateAmount(usdExchange.rate, settings.language),
                })}
              </p>
              <p className="mt-1 text-zinc-500">
                {t("profile.usdRateDate", {
                  date: usdExchange.fecha
                    ? new Date(`${usdExchange.fecha}T12:00:00`).toLocaleDateString(
                        locale,
                        { dateStyle: "medium" },
                      )
                    : "—",
                })}
              </p>
              <p className="mt-2 text-zinc-500">{t("profile.usdRateConversionNote")}</p>
            </>
          ) : (
            t("profile.usdRateError")
          )}
        </div>
      </div>

      <SettingsCheckbox
        id="profile-convert-usd"
        label={t("profile.convertUsdToArs")}
        hint={t("profile.convertUsdToArsHint")}
        checked={settings.convertUsdToArs}
        onChange={(checked) => {
          onApplySettings({ ...settings, convertUsdToArs: checked });
        }}
      />
    </div>
  );
}
