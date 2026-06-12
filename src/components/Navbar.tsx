import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getWorkspaceTitle } from "../utils/theme";
import { BrandName } from "./BrandName";
import { LanguageToggle } from "./LanguageToggle";

function emailWithoutAt(email: string): string {
  const at = email.indexOf("@");
  return at === -1 ? email : email.slice(0, at);
}

type NavbarProps = {
  onAddCard: () => void;
  onOpenSettings: () => void;
  demoMode?: boolean;
  onExitDemo?: () => void;
  onSignUp?: () => void;
};

export function Navbar({
  onAddCard,
  onOpenSettings,
  demoMode = false,
  onExitDemo,
  onSignUp,
}: NavbarProps) {
  const { t } = useTranslation();
  const { state } = useApp();
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

  const workspaceTitle = getWorkspaceTitle(state.settings.titleText);
  const userEmail = session?.user.email ?? "";
  const userLabel = userEmail ? emailWithoutAt(userEmail) : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto grid min-h-14 w-full min-w-0 max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-1.5 px-3 py-1.5 sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:px-4">
        {userLabel || demoMode ? (
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/logoBN.png"
              alt=""
              className="size-8 shrink-0 object-contain sm:size-9"
            />
            {demoMode ? (
              <span className="hidden rounded-full bg-brand-accent/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brand-accent sm:inline">
                {t("demo.badge")}
              </span>
            ) : (
              <span
                className="hidden min-w-0 truncate text-xs text-zinc-500 sm:inline"
                title={userEmail}
              >
                {userLabel}
              </span>
            )}
          </div>
        ) : (
          <div className="min-w-0" aria-hidden />
        )}

        <div
          className="flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-center sm:max-w-md"
          title={workspaceTitle ? `ccExpedition — ${workspaceTitle}` : "ccExpedition"}
        >
          <p className="whitespace-nowrap text-xs font-semibold tracking-tight sm:text-base">
            <BrandName />
          </p>
          {workspaceTitle && (
            <p
              className="hidden max-w-full truncate text-xs font-medium sm:block sm:text-sm"
              style={{ color: "var(--color-workspace-title)" }}
            >
              {workspaceTitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
          <button
            type="button"
            data-tour="add-card"
            onClick={onAddCard}
            className="btn-primary inline-flex shrink-0 px-2.5 py-1.5 text-xs sm:hidden"
          >
            {t("nav.addCardShort")}
          </button>
          <button
            type="button"
            data-tour="add-card"
            onClick={onAddCard}
            className="btn-primary hidden shrink-0 px-4 py-2 text-sm sm:inline-flex"
          >
            {t("nav.addCard")}
          </button>

          <LanguageToggle className="hidden sm:flex" />

          <button
            type="button"
            data-tour="settings"
            onClick={onOpenSettings}
            aria-label={t("nav.settings")}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 sm:size-9"
          >
            <CogIcon />
          </button>

          {demoMode ? (
            <button
              type="button"
              onClick={onExitDemo}
              className="hidden rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 sm:inline-flex"
            >
              {t("demo.exit")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label={t("nav.signOut")}
              className="hidden size-9 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400 sm:flex"
            >
              <PowerIcon />
            </button>
          )}

          <div ref={menuRef} className="relative sm:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={t("nav.menu")}
              onClick={() => setMenuOpen((open) => !open)}
              className="relative z-[60] flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
            >
              <MenuIcon open={menuOpen} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label={t("common.close")}
                  className="fixed inset-0 z-40 bg-black/25"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  id={menuId}
                  className="fixed right-3 top-14 z-50 w-56 rounded-lg border border-white/10 bg-surface py-2 shadow-xl"
                >
                  {(userLabel || demoMode) && (
                    <p
                      className="truncate border-b border-white/5 px-3.5 py-2 text-xs text-zinc-500"
                      title={demoMode ? t("demo.badge") : userEmail}
                    >
                      {demoMode ? t("demo.badge") : userLabel}
                    </p>
                  )}

                  <div className="space-y-1 px-2 py-1.5">
                    {demoMode && onSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onSignUp();
                        }}
                        className="btn-primary w-full px-3 py-2 text-left text-sm"
                      >
                        {t("demo.createAccount")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        if (demoMode) {
                          onExitDemo?.();
                          return;
                        }
                        void signOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <PowerIcon />
                      {demoMode ? t("demo.exit") : t("nav.signOut")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
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

function CogIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      className="size-[1.35rem]"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      className="size-[1.35rem] shrink-0"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
      />
    </svg>
  );
}
