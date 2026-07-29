import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../utils/format";
import { BRAND_ACCENT, BRAND_CC_COLOR } from "../utils/theme";
import { BrandName } from "./BrandName";
import { DevSignature } from "./DevSignature";
import { LanguageToggle } from "./LanguageToggle";

type LandingPageProps = {
  onSignIn: () => void;
  onSignUp: () => void;
};

const HOW_IT_WORKS_STEPS = [
  { image: "/gatito1.png", stepKey: "step1" },
  { image: "/gatito2.png", stepKey: "step2" },
  { image: "/gatito3.png", stepKey: "step3" },
  { image: "/gatito4.png", stepKey: "step4" },
] as const;

const LANDING_BUDGET_PREVIEW_AMOUNT = 80_000;

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-3.5"
      aria-hidden
    >
      <path d="m2.695 14.363-1.222 3.955a1 1 0 0 0 1.305 1.227l3.958-1.222a1 1 0 0 0 .632-.633L15.09 6.909a2.25 2.25 0 0 0 0-3.182L11.273 0a2.25 2.25 0 0 0-3.182 0L2.695 5.395a1 1 0 0 0-.633.633Z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="size-6 shrink-0 text-amber-400"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function StepArrow() {
  return (
    <div
      className="hidden shrink-0 items-center justify-center self-center px-1 text-2xl font-bold lg:flex"
      style={{ color: BRAND_ACCENT }}
      aria-hidden="true"
    >
      ›
    </div>
  );
}

