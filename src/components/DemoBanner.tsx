import { useTranslation } from "react-i18next";
import { useDemoMode } from "../context/DemoModeContext";

export function DemoBanner() {
  const { t } = useTranslation();
  const { goToSignUp } = useDemoMode();

  return (
    <div className="border-b border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-center text-xs text-zinc-200 sm:text-sm">
      <span>{t("demo.banner")}</span>{" "}
      <button
        type="button"
        onClick={goToSignUp}
        className="font-semibold text-brand-accent underline-offset-2 hover:underline"
      >
        {t("demo.createAccount")}
      </button>
    </div>
  );
}
