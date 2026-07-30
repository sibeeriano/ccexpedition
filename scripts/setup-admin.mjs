/**
 * One-time admin setup for production Supabase.
 *
 * Requires in .env.local (do NOT commit the service role key):
 *   VITE_SUPABASE_URL=https://yenhoyjlynkpazyllbpd.supabase.co
 *   VITE_SUPABASE_ANON_KEY=...
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... (Dashboard > Project Settings > API)
 *
 * Before running: apply supabase/migrations/20260730_add_admin_profiles.sql
 * in the Supabase SQL Editor (production project).
 *
 * Usage: node scripts/setup-admin.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.VITE_ADMIN_EMAIL?.trim() || "admin@ccexpedition.app";
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "admin2026";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  console.error(
    "Alternativa manual: supabase/setup-admin-production.sql en SQL Editor.",
  );
  process.exit(1);
}

async function listUsers() {
  const res = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=200`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error(`Auth admin list failed (${res.status}): ${await res.text()}`);
  }
  const body = await res.json();
  return body.users ?? body;
}

async function createOrUpdateAdmin() {
  const users = await listUsers();
  const existing = users.find(
    (u) => u.email?.toLowerCase() === adminEmail.toLowerCase(),
  );

  if (existing) {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${existing.id}`,
      {
        method: "PUT",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_confirm: true,
          password: adminPassword,
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`Confirm admin failed (${res.status}): ${await res.text()}`);
    }
    console.log(`Admin confirmado: ${adminEmail} (${existing.id})`);
    return existing.id;
  }

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    }),
  });
  if (!res.ok) {
    throw new Error(`Create admin failed (${res.status}): ${await res.text()}`);
  }
  const user = await res.json();
  console.log(`Admin creado: ${adminEmail} (${user.id})`);
  return user.id;
}

async function upsertAdminProfile(userId) {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ user_id: userId, is_admin: true }),
  });
  if (!res.ok) {
    throw new Error(`Profile upsert failed (${res.status}): ${await res.text()}`);
  }
  console.log("Perfil admin actualizado en profiles.");
}

async function main() {
  console.log("Configurando admin en", supabaseUrl);

  const userId = await createOrUpdateAdmin();

  try {
    await upsertAdminProfile(userId);
  } catch (err) {
    if (String(err.message).includes("PGRST205")) {
      console.warn(
        "\nLa tabla profiles no existe. Pegá supabase/setup-admin-production.sql",
      );
      console.warn("en el SQL Editor de Supabase y volvé a ejecutar este script.");
      process.exit(1);
    }
    throw err;
  }

  if (anonKey) {
    const loginRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      },
    );
    if (loginRes.ok) {
      console.log("\nLogin OK. Usá usuario 'admin' y contraseña 'admin2026'.");
    } else {
      console.warn("\nLogin test:", await loginRes.text());
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
