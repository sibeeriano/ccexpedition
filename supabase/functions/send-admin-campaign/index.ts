import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BATCH_SIZE = 100;
const ADMIN_EMAIL = "admin@ccexpedition.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CampaignPayload = {
  subject?: string;
  preheader?: string;
  heading?: string;
  body?: string;
  footerText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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

function buildHtml(payload: CampaignPayload, siteUrl: string): string {
  const subject = payload.subject?.trim() ?? "";
  const heading = payload.heading?.trim() ?? subject;
  const body = payload.body?.trim() ?? "";
  const footerText = payload.footerText?.trim() ?? "";
  const preheader = payload.preheader?.trim() ?? "";
  const ctaLabel = payload.ctaLabel?.trim() ?? "";
  const ctaUrl = payload.ctaUrl?.trim() ?? siteUrl;

  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>`
    : "";

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<p style="margin:24px 0 0;text-align:center">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#03b1b5;color:#ffffff;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:9999px">${escapeHtml(ctaLabel)}</a>
        </p>`
      : "";

  const footer = footerText
    ? `<p style="margin:20px 0 0;color:#64748b;font-size:14px;text-align:center">${escapeHtml(footerText)}</p>`
    : "";

  const inner = `<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;text-align:center;line-height:1.3;color:#0f172a">${escapeHtml(heading)}</h1>${textToHtmlParagraphs(body)}${ctaBlock}${footer}<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center">Recibiste este correo porque tenés cuenta en ccExpedition.</p>`;

  return `${preheaderBlock}
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
              <td style="padding:0 24px 28px;font-family:Ubuntu,Arial,Helvetica,sans-serif">${inner}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

async function sendBatch(
  recipients: string[],
  subject: string,
  html: string,
  resendApiKey: string,
  fromEmail: string,
) {
  const batch = recipients.map((to) => ({
    from: fromEmail,
    to: [to],
    subject,
    html,
  }));

  const resendResp = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify(batch),
  });

  const resendData = await resendResp.json();
  if (!resendResp.ok) {
    throw new Error(
      typeof resendData?.message === "string"
        ? resendData.message
        : JSON.stringify(resendData).slice(0, 500),
    );
  }

  const sent = Array.isArray(resendData?.data)
    ? resendData.data.length
    : recipients.length;
  return { sent, failed: Math.max(0, recipients.length - sent) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail =
      Deno.env.get("FROM_EMAIL") ?? "ccExpedition <onboarding@resend.dev>";
    const siteUrl =
      Deno.env.get("SITE_URL") ?? "https://ccexpedition.vercel.app";

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Missing Supabase env" }, 500);
    }
    if (!resendApiKey) {
      return jsonResponse({ error: "Missing RESEND_API_KEY secret" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const payload = (await req.json()) as CampaignPayload;
    const subject = payload.subject?.trim();
    const heading = payload.heading?.trim();
    const body = payload.body?.trim();

    if (!subject || !heading || !body) {
      return jsonResponse(
        { error: "Missing required fields: subject, heading, body" },
        400,
      );
    }

    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) {
      return jsonResponse({ error: usersError.message }, 500);
    }

    const recipients = (usersData.users ?? [])
      .filter(
        (u) =>
          u.email &&
          u.email_confirmed_at &&
          u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase(),
      )
      .map((u) => u.email!.trim());

    if (recipients.length === 0) {
      return jsonResponse({ error: "No recipients found" }, 400);
    }

    const html = buildHtml(payload, siteUrl);

    const { data: campaign, error: campaignError } = await adminClient
      .from("admin_campaigns")
      .insert({
        subject,
        recipient_count: recipients.length,
        status: "sending",
        config_json: payload,
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      return jsonResponse({ error: campaignError?.message ?? "Campaign insert failed" }, 500);
    }

    let totalSent = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      try {
        const result = await sendBatch(batch, subject, html, resendApiKey, fromEmail);
        totalSent += result.sent;
        totalFailed += result.failed;
      } catch (error) {
        totalFailed += batch.length;
        errors.push(error instanceof Error ? error.message : "Batch send failed");
      }
    }

    const status =
      totalFailed === 0 ? "completed" : totalSent === 0 ? "failed" : "partial";

    await adminClient
      .from("admin_campaigns")
      .update({
        sent_count: totalSent,
        failed_count: totalFailed,
        status,
        error_summary: errors.length ? errors.join(" | ").slice(0, 2000) : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    if (totalSent === 0) {
      return jsonResponse({
        ok: false,
        message: errors[0] ?? "No se pudo enviar la campaña",
        campaign_id: campaign.id,
        sent: totalSent,
        failed: totalFailed,
      }, 500);
    }

    return jsonResponse({
      ok: true,
      message:
        totalFailed > 0
          ? `Campaña enviada parcialmente: ${totalSent} de ${recipients.length}.`
          : `Campaña enviada: ${totalSent} correo${totalSent === 1 ? "" : "s"}.`,
      campaign_id: campaign.id,
      sent: totalSent,
      failed: totalFailed,
      recipient_count: recipients.length,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});
