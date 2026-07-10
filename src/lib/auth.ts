import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Centralized role helpers for API route handlers (docs/08 flagged the
 * ~40-file duplication of these arrays — new routes must use this module).
 */
export const STAFF_ROLES = ["owner", "admin", "employee"] as const;
export const ADMIN_ROLES = ["owner", "admin"] as const;

export type AuthProfile = {
  role: string;
  is_suspended: boolean;
  is_locked: boolean;
};

export type AuthContext = {
  supabase: SupabaseClient;
  user: User;
  role: string;
  profile: AuthProfile;
  isStaff: boolean;
  isAdmin: boolean;
};

export type AuthResult =
  | ({ ok: true } & AuthContext)
  | { ok: false; response: NextResponse };

function deny(message: string, status: number): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error: message }, { status }),
  };
}

async function resolveAuth(
  requiredRoles?: readonly string[],
): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return deny("Ei kirjautunut", 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended, is_locked")
    .eq("id", user.id)
    .single();

  if (!profile) return deny("Ei kirjautunut", 401);
  if (profile.is_suspended || profile.is_locked)
    return deny("Tili on lukittu", 403);

  const role = profile.role ?? "customer";
  if (requiredRoles && !requiredRoles.includes(role))
    return deny("Ei oikeuksia", 403);

  return {
    ok: true,
    supabase,
    user,
    role,
    profile,
    isStaff: (STAFF_ROLES as readonly string[]).includes(role),
    isAdmin: (ADMIN_ROLES as readonly string[]).includes(role),
  };
}

/** Any authenticated, non-suspended, non-locked user. */
export function requireUser(): Promise<AuthResult> {
  return resolveAuth();
}

/** owner | admin | employee */
export function requireStaff(): Promise<AuthResult> {
  return resolveAuth(STAFF_ROLES);
}

/** owner | admin */
export function requireAdmin(): Promise<AuthResult> {
  return resolveAuth(ADMIN_ROLES);
}
