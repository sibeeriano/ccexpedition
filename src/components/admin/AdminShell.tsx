import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchAdminDashboardStats,
  fetchAdminUsers,
  type AdminDashboardStats,
  type AdminUserRow,
} from "../../utils/adminApi";
import { AdminNav } from "./AdminNav";

const NEW_USERS_DAYS = 7;
const RECENT_LIMIT = 5;

function formatDate(iso: string, language: string) {
  const locale = language === "es" ? "es-AR" : "en-US";
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminDashboardHome() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const [statsResult, usersResult] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchAdminUsers(),
      ]);

      if (cancelled) return;

      if (statsResult.error || usersResult.error) {
        setError(statsResult.error ?? usersResult.error);
        setLoading(false);
        return;
      }

      setStats(statsResult.data);
      setRecentUsers(usersResult.data.slice(0, RECENT_LIMIT));
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold text-black">{t("admin.dashboard.title")}</h1>
        <p className="mt-1 text-black/70">{t("admin.dashboard.subtitle")}</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-black/55">{t("common.loading")}</p>
      ) : stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("admin.dashboard.newUsers")}
              value={stats.new_users_7d}
              hint={t("admin.dashboard.lastDays", { days: NEW_USERS_DAYS })}
            />
            <StatCard
              label={t("admin.dashboard.totalUsers")}
              value={stats.total_users}
              hint={t("admin.dashboard.inDatabase")}
            />
            <StatCard
              label={t("admin.dashboard.totalCards")}
              value={stats.total_cards}
              hint={t("admin.dashboard.allUsers")}
            />
            <StatCard
              label={t("admin.dashboard.totalExpenses")}
              value={stats.total_expenses}
              hint={t("admin.dashboard.allUsers")}
            />
          </section>

          <section className="rounded-2xl border border-black/10 bg-[#fcfaf6] p-6">
            <h2 className="mb-4 text-lg font-semibold text-black/90">
              {t("admin.dashboard.recentUsers")}
            </h2>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-black/55">{t("admin.dashboard.noUsers")}</p>
            ) : (
              <ul className="divide-y divide-black/10">
                {recentUsers.map((user) => (
                  <li
                    key={user.user_id}
                    className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="font-medium text-black">{user.email}</span>
                    <span className="text-xs text-black/45">
                      {formatDate(user.created_at, i18n.language)} ·{" "}
                      {t("admin.users.cardsExpenses", {
                        cards: user.cards_count,
                        expenses: user.expenses_count,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-black/50">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-black">{value}</p>
      <p className="mt-1 text-sm text-black/55">{hint}</p>
    </div>
  );
}

function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchAdminUsers();
      if (cancelled) return;
      setError(result.error);
      setUsers(result.data);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">{t("admin.users.title")}</h1>
        <p className="mt-1 text-black/70">{t("admin.users.subtitle")}</p>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-black/55">{t("common.loading")}</p>
      ) : users.length === 0 ? (
        <p className="rounded-2xl border border-black/10 bg-white px-6 py-10 text-center text-black/60">
          {t("admin.dashboard.noUsers")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="min-w-full text-sm text-black">
            <thead className="border-b border-black/10 bg-[#fcfaf6] text-left text-xs uppercase tracking-wide text-black/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("admin.users.email")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.registered")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.cards")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.expenses")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-4 py-3 font-medium">{user.email}</td>
                  <td className="px-4 py-3 text-black/70">
                    {formatDate(user.created_at, i18n.language)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{user.cards_count}</td>
                  <td className="px-4 py-3 tabular-nums">{user.expenses_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type AdminShellProps = {
  section: "home" | "users";
};

export function AdminShell({ section }: AdminShellProps) {
  return (
    <div className="flex min-h-dvh bg-[#faf8f4] text-black">
      <AdminNav current={section} />
      <main className="min-w-0 flex-1">
        {section === "home" ? <AdminDashboardHome /> : <AdminUsersPage />}
      </main>
    </div>
  );
}
