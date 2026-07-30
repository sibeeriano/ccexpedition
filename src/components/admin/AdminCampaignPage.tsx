import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchCampaignDraft,
  fetchCampaignHistory,
  fetchCampaignQuota,
  saveCampaignDraft,
  sendAdminCampaign,
} from "../../utils/adminApi";
import {
  campaignConfigToEmailContent,
  DEFAULT_ADMIN_CAMPAIGN_CONFIG,
  parseCampaignConfig,
  validateCampaignConfig,
  type AdminCampaignConfig,
  type AdminCampaignQuota,
  type AdminCampaignRow,
} from "../../utils/adminCampaign";
import {
  buildCampaignEmailHtml,
  getCampaignSiteUrl,
} from "../../utils/campaignEmailHtml";

const fieldClassName =
  "rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none";

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

export function AdminCampaignPage() {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<AdminCampaignConfig>(
    DEFAULT_ADMIN_CAMPAIGN_CONFIG,
  );
  const [quota, setQuota] = useState<AdminCampaignQuota | null>(null);
  const [history, setHistory] = useState<AdminCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const [draftResult, quotaResult, historyResult] = await Promise.all([
        fetchCampaignDraft(),
        fetchCampaignQuota(),
        fetchCampaignHistory(),
      ]);

      if (cancelled) return;

      if (draftResult.error || quotaResult.error || historyResult.error) {
        setError(
          draftResult.error ?? quotaResult.error ?? historyResult.error,
        );
      } else {
        setConfig(parseCampaignConfig(draftResult.data));
        setQuota(quotaResult.data);
        setHistory(historyResult.data);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewHtml = useMemo(
    () => buildCampaignEmailHtml(campaignConfigToEmailContent(config)),
    [config],
  );

  const canSendToday =
    quota !== null &&
    quota.recipient_count > 0 &&
    quota.recipient_count <= quota.remaining_today;

  function updateField<K extends keyof AdminCampaignConfig>(
    key: K,
    value: AdminCampaignConfig[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function refreshMeta() {
    const [quotaResult, historyResult] = await Promise.all([
      fetchCampaignQuota(),
      fetchCampaignHistory(),
    ]);
    if (quotaResult.data) setQuota(quotaResult.data);
    if (!historyResult.error) setHistory(historyResult.data);
  }

  async function handleSaveDraft() {
    setError(null);
    setNotice(null);
    const validationError = validateCampaignConfig(config);
    if (validationError) {
      setError(t(validationError));
      return;
    }

    setSaving(true);
    const result = await saveCampaignDraft(config);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice(t("admin.campaign.draftSaved"));
  }

  async function handleSendCampaign(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const validationError = validateCampaignConfig(config);
    if (validationError) {
      setError(t(validationError));
      return;
    }
    if (!confirmSend) {
      setError(t("admin.campaign.confirmRequired"));
      return;
    }
    if (!canSendToday) {
      setError(t("admin.campaign.quotaExceeded"));
      return;
    }

    setSending(true);
    const saveResult = await saveCampaignDraft(config);
    if (saveResult.error) {
      setSending(false);
      setError(saveResult.error);
      return;
    }

    const sendResult = await sendAdminCampaign({
      ...config,
      ctaUrl: config.ctaUrl.trim() || getCampaignSiteUrl(),
    });
    setSending(false);

    if (sendResult.error || !sendResult.ok) {
      setError(sendResult.error ?? t("admin.campaign.sendFailed"));
      await refreshMeta();
      return;
    }

    setConfirmSend(false);
    setNotice(sendResult.message || t("admin.campaign.sendSuccess"));
    await refreshMeta();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {t("admin.campaign.eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold text-white">
          {t("admin.campaign.title")}
        </h1>
        <p className="mt-1 max-w-3xl text-zinc-400">
          {t("admin.campaign.subtitle", {
            limit: quota?.daily_limit ?? 100,
          })}
        </p>
      </div>

      {quota ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {t("admin.campaign.recipients")}
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
              {quota.recipient_count}
            </p>
          </div>
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {t("admin.campaign.quotaToday")}
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
              {quota.sent_today}/{quota.daily_limit}
            </p>
          </div>
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {t("admin.campaign.canSendNow")}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {canSendToday ? t("common.yes") : t("common.no")}
            </p>
          </div>
        </section>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
      ) : (
        <form
          onSubmit={(e) => void handleSendCampaign(e)}
          className="grid gap-8 lg:grid-cols-2"
        >
          <section className="panel-surface space-y-4 p-6">
            <h2 className="text-xl font-semibold text-white">
              {t("admin.campaign.contentTitle")}
            </h2>

            <label className="grid gap-1.5 text-sm text-zinc-300">
              {t("admin.campaign.subject")}
              <input
                type="text"
                required
                maxLength={200}
                value={config.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                className={fieldClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm text-zinc-300">
              {t("admin.campaign.preheader")}
              <input
                type="text"
                maxLength={200}
                value={config.preheader}
                onChange={(e) => updateField("preheader", e.target.value)}
                className={fieldClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm text-zinc-300">
              {t("admin.campaign.heading")}
              <input
                type="text"
                required
                maxLength={200}
                value={config.heading}
                onChange={(e) => updateField("heading", e.target.value)}
                className={fieldClassName}
              />
            </label>

            <label className="grid gap-1.5 text-sm text-zinc-300">
              {t("admin.campaign.body")}
              <textarea
                required
                rows={8}
                maxLength={4000}
                value={config.body}
                onChange={(e) => updateField("body", e.target.value)}
                className={fieldClassName}
              />
              <span className="text-xs text-zinc-500">
                {t("admin.campaign.bodyHint")}
              </span>
            </label>

            <label className="grid gap-1.5 text-sm text-zinc-300">
              {t("admin.campaign.footerText")}
              <input
                type="text"
                maxLength={300}
                value={config.footerText}
                onChange={(e) => updateField("footerText", e.target.value)}
                className={fieldClassName}
              />
            </label>

            <div className="grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm text-zinc-300">
                {t("admin.campaign.ctaLabel")}
                <input
                  type="text"
                  maxLength={80}
                  value={config.ctaLabel}
                  onChange={(e) => updateField("ctaLabel", e.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm text-zinc-300">
                {t("admin.campaign.ctaUrl")}
                <input
                  type="url"
                  maxLength={500}
                  value={config.ctaUrl}
                  onChange={(e) => updateField("ctaUrl", e.target.value)}
                  placeholder={getCampaignSiteUrl()}
                  className={fieldClassName}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveDraft()}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
              >
                {saving ? t("common.loading") : t("admin.campaign.saveDraft")}
              </button>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <p className="font-medium">{t("admin.campaign.beforeSend")}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-amber-100/90">
                <li>{t("admin.campaign.beforeSendUsers", { count: quota?.recipient_count ?? 0 })}</li>
                <li>{t("admin.campaign.beforeSendIrreversible")}</li>
                <li>{t("admin.campaign.beforeSendEdgeFunction")}</li>
              </ul>
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmSend}
                  disabled={!canSendToday || sending}
                  onChange={(e) => setConfirmSend(e.target.checked)}
                  className="mt-1 size-3.5 accent-brand-accent"
                />
                <span>{t("admin.campaign.confirmLabel", { count: quota?.recipient_count ?? 0 })}</span>
              </label>
              <button
                type="submit"
                disabled={!canSendToday || sending}
                className="btn-primary mt-4 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? t("admin.campaign.sending") : t("admin.campaign.send")}
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <section className="panel-surface p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                {t("admin.campaign.preview")}
              </h2>
              <p className="mb-1 text-sm text-zinc-400">
                {t("admin.campaign.subject")}:{" "}
                <span className="font-medium text-white">{config.subject}</span>
              </p>
              {config.preheader ? (
                <p className="mb-4 text-xs text-zinc-500">
                  {t("admin.campaign.preheader")}: {config.preheader}
                </p>
              ) : null}
              <div
                className="overflow-hidden rounded-xl border border-white/10 bg-white p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </section>

            <section className="panel-surface p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                {t("admin.campaign.recentSends")}
              </h2>
              {history.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  {t("admin.campaign.noSends")}
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {history.map((campaign) => (
                    <li
                      key={campaign.id}
                      className="rounded-lg border border-white/10 px-3 py-2"
                    >
                      <p className="font-medium text-white">{campaign.subject}</p>
                      <p className="text-zinc-500">
                        {formatDate(campaign.created_at, i18n.language)} ·{" "}
                        {campaign.sent_count}/{campaign.recipient_count}{" "}
                        {t("admin.campaign.sentShort")} · {campaign.status}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </form>
      )}
    </div>
  );
}
