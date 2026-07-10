/**
 * Revokes ALL of a user's sessions (refresh tokens) by user id via GoTrue's
 * admin endpoint POST /auth/v1/admin/users/{id}/logout — the same call
 * Supabase Studio's "Sign out user" button makes. supabase-js does not wrap
 * it: auth.admin.signOut(jwt) takes a user JWT we don't have here, and the
 * pre-existing `admin.auth.admin.signOut(userId, "global")` calls in this
 * codebase have been silently failing because of that signature mismatch.
 *
 * Note: already-issued access tokens stay valid until they expire (~1h);
 * the per-request is_locked/is_suspended/force_password_reset checks in
 * (dashboard)/layout.tsx bound what a lingering token can do meanwhile.
 */
export async function revokeAllSessions(
  userId: string,
): Promise<{ ok: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false };

  try {
    const res = await fetch(`${url}/auth/v1/admin/users/${userId}/logout`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) {
      console.error(
        "Session revocation failed:",
        res.status,
        await res.text().catch(() => ""),
      );
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("Session revocation error:", err);
    return { ok: false };
  }
}
