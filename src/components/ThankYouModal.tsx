import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BRAND_ACCENT, BRAND_CC_COLOR } from "../utils/theme";

const CLOSE_ANIMATION_MS = 140;

type ThankYouModalProps = {
  onClose: () => void;
};

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4 shrink-0"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function WelcomeBadge() {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-base/60 px-3 py-1 text-xs text-zinc-300">
      <span aria-hidden>🎉</span>
      {t("thankYou.badgeBefore")}
      <span className="font-semibold">
        <span style={{ color: BRAND_CC_COLOR }}>cc</span>
        <span className="text-white">Expedition</span>
      </span>
      {t("thankYou.badgeAfter")}
    </span>
  );
}

function PremiumOffer() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-base/50 px-4 py-3.5 text-center sm:px-5 sm:py-4">
      <p className="text-xs leading-relaxed text-zinc-200 sm:text-sm">
        {t("thankYou.premiumBefore")}
        <span className="font-semibold" style={{ color: BRAND_ACCENT }}>
          {t("thankYou.premiumHighlight")}
        </span>
        {t("thankYou.premiumAfter")}
      </p>
    </div>
  );
}

export function ThankYouModal({ onClose }: ThankYouModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closedRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const finishClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closedRef.current) return;
    setClosing(true);
    finishClose();
    window.setTimeout(() => dialogRef.current?.close(), CLOSE_ANIMATION_MS);
  }, [finishClose]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      aria-labelledby={titleId}
      className={`m-auto block w-[calc(100%-1.5rem)] max-w-3xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-surface p-0 text-zinc-200 shadow-2xl backdrop:bg-black/70 ${
        closing ? "modal-closing" : ""
      }`}
    >
      <div className="flex flex-col">
        <div className="flex justify-center px-5 pt-5 sm:px-6 sm:pt-6">
          <WelcomeBadge />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <aside className="flex items-center justify-center px-5 py-5 text-center sm:w-[42%] sm:px-6 sm:py-6">
            <img
              src="/gatito7.png"
              alt=""
              className="h-40 w-auto max-w-full object-contain sm:h-48 lg:h-52"
            />
          </aside>

          <section className="flex flex-col items-center justify-center px-5 py-5 text-center sm:flex-1 sm:px-6 sm:py-6">
            <h2
              id={titleId}
              className="text-xl font-bold leading-snug text-white sm:text-2xl"
            >
              {t("thankYou.titleBefore")}
              <span style={{ color: BRAND_ACCENT }}>
                {t("thankYou.titleHighlight")}
              </span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-300">
              {t("thankYou.body")}
            </p>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400 sm:mt-8 sm:text-sm">
              <span style={{ color: BRAND_ACCENT }}>
                <CalendarIcon />
              </span>
              {t("thankYou.betaBefore")}
              <span className="font-medium" style={{ color: BRAND_ACCENT }}>
                {t("thankYou.betaDate")}
              </span>
              {t("thankYou.betaAfter")}
            </p>
          </section>
        </div>

        <div className="px-5 sm:px-6">
          <PremiumOffer />
        </div>

        <form
          method="dialog"
          className="px-5 pb-5 pt-4 text-center sm:px-6 sm:pt-5"
          onSubmit={() => {
            setClosing(true);
            finishClose();
          }}
        >
          <p className="text-sm text-zinc-300">
            {t("thankYou.footerBefore")}
            <span className="font-semibold">
              <span style={{ color: BRAND_CC_COLOR }}>cc</span>
              <span className="text-white">Expedition</span>
            </span>
            {t("thankYou.footerAfter")}
          </p>
          <button
            type="submit"
            className="btn-primary relative z-10 mx-auto mt-4 block cursor-pointer px-10 py-2.5 text-sm"
          >
            {t("thankYou.cta")}
          </button>
        </form>
      </div>
    </dialog>
  );
}
