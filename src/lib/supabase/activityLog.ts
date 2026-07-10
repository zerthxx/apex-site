import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityEventType =
  | "login"
  | "logout"
  | "google_login"
  | "failed_login"
  | "password_change"
  | "password_reset"
  | "profile_update"
  | "email_verified"
  | "phone_verified"
  | "email_changed"
  | "phone_changed"
  | "change_reverted"
  | "account_suspended"
  | "account_unsuspended"
  | "account_locked"
  | "account_unlocked"
  | "force_password_reset"
  | "role_changed"
  | "api_key_created"
  | "api_key_revoked"
  | "api_key_deleted";

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
  failed_login: "Epäonnistunut kirjautumisyritys",
  password_change: "Salasanan vaihto",
  password_reset: "Salasanan palautus",
  profile_update: "Profiilin päivitys",
  email_verified: "Sähköposti vahvistettu",
  phone_verified: "Puhelinnumero vahvistettu",
  email_changed: "Sähköpostiosoite vaihdettu",
  phone_changed: "Puhelinnumero vaihdettu",
  change_reverted: "Muutos peruttu",
  account_suspended: "Tili jäädytetty",
  account_unsuspended: "Jäädytys poistettu",
  account_locked: "Tili lukittu",
  account_unlocked: "Lukitus poistettu",
  force_password_reset: "Pakotettu salasanan vaihto",
  api_key_created: "API-avain luotu",
  api_key_revoked: "API-avain peruttu",
  api_key_deleted: "API-avain poistettu",
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
