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
  meta?: { ipAddress?: string; userAgent?: string },
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
  user_suspended: "Käyttäjä jäädytetty",
  user_unsuspended: "Jäädytys poistettu",
  customer_created: "Asiakas luotu",
  customer_updated: "Asiakasta päivitetty",
  customer_deleted: "Asiakas siirretty roskakoriin",
  quote_created: "Tarjous luotu",
  quote_sent: "Tarjous lähetetty",
  quote_accepted: "Tarjous hyväksytty",
  quote_rejected: "Tarjous hylätty",
  quote_deleted: "Tarjous siirretty roskakoriin",
  project_created: "Projekti luotu",
  project_updated: "Projektia päivitetty",
  project_deleted: "Projekti siirretty roskakoriin",
  invoice_created: "Lasku luotu",
  invoice_paid: "Lasku merkitty maksetuksi",
  invoice_paid_via_stripe: "Lasku maksettu (Stripe)",
  payment_refunded: "Maksu hyvitetty",
  file_uploaded: "Tiedosto ladattu",
  file_deleted: "Tiedosto poistettu",
  task_created: "Tehtävä luotu",
  task_updated: "Tehtävää päivitetty",
};