function HowItWorksStep({
  stepKey,
  number,
  image,
  title,
  description,
  imageAlt,
}: {
  stepKey: (typeof HOW_IT_WORKS_STEPS)[number]["stepKey"];
  number: number;
  image: string;
  title: string;
  description: string;
  imageAlt: string;
}) {
  const isStep2 = stepKey === "step2";

  return (
    <article className="relative flex h-full w-full min-w-0 flex-col rounded-xl border border-white/10 bg-[#0a1628] px-4 pb-4 pt-10 text-center">
      <div
        className="absolute -top-5 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full text-lg font-bold text-white"
        style={{ backgroundColor: BRAND_ACCENT }}
      >
        {number}
      </div>
      <h3
        className={`text-base font-bold leading-snug text-white sm:text-lg ${isStep2 ? "whitespace-nowrap" : ""}`}
      >
        {title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">
        {description}
      </p>
      <div className="mt-auto flex items-end justify-center pt-4">
        <img
          src={image}
          alt={imageAlt}
          className="h-28 w-auto max-w-full object-contain object-bottom sm:h-32"
        />
      </div>
    </article>
  );
}

export function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  const { t, i18n } = useTranslation();
  const headlineBreakBeforeAccent = i18n.language !== "en";

  return (
    <div className="flex min-h-dvh flex-col bg-[#020617] font-sans text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/logoBN.png"
            alt={t("landing.logoSmallAlt")}
            className="brand-logo h-9 w-9 shrink-0 object-contain"
          />
          <BrandName className="truncate text-base sm:text-lg" />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle className="mr-1 hidden sm:flex" />
          <button
            type="button"
            onClick={onSignUp}
            className="rounded-full border border-white/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:px-5 sm:py-2 sm:text-sm"
          >
            {t("landing.signUp")}
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-full border border-white/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:px-5 sm:py-2 sm:text-sm"
          >
            {t("landing.signIn")}
          </button>
        </div>
      </header>

      <main className="w-full flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-12">
          <div className="flex w-full justify-center lg:w-1/2">
            <img
              src="/logo2.png"
              alt={t("landing.logoAlt")}
              className="w-full max-w-sm object-contain sm:max-w-md lg:max-w-lg"
            />
          </div>

          <div className="flex w-full flex-col items-center text-center lg:w-1/2">
            <p
              className="text-base font-medium sm:text-lg"
              style={{ color: BRAND_ACCENT }}
            >
              {t("landing.tagline")}
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              {t("landing.headlineLine1")}
              {headlineBreakBeforeAccent && <br />}
              {t("landing.headlineLine2Before")}
              <span style={{ color: BRAND_ACCENT }}>{t("landing.headlineLine2")}</span>
              <br />
              {t("landing.headlineLine3")}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
              <span className="font-bold" style={{ color: BRAND_CC_COLOR }}>
                cc
              </span>
              <span className="font-bold">Expedition</span>
              {t("landing.descriptionLine1")}
              <br />
              {t("landing.descriptionLine2")}
              <br />
              {t("landing.descriptionLine3")}
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-12 py-4 text-lg font-bold text-white transition-colors hover:brightness-95 sm:w-auto sm:px-[3.75rem] sm:py-[1.125rem] sm:text-xl"
                style={{ backgroundColor: BRAND_ACCENT }}
              >
                {t("landing.betaCta")}
                <span
                  aria-hidden="true"
                  className="text-xl leading-none sm:text-2xl"
                >
                  ›
                </span>
              </button>
            </div>

            <p className="mx-auto mt-4 max-w-lg text-center text-xs leading-relaxed text-zinc-400 sm:text-sm">
              {t("landing.heroFootnote")}
            </p>
          </div>
        </section>

        <hr className="mx-auto w-full max-w-6xl border-0 border-t border-white/10" />

        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-14">
          <div className="flex w-full flex-col items-center text-center lg:w-1/2">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t("landing.guilt.title")}
            </h2>
            <p
              className="mt-2 text-xl font-medium sm:text-2xl"
              style={{ color: BRAND_ACCENT }}
            >
              {t("landing.guilt.subtitle")}
            </p>
            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
              {t("landing.guilt.bodyLine1")}
              <br />
              {t("landing.guilt.bodyLine2")}
              <br />
              {t("landing.guilt.bodyLine3")}
              <br />
              {t("landing.guilt.bodyLine4")}
            </p>
            <p
              className="mt-4 text-base font-medium sm:text-lg"
              style={{ color: BRAND_ACCENT }}
            >
              {t("landing.guilt.quote")}
            </p>
          </div>
          <div className="flex w-full justify-center lg:w-1/2">
            <img
              src="/gatito6.png"
              alt={t("landing.guilt.imageAlt")}
              className="w-full max-w-xs object-contain sm:max-w-sm lg:max-w-md"
            />
          </div>
        </section>

        <hr className="mx-auto w-full max-w-6xl border-0 border-t border-white/10" />

        <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-4 sm:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("landing.howItWorks.title")}
          </h2>
          <br />
          <br />

          <div className="mt-10 grid auto-rows-fr grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <HowItWorksStep
                key={step.stepKey}
                stepKey={step.stepKey}
                number={index + 1}
                image={step.image}
                title={t(`landing.howItWorks.${step.stepKey}.title`)}
                description={t(
                  `landing.howItWorks.${step.stepKey}.description`,
                )}
                imageAlt={t(`landing.howItWorks.${step.stepKey}.imageAlt`)}
              />
            ))}
          </div>

          <div className="mt-10 hidden items-stretch gap-2 lg:flex">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <Fragment key={step.stepKey}>
                <div className="flex min-w-0 flex-1 basis-0 self-stretch">
                  <HowItWorksStep
                    stepKey={step.stepKey}
                    number={index + 1}
                    image={step.image}
                    title={t(`landing.howItWorks.${step.stepKey}.title`)}
                    description={t(
                      `landing.howItWorks.${step.stepKey}.description`,
                    )}
                    imageAlt={t(`landing.howItWorks.${step.stepKey}.imageAlt`)}
                  />
                </div>
                {index < HOW_IT_WORKS_STEPS.length - 1 && <StepArrow />}
              </Fragment>
            ))}
          </div>
        </section>

        <hr className="mx-auto w-full max-w-6xl border-0 border-t border-white/10" />

        <section className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6">
          <div className="rounded-xl border border-white/10 bg-[#0a1628] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
              <div className="flex w-full flex-1 flex-col items-center text-center">
                <div className="flex items-start justify-center gap-2">
                  <WarningIcon />
                  <h3 className="text-base font-bold leading-snug text-white sm:text-lg">
                    {t("landing.budgetPreview.title")}
                  </h3>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
                  {t("landing.budgetPreview.description")}
                </p>
                <div className="mt-5 flex justify-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    {t("consolidated.budgetAlert")}
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-money font-medium text-zinc-400">
                        {formatMoney(LANDING_BUDGET_PREVIEW_AMOUNT, "$")}
                      </span>
                      <span className="rounded p-1 text-zinc-500" aria-hidden>
                        <PencilIcon />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <img
                src="/gatito5.png"
                alt={t("landing.budgetPreview.imageAlt")}
                className="h-36 w-auto max-w-[12rem] shrink-0 self-center object-contain sm:h-44 sm:max-w-none lg:h-48"
              />
            </div>
          </div>
        </section>

        <hr className="mx-auto w-full max-w-6xl border-0 border-t border-white/10" />
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-5 pb-8 pt-4 text-center">
        <LanguageToggle className="sm:hidden" />
        <DevSignature />
      </footer>
    </div>
  );
}
