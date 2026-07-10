import type { SupabaseClient, User } from "@supabase/supabase-js";
import { normalizeEmail } from "@/lib/verification";

/**
 * Admin-client user lookups. Supabase's admin API has no getUserByEmail, so
 * this scans listUsers — the same pattern /api/admin/users already uses.
 * Fine at the current user count; revisit if the platform passes ~1000 users.
 */
export async function findUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<User | null> {
  const needle = normalizeEmail(email);
  const {
    data: { users },
    error,
  } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return null;
  return (
    users.find((u) => u.email && normalizeEmail(u.email) === needle) ?? null
  );
}

/**
 * Looks up the account that owns a VERIFIED phone number (E.164). Backed by
 * the partial unique index uniq_profiles_verified_phone (migration 015), so
 * at most one account can match.
 */
export async function findUserByVerifiedPhone(
  admin: SupabaseClient,
  phoneE164: string,
): Promise<{ userId: string; email: string | null } | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phoneE164)
    .eq("phone_verified", true)
    .maybeSingle();

  if (!profile) return null;

  const { data, error } = await admin.auth.admin.getUserById(profile.id);
  if (error || !data.user) return null;
  return { userId: data.user.id, email: data.user.email ?? null };
}
