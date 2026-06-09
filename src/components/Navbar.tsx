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
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <h1 className="text-base font-semibold tracking-tight text-white">
          Card Tracker
        </h1>
        <div className="flex items-center gap-2">
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
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15 active:bg-white/20"
          >
            + Add Card
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
