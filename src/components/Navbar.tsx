import type { CurrencySymbol } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const CURRENCIES: CurrencySymbol[] = ["$", "€", "ARS"];

type NavbarProps = {
  onAddCard: () => void;
  onOpenSettings: () => void;
};

export function Navbar({ onAddCard, onOpenSettings }: NavbarProps) {
  const { state, setCurrency } = useApp();
  const { session, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-3">
        <h1 className="shrink-0 text-base font-semibold tracking-tight text-white">
          Card Tracker
        </h1>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <span
            className="hidden max-w-44 truncate text-xs text-zinc-500 sm:inline"
            title={session?.user.email}
          >
            {session?.user.email}
          </span>
          <select
            aria-label="Currency"
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
            onClick={onAddCard}
            className="shrink-0 rounded-md bg-white/10 px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 active:bg-white/20 sm:px-3"
          >
            <span className="sm:hidden">+ Card</span>
            <span className="hidden sm:inline">+ Add Card</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden" aria-hidden>
              ⚙
            </span>
          </button>
          <button
            type="button"
            onClick={signOut}
            className="hidden shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 sm:inline"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
