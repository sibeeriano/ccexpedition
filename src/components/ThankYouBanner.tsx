import { useTranslation } from "react-i18next";
import { BRAND_ACCENT } from "../utils/theme";

export function ThankYouBanner() {
  const { t } = useTranslation();

  return (
    <div
      role="region"
      aria-label={t("thankYou.titleBefore") + t("thankYou.titleHighlight")}
      className="flex w-full flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-3 rounded-xl border border-white/10 bg-surface/80 px-3 py-2 sm:px-4 sm:py-2.5"
    >
      <img
        src="/gatito7.png"
        alt=""
        className="h-9 w-auto shrink-0 object-contain"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug text-white sm:text-sm">
          {t("thankYou.titleBefore")}
          <span style={{ color: BRAND_ACCENT }}>
            {t("thankYou.titleHighlight")}
          </span>
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-zinc-400 sm:text-xs">
          {t("thankYou.premiumBefore")}
          <span className="font-medium" style={{ color: BRAND_ACCENT }}>
            {t("thankYou.premiumHighlight")}
          </span>
          {t("thankYou.premiumAfter")}
          <span className="hidden sm:inline">
            {" · "}
            {t("thankYou.betaBefore")}
            <span className="text-zinc-300">{t("thankYou.betaDate")}</span>
            {t("thankYou.betaAfter")}
          </span>
        </p>
      </div>
    </div>
  );
}
