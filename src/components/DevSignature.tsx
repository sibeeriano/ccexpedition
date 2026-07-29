import { useTranslation } from "react-i18next";

export function DevSignature() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-xs font-semibold tracking-wide text-zinc-500">
        ccExpedition<sup className="text-[10px]">®</sup>
      </span>
      <span className="text-xs text-zinc-600">
        {t("footer.developedBy")}{" "}
        <a
          href="https://facundo-vara.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          sib.deb
        </a>
      </span>
    </div>
  );
}
