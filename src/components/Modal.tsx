/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

const CLOSE_ANIMATION_MS = 140;

const ModalCloseContext = createContext<() => void>(() => {});

/** Lets form content close the modal with the exit animation. */
export function useModalClose(): () => void {
  return useContext(ModalCloseContext);
}

type ModalProps = {
  title: string;
  onClose: () => void;
  /** Set to true to close the modal when clicking the backdrop. */
  closeOnBackdropClick?: boolean;
  children: ReactNode;
};

/**
 * Accessible modal built on the native <dialog> element:
 * focus trap, ESC-to-close and backdrop come for free.
 * Open/close are animated with a subtle fade + scale (see index.css).
 */
export function Modal({
  title,
  onClose,
  closeOnBackdropClick = false,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => dialogRef.current?.close(), CLOSE_ANIMATION_MS);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        // Intercept ESC so the exit animation can play first.
        e.preventDefault();
        requestClose();
      }}
      onMouseDown={(e) => {
        // Clicks on the backdrop land on the dialog element itself.
        if (closeOnBackdropClick && e.target === dialogRef.current)
          requestClose();
      }}
      aria-labelledby={titleId}
      className={`m-auto flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-white/10 bg-surface p-0 text-zinc-200 shadow-xl backdrop:bg-black/60 ${
        closing ? "modal-closing" : ""
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <h2 id={titleId} className="text-sm font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="rounded-md px-2 py-0.5 text-lg leading-none text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            ×
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ModalCloseContext.Provider value={requestClose}>
            {children}
          </ModalCloseContext.Provider>
        </div>
      </div>
    </dialog>
  );
}
