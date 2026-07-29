import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type NewsImageLightboxProps = {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
};

export function NewsImageLightbox({
  src,
  alt,
  caption,
  onClose,
}: NewsImageLightboxProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => dialogRef.current?.close(), 140);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onMouseDown={(e) => {
        if (e.target === dialogRef.current) requestClose();
      }}
      aria-label={alt}
      className={`m-auto flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl flex-col overflow-hidden rounded-xl border-0 bg-transparent p-0 shadow-none backdrop:bg-black/85 ${
        closing ? "modal-closing" : ""
      }`}
    >
      <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col">
        <button
          type="button"
          onClick={requestClose}
          aria-label={t("news.closeImage")}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1 text-xl leading-none text-white transition-colors hover:bg-black/80"
        >
          ×
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[calc(100dvh-4rem)] w-full object-contain"
        />
        {caption && (
          <p className="bg-black/60 px-4 py-2 text-center text-sm text-zinc-200">
            {caption}
          </p>
        )}
      </div>
    </dialog>
  );
}
