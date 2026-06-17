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

const AUTH_KEY_PATTERN = /^sb-.+-auth-token$/;

function findAuthKeys(storage: Storage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && AUTH_KEY_PATTERN.test(key)) keys.push(key);
  }
  return keys;
}

/** Current "keep signed in" preference from login or profile. */
export function getRememberMe(): boolean {
  return shouldRemember();
}

/** Updates preference and migrates the Supabase session to the right storage. */
export function applyRememberMe(remember: boolean): void {
  const authKeys = new Set([
    ...findAuthKeys(localStorage),
    ...findAuthKeys(sessionStorage),
  ]);
  const values = new Map<string, string>();

  for (const key of authKeys) {
    const value =
      localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? null;
    if (value !== null) values.set(key, value);
  }

  setRememberMe(remember);

  for (const key of authKeys) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  const target = remember ? localStorage : sessionStorage;
  for (const [key, value] of values) {
    target.setItem(key, value);
  }
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
