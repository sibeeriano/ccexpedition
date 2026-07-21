import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings } from "../utils/settings";
import { useUsdExchangeQuotes } from "../hooks/useUsdExchangeQuotes";
import type { UserUsdExchangeCasa } from "../utils/usdExchange";
import { UsdExchangeCasaTabs } from "./settings/UsdExchangeCasaTabs";

type UsdRateHomeNoticeProps = {
  language: AppSettings["language"];
  defaultCasa: UserUsdExchangeCasa;
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

export function UsdRateHomeNotice({
  language,
  defaultCasa,
}: UsdRateHomeNoticeProps) {
  const { t } = useTranslation();
  const locale = language === "es" ? "es-AR" : "en-US";
  const [activeCasa, setActiveCasa] = useState<UserUsdExchangeCasa>(defaultCasa);
  const { activeQuote, loading, error } = useUsdExchangeQuotes(activeCasa);
  const rateTypeLabel = t(`profile.usdExchange.${activeCasa}`);
  const formattedDate =
    activeQuote?.fecha &&
    new Date(`${activeQuote.fecha}T12:00:00`).toLocaleDateString(locale, {
      dateStyle: "medium",
    });

  useEffect(() => {
    setActiveCasa(defaultCasa);
  }, [defaultCasa]);

  return (
    <div className="flex w-full min-w-0 max-w-md items-end sm:max-w-lg">
      <div className="w-full rounded-2xl border border-white/10 bg-surface px-3.5 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            {t("profile.usdRateHomeTitle")}
          </p>
          {!loading && !error && activeQuote && formattedDate && (
            <p className="text-[10px] text-zinc-500 sm:text-xs">
              {t("profile.usdRateDate", { date: formattedDate })}
            </p>
          )}
        </div>

        <div className="mt-2">
          <UsdExchangeCasaTabs
            name="usd-rate-home-casa"
            value={activeCasa}
            onChange={setActiveCasa}
          />
        </div>

        <p className="mt-2 text-xs font-medium text-zinc-200 sm:text-sm">
          {t("profile.usdRateCurrentTitle", { type: rateTypeLabel })}
        </p>

        {loading ? (
          <p className="mt-1 text-xs text-zinc-500">{t("profile.usdRateLoading")}</p>
        ) : error || !activeQuote ? (
          <p className="mt-1 text-xs text-zinc-500">{t("profile.usdRateError")}</p>
        ) : (
          <p className="mt-1 font-mono text-money text-xs text-zinc-100 sm:text-sm">
            {t("profile.usdRateBuySell", {
              buy: formatRateAmount(activeQuote.compra, language),
              sell: formatRateAmount(activeQuote.venta, language),
            })}
          </p>
        )}
      </div>
    </div>
  );
}
