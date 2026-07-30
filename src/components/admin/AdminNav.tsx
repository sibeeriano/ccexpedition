import { useTranslation } from "react-i18next";
import { useAppPath } from "../../hooks/useAppPath";
import { useAuth } from "../../context/AuthContext";

const links = [
  { id: "home", href: "/admin", labelKey: "admin.nav.home" },
  { id: "users", href: "/admin/usuarios", labelKey: "admin.nav.users" },
] as const;

type AdminNavProps = {
  current: "home" | "users";
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
    <aside className="flex w-56 shrink-0 flex-col border-r border-black/10 bg-[#f3efe8] px-3 py-5">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
        ccExpedition
      </p>
      <p className="px-3 text-sm font-medium text-black/80">{t("admin.title")}</p>

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
                  ? "bg-[#c9b8a4] font-medium text-white"
                  : "text-black/75 hover:bg-black/5 hover:text-black"
              }`}
            >
              {t(link.labelKey)}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-black/10 pt-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg px-3 py-2 text-left text-sm text-black/75 transition-colors hover:bg-black/5 hover:text-black"
        >
          {t("admin.nav.backToApp")}
        </button>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-lg px-3 py-2 text-left text-sm text-black/75 transition-colors hover:bg-black/5 hover:text-black"
        >
          {t("admin.nav.logout")}
        </button>
      </div>
    </aside>
  );
}
