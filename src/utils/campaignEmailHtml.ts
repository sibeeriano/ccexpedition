export type CampaignEmailContent = {
  subject: string;
  heading: string;
  body: string;
  footerText: string;
  preheader?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtmlParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 12px;text-align:center;color:#334155;line-height:1.6">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("\n");
}

export function getCampaignSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "https://ccexpedition.vercel.app";
}

export function buildCampaignEmailHtml(content: CampaignEmailContent): string {
  const preheader = content.preheader?.trim()
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(content.preheader)}</div>`
    : "";

  const headingBlock = `<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;text-align:center;line-height:1.3;color:#0f172a">${escapeHtml(content.heading)}</h1>`;
  const bodyBlock = textToHtmlParagraphs(content.body);

  const ctaLabel = content.ctaLabel?.trim();
  const ctaUrl = content.ctaUrl?.trim();
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<p style="margin:24px 0 0;text-align:center">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#03b1b5;color:#ffffff;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:9999px">${escapeHtml(ctaLabel)}</a>
        </p>`
      : "";

  const footer = content.footerText.trim()
    ? `<p style="margin:20px 0 0;color:#64748b;font-size:14px;text-align:center">${escapeHtml(content.footerText)}</p>`
    : "";

  const appFooter = `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center">
      Recibiste este correo porque tenés cuenta en ccExpedition.
    </p>`;

  const inner = `${headingBlock}${bodyBlock}${ctaBlock}${footer}${appFooter}`;

  return `${preheader}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
            <tr>
              <td style="padding:28px 24px 8px;font-family:Ubuntu,Arial,Helvetica,sans-serif;text-align:center">
                <p style="margin:0 0 20px;font-size:13px;font-weight:700;letter-spacing:0.08em;color:#03b1b5">CCEXPEDITION</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 28px;font-family:Ubuntu,Arial,Helvetica,sans-serif">
                ${inner}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}
