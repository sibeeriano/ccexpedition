import { useTranslation } from "react-i18next";
import { useAppPath } from "../../hooks/useAppPath";
import { useAuth } from "../../context/AuthContext";
import type { AdminSection } from "../../utils/adminRoute";
import { LanguageToggle } from "../LanguageToggle";

const links = [
  { id: "home", href: "/admin", labelKey: "admin.nav.home" },
  { id: "users", href: "/admin/usuarios", labelKey: "admin.nav.users" },
  { id: "campaign", href: "/admin/campana", labelKey: "admin.nav.campaign" },
] as const satisfies ReadonlyArray<{
  id: AdminSection;
  href: string;
  labelKey: string;
}>;

type AdminNavProps = {
  current: AdminSection;
};

export function AdminNav({ current }: AdminNavProps) {
  const { t } = useTranslation();
  const { navigate } = useAppPath();
  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-surface px-3 py-5">
      <div className="flex items-start justify-between gap-2 px-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            ccExpedition
          </p>
          <p className="text-sm font-medium text-white">{t("admin.title")}</p>
        </div>
        <LanguageToggle />
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {links.map((link) => {
          const active = link.id === current;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(link.href)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? "bg-brand-accent/15 font-medium text-brand-accent"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t(link.labelKey)}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {t("admin.nav.backToApp")}
        </button>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {t("admin.nav.logout")}
        </button>
      </div>
    </aside>
  );
}
