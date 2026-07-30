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

function getRecentSignUps(users: AdminUserRow[], limit: number) {
  return [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

function getRecentLogins(users: AdminUserRow[], limit: number) {
  return [...users]
    .filter((user) => user.last_sign_in_at)
    .sort(
      (a, b) =>
        new Date(b.last_sign_in_at!).getTime() -
        new Date(a.last_sign_in_at!).getTime(),
    )
    .slice(0, limit);
}

function AdminDashboardHome() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserRow[]>([]);
  const [recentLogins, setRecentLogins] = useState<AdminUserRow[]>([]);
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
      setRecentUsers(getRecentSignUps(usersResult.data, RECENT_LIMIT));
      setRecentLogins(getRecentLogins(usersResult.data, RECENT_LIMIT));
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
        <h1 className="text-3xl font-semibold text-white">
          {t("admin.dashboard.title")}
        </h1>
        <p className="mt-1 text-zinc-400">{t("admin.dashboard.subtitle")}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <UserListPanel
              title={t("admin.dashboard.recentLogins")}
              emptyLabel={t("admin.dashboard.noLogins")}
              users={recentLogins}
              language={i18n.language}
              dateKey="last_sign_in_at"
            />
            <UserListPanel
              title={t("admin.dashboard.recentUsers")}
              emptyLabel={t("admin.dashboard.noUsers")}
              users={recentUsers}
              language={i18n.language}
              dateKey="created_at"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function UserListPanel({
  title,
  emptyLabel,
  users,
  language,
  dateKey,
}: {
  title: string;
  emptyLabel: string;
  users: AdminUserRow[];
  language: string;
  dateKey: "created_at" | "last_sign_in_at";
}) {
  const { t } = useTranslation();
  return (
    <section className="panel-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {users.length === 0 ? (
        <p className="text-sm text-zinc-500">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {users.map((user) => {
            const dateValue = user[dateKey];
            return (
              <li
                key={`${title}-${user.user_id}`}
                className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0"
              >
                <span className="font-medium text-white">{user.email}</span>
                <span className="text-xs text-zinc-500">
                  {dateValue
                    ? formatDate(dateValue, language)
                    : t("admin.users.neverSignedIn")}{" "}
                  ·{" "}
                  {t("admin.users.cardsExpenses", {
                    cards: user.cards_count,
                    expenses: user.expenses_count,
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
    <div className="panel-surface p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{hint}</p>
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
        <h1 className="text-3xl font-semibold text-white">
          {t("admin.users.title")}
        </h1>
        <p className="mt-1 text-zinc-400">{t("admin.users.subtitle")}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
      ) : users.length === 0 ? (
        <p className="panel-surface px-6 py-10 text-center text-zinc-500">
          {t("admin.dashboard.noUsers")}
        </p>
      ) : (
        <div className="panel-surface overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("admin.users.email")}</th>
                <th className="px-4 py-3 font-medium">
                  {t("admin.users.registered")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("admin.users.lastSignIn")}
                </th>
                <th className="px-4 py-3 font-medium">{t("admin.users.cards")}</th>
                <th className="px-4 py-3 font-medium">
                  {t("admin.users.expenses")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatDate(user.created_at, i18n.language)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {user.last_sign_in_at
                      ? formatDate(user.last_sign_in_at, i18n.language)
                      : t("admin.users.neverSignedIn")}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{user.cards_count}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {user.expenses_count}
                  </td>
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
    <div className="flex min-h-dvh bg-base text-white">
      <AdminNav current={section} />
      <main className="min-w-0 flex-1">{section === "home" ? <AdminDashboardHome /> : <AdminUsersPage />}</main>
    </div>
  );
}
