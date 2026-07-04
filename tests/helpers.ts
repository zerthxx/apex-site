import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });

export const APP_URL = process.env.TEST_APP_URL ?? "http://localhost:3000";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars — tests need .env.local populated (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  );
}

export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** A fresh anon-key client, matching exactly what the browser / a direct API attacker would use. */
export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const RUN_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Clearly-marked, collision-free test email for this test run. */
export function testEmail(label: string): string {
  return `vitest-${label}-${RUN_ID}@example.com`;
}

interface TestUserOptions {
  role?: "customer" | "owner" | "admin" | "employee";
  firstName?: string;
  lastName?: string;
  withCustomerRecord?: boolean;
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  customerId?: string;
}

/** Registry of everything created during a test file's run, for guaranteed cleanup. */
export class TestRegistry {
  userIds: string[] = [];
  customerIds: string[] = [];
  quoteIds: string[] = [];
  projectIds: string[] = [];
  invoiceIds: string[] = [];
  emails: string[] = [];

  async cleanup() {
    const admin = adminClient();
    if (this.userIds.length) {
      await admin.from("notifications").delete().in("user_id", this.userIds);
      await admin.from("activity_logs").delete().in("user_id", this.userIds);
      await admin.from("project_comments").delete().in("user_id", this.userIds);
    }
    if (this.projectIds.length)
      await admin.from("projects").delete().in("id", this.projectIds);
    if (this.invoiceIds.length)
      await admin.from("invoices").delete().in("id", this.invoiceIds);
    if (this.quoteIds.length)
      await admin.from("quotes").delete().in("id", this.quoteIds);
    if (this.customerIds.length)
      await admin.from("customers").delete().in("id", this.customerIds);
    if (this.userIds.length)
      await admin.from("profiles").delete().in("id", this.userIds);
    if (this.emails.length)
      await admin.from("otp_codes").delete().in("email", this.emails);
    for (const uid of this.userIds) {
      await admin.auth.admin.deleteUser(uid).catch(() => {});
    }
  }
}

/** Creates a fully-confirmed test user directly via the admin API (skips email/OTP UI flow). */
export async function createTestUser(
  registry: TestRegistry,
  label: string,
  opts: TestUserOptions = {},
): Promise<TestUser> {
  const admin = adminClient();
  const email = testEmail(label);
  const password = "TestPass12345!";
  registry.emails.push(email);

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: opts.firstName ?? "Test",
      last_name: opts.lastName ?? label,
    },
  });
  if (error || !data.user)
    throw new Error(`createTestUser failed: ${error?.message}`);
  registry.userIds.push(data.user.id);

  const role = opts.role ?? "customer";
  await admin.from("profiles").update({ role }).eq("id", data.user.id);

  const user: TestUser = { id: data.user.id, email, password };

  if (opts.withCustomerRecord !== false && role === "customer") {
    const { data: cust, error: custErr } = await admin
      .from("customers")
      .insert({
        user_id: data.user.id,
        email,
        first_name: opts.firstName ?? "Test",
        last_name: opts.lastName ?? label,
        status: "active",
      })
      .select()
      .single();
    if (custErr) throw new Error(`customer insert failed: ${custErr.message}`);
    registry.customerIds.push(cust.id);
    user.customerId = cust.id;
  }

  return user;
}

/** Signs in as a test user using ONLY the anon key — mirrors a real browser session. */
export async function signInAs(user: TestUser): Promise<SupabaseClient> {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  if (error)
    throw new Error(`signInAs(${user.email}) failed: ${error.message}`);
  return client;
}

/**
 * The app's API routes read auth exclusively from cookies via @supabase/ssr's
 * createServerClient (src/lib/supabase/server.ts) — there is no Authorization-header
 * fallback. To drive real route handlers from a test we must reproduce the exact
 * cookie @supabase/ssr writes in the browser: `sb-<project-ref>-auth-token` holding
 * `base64-<base64(JSON.stringify(session))>`.
 */
function projectRef(): string {
  return new URL(SUPABASE_URL).hostname.split(".")[0];
}

/** Signs in as a test user and returns a Cookie header string for use with fetch(). */
export async function signInForCookie(user: TestUser): Promise<string> {
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  if (error || !data.session)
    throw new Error(`signInForCookie(${user.email}) failed: ${error?.message}`);
  const encoded =
    "base64-" + Buffer.from(JSON.stringify(data.session)).toString("base64");
  return `sb-${projectRef()}-auth-token=${encoded}`;
}
