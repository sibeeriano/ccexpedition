import { supabase } from "../lib/supabase";
import type { AdminCampaignConfig, AdminCampaignQuota, AdminCampaignRow } from "./adminCampaign";

export type AdminDashboardStats = {
  total_users: number;
  new_users_7d: number;
  total_cards: number;
  total_expenses: number;
};

export type AdminUserRow = {
  user_id: string;
  email: string;
  created_at: string;
  cards_count: number;
  expenses_count: number;
};

export async function fetchAdminDashboardStats(): Promise<{
  data: AdminDashboardStats | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) {
    return { data: null, error: error.message };
  }
  return { data: data as AdminDashboardStats, error: null };
}

export async function fetchAdminUsers(): Promise<{
  data: AdminUserRow[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: (data ?? []) as AdminUserRow[], error: null };
}

export async function fetchCampaignDraft(): Promise<{
  data: unknown;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("admin_get_campaign_draft");
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function saveCampaignDraft(
  config: AdminCampaignConfig,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("admin_save_campaign_draft", {
    p_config: config,
  });
  return { error: error?.message ?? null };
}

export async function fetchCampaignQuota(): Promise<{
  data: AdminCampaignQuota | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("admin_campaign_send_quota");
  if (error) return { data: null, error: error.message };
  return { data: data as AdminCampaignQuota, error: null };
}

export async function fetchCampaignHistory(): Promise<{
  data: AdminCampaignRow[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("admin_list_campaigns");
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as AdminCampaignRow[], error: null };
}

export async function sendAdminCampaign(
  config: AdminCampaignConfig,
): Promise<{
  ok: boolean;
  message: string;
  error: string | null;
}> {
  const { data, error } = await supabase.functions.invoke("send-admin-campaign", {
    body: config,
  });

  if (error) {
    return { ok: false, message: "", error: error.message };
  }

  const body = data as {
    ok?: boolean;
    message?: string;
    error?: string;
  };

  if (body?.error) {
    return { ok: false, message: "", error: body.error };
  }

  return {
    ok: body?.ok === true,
    message: body?.message ?? "",
    error: null,
  };
}
