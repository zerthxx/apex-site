import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityEventType =
  | "login"
  | "logout"
  | "google_login"
  | "password_change"
  | "profile_update"
  | "email_verified"
  | "account_suspended"
  | "account_unsuspended"
  | "role_changed";

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  eventType: ActivityEventType,
  eventData: Record<string, unknown> = {},
  meta?: { ipAddress?: string; userAgent?: string }
) {
  try {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      ip_address: meta?.ipAddress ?? null,
      user_agent: meta?.userAgent ?? null,
    });
  } catch {
    // Logging must never break the main flow
  }
}

export const EVENT_LABELS: Record<string, string> = {
  login: "Kirjautuminen sisään",
  logout: "Kirjautuminen ulos",
  google_login: "Google-kirjautuminen",
  password_change: "Salasanan vaihto",
  profile_update: "Profiilin päivitys",
  email_verified: "Sähköposti vahvistettu",
  account_suspended: "Tili jäädytetty",
  account_unsuspended: "Jäädytys poistettu",
  role_changed: "Rooli muutettu",
};
