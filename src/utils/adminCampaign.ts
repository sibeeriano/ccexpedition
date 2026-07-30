import type { CampaignEmailContent } from "./campaignEmailHtml";

export type AdminCampaignConfig = {
  version: 1;
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  footerText: string;
  ctaLabel: string;
  ctaUrl: string;
};

export const DEFAULT_ADMIN_CAMPAIGN_CONFIG: AdminCampaignConfig = {
  version: 1,
  subject: "Novedades de ccExpedition",
  preheader: "Actualizaciones y novedades para tu cuenta",
  heading: "Novedades de ccExpedition",
  body: "Queremos contarte las últimas novedades de ccExpedition.\n\nGracias por usar la app.",
  footerText: "ccExpedition — controlá tus tarjetas y gastos.",
  ctaLabel: "Abrir ccExpedition",
  ctaUrl: "https://ccexpedition.vercel.app",
};

export type AdminCampaignRow = {
  id: string;
  subject: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
  completed_at: string | null;
};

export type AdminCampaignQuota = {
  daily_limit: number;
  sent_today: number;
  remaining_today: number;
  recipient_count: number;
};

export function campaignConfigToEmailContent(
  config: AdminCampaignConfig,
): CampaignEmailContent {
  return {
    subject: config.subject,
    heading: config.heading,
    body: config.body,
    footerText: config.footerText,
    preheader: config.preheader,
    ctaLabel: config.ctaLabel,
    ctaUrl: config.ctaUrl,
  };
}

export function parseCampaignConfig(raw: unknown): AdminCampaignConfig {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_ADMIN_CAMPAIGN_CONFIG;
  }
  const candidate = {
    ...DEFAULT_ADMIN_CAMPAIGN_CONFIG,
    ...(raw as Partial<AdminCampaignConfig>),
  };
  return {
    version: 1,
    subject: String(candidate.subject ?? "").trim().slice(0, 200),
    preheader: String(candidate.preheader ?? "").trim().slice(0, 200),
    heading: String(candidate.heading ?? "").trim().slice(0, 200),
    body: String(candidate.body ?? "").trim().slice(0, 4000),
    footerText: String(candidate.footerText ?? "").trim().slice(0, 300),
    ctaLabel: String(candidate.ctaLabel ?? "").trim().slice(0, 80),
    ctaUrl: String(candidate.ctaUrl ?? "").trim().slice(0, 500),
  };
}

export function validateCampaignConfig(
  config: AdminCampaignConfig,
): string | null {
  if (!config.subject.trim()) return "admin.campaign.errors.subjectRequired";
  if (!config.heading.trim()) return "admin.campaign.errors.headingRequired";
  if (!config.body.trim()) return "admin.campaign.errors.bodyRequired";
  if (config.ctaLabel && !config.ctaUrl.trim()) {
    return "admin.campaign.errors.ctaUrlRequired";
  }
  if (config.ctaUrl && !/^https?:\/\//i.test(config.ctaUrl)) {
    return "admin.campaign.errors.ctaUrlInvalid";
  }
  return null;
}
