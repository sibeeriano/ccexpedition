import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CurrencySymbol } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getDisplayTitle } from "../utils/theme";

const CURRENCIES: CurrencySymbol[] = ["$", "€", "ARS"];

type NavbarProps = {
  onAddCard: () => void;
  onOpenSettings: () => void;
};

export function Navbar({ onAddCard, onOpenSettings }: NavbarProps) {
  const { t } = useTranslation();
  const { state, setCurrency } = useApp();
  const { session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleAddCard() {
    setMenuOpen(false);
    onAddCard();
  }

  function handleOpenSettings() {
    setMenuOpen(false);
    onOpenSettings();
  }

  function handleSignOut() {
    setMenuOpen(false);
    void signOut();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-3">
        <h1
          className="min-w-0 truncate text-sm font-semibold tracking-tight sm:text-base"
          style={{ color: "var(--color-title)" }}
          title={getDisplayTitle(state.settings.titleText)}
        >
          {getDisplayTitle(state.settings.titleText)}
        </h1>

        {/* Desktop */}
        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <span
            className="max-w-44 truncate text-xs text-zinc-500"
            title={session?.user.email}
          >
            {session?.user.email}
          </span>
          <select
            data-tour="currency"
            aria-label={t("nav.currency")}
            value={state.settings.currency}
            onChange={(e) => setCurrency(e.target.value as CurrencySymbol)}
            className="rounded-md border border-white/10 bg-base px-2 py-1.5 text-sm text-zinc-300 focus:border-white/30 focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-tour="add-card"
            onClick={onAddCard}
            className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 active:bg-white/20"
          >
            {t("nav.addCard")}
          </button>
          <button
            type="button"
            data-tour="settings"
            onClick={onOpenSettings}
            aria-label={t("nav.settings")}
            className="shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t("nav.settings")}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            {t("nav.signOut")}
          </button>
        </div>

        {/* Mobile menu */}
        <div ref={menuRef} className="relative sm:hidden">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={t("nav.menu")}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            <MenuIcon open={menuOpen} />
          </button>

          {menuOpen && (
            <div
              id={menuId}
              className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-lg border border-white/10 bg-surface py-2 shadow-xl"
            >
              {session?.user.email && (
                <p
                  className="truncate border-b border-white/5 px-3.5 py-2 text-xs text-zinc-500"
                  title={session.user.email}
                >
                  {session.user.email}
                </p>
              )}

              <div className="flex flex-col gap-0.5 px-2 py-2">
                <label className="px-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  {t("nav.currency")}
                </label>
                <select
                  data-tour="currency"
                  aria-label={t("nav.currency")}
                  value={state.settings.currency}
                  onChange={(e) =>
                    setCurrency(e.target.value as CurrencySymbol)
                  }
                  className="w-full rounded-md border border-white/10 bg-base px-2.5 py-2 text-sm text-zinc-300 focus:border-white/30 focus:outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-0.5 border-t border-white/5 px-2 py-2">
                <button
                  type="button"
                  data-tour="add-card"
                  onClick={handleAddCard}
                  className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-white/15"
                >
                  {t("nav.addCard")}
                </button>
                <button
                  type="button"
                  data-tour="settings"
                  onClick={handleOpenSettings}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {t("nav.settings")}
                </button>
              </div>

              <div className="border-t border-white/5 px-2 py-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label={t("nav.signOut")}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-400/90 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <PowerIcon />
                  <span>{t("nav.signOut")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
      aria-hidden
    >
      {open ? (
        <path
          fillRule="evenodd"
          d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M2.75 5.75A.75.75 0 0 1 3.5 5h13a.75.75 0 0 1 0 1.5h-13a.75.75 0 0 1-.75-.75Zm0 4.5A.75.75 0 0 1 3.5 9.5h13a.75.75 0 0 1 0 1.5h-13a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h13a.75.75 0 0 1 0 1.5h-13a.75.75 0 0 1-.75-.75Z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4 shrink-0"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 2.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 2.75Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
