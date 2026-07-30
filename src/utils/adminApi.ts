import { supabase } from "../lib/supabase";

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
