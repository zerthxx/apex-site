import { createClient as createBareClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { consumeVerification, normalizeEmail } from "@/lib/verification";

/**
 * Re-authentication for sensitive account changes (email/phone change).
 *
 * - Accounts with a password re-enter it; verified server-side with a
 *   throwaway non-persisting client so no cookies are touched.
 * - Google-only accounts (no password) verify a fresh 6-digit email code
 *   instead, requested via POST /api/account/reauth/send.
 */
export function userHasPassword(user: User): boolean {
  return (
    user.identities?.some((i) => i.provider === "email") ||
    user.user_metadata?.has_password === true
  );
}

export async function verifyReauth(
  admin: SupabaseClient,
  user: User,
  credentials: { password?: string; reauthCode?: string },
): Promise<{ ok: boolean; error?: string }> {
  if (userHasPassword(user)) {
    if (!credentials.password)
      return { ok: false, error: "Syötä nykyinen salasanasi." };

    const bare = createBareClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await bare.auth.signInWithPassword({
      email: user.email!,
      password: credentials.password,
    });
    if (error) return { ok: false, error: "Nykyinen salasana on väärä." };
    return { ok: true };
  }

  if (!credentials.reauthCode) {
    return {
      ok: false,
      error: "Syötä sähköpostiisi lähetetty vahvistuskoodi.",
    };
  }
  const result = await consumeVerification(
    admin,
    "reauth",
    normalizeEmail(user.email!),
    credentials.reauthCode,
  );
  if (!result.ok || result.row.user_id !== user.id) {
    return { ok: false, error: "Väärä tai vanhentunut vahvistuskoodi." };
  }
  return { ok: true };
}
