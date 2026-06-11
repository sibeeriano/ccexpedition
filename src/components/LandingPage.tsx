import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

type LandingPageProps = {
  onStart: () => void;
};

const DESKTOP_COVER = {
  es: "/portadaesoscura.png",
  en: "/portadaendark.png",
} as const;

const MOBILE_COVER = {
  es: "/portadaesmovil.png",
  en: "/portadaenmovil.png",
} as const;

function useIsDesktopCover() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "es" ? "es" : "en";
  const isDesktop = useIsDesktopCover();
  const coverSrc = isDesktop ? DESKTOP_COVER[lang] : MOBILE_COVER[lang];
  const ctaLabel =
    lang === "es" ? "Empezar mi expedición" : "Start my expedition";

  const ctaClass =
    "absolute bottom-[3%] left-1/2 z-10 h-[11%] w-[72%] -translate-x-1/2 cursor-pointer rounded-lg border-0 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 md:bottom-[9%] md:h-[11%] md:w-[22%]";

  return (
    <div className="relative min-h-dvh w-full bg-base">
      <LanguageToggle className="absolute right-4 top-4 z-10" />

      <div className="flex min-h-dvh w-full items-center justify-center">
        <div className="relative leading-[0]">
          <img
            src={coverSrc}
            alt={t("landing.coverAlt")}
            className="block max-h-dvh w-full md:h-dvh md:w-auto"
          />

          <button
            type="button"
            onClick={onStart}
            aria-label={ctaLabel}
            className={ctaClass}
          />
        </div>
      </div>
    </div>
  );
}
