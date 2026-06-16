import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local",
  );
}

const REMEMBER_KEY = "ccexpedition-remember";

/** Call before signing in: decides where the session token is stored. */
export function setRememberMe(remember: boolean): void {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

function shouldRemember(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== "0";
}

function activeAuthStorage(): Storage {
  return shouldRemember() ? localStorage : sessionStorage;
}

// Persistent (localStorage) or per-tab-session (sessionStorage) auth storage,
// depending on the "keep me signed in" choice made at login.
const authStorage = {
  getItem: (key: string) => activeAuthStorage().getItem(key),
  setItem: (key: string, value: string) => {
    const primary = activeAuthStorage();
    const secondary = shouldRemember() ? sessionStorage : localStorage;
    secondary.removeItem(key);
    primary.setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
