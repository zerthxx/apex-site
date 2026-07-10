import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/supabase/activityLog";
import { recordLoginSession } from "@/lib/sessions";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await logActivity(supabase, data.user.id, "google_login", {
        provider: "google",
      });

      // Login-history row + email-verified backstop (Google verifies the
      // address, so first-time OAuth users skip the email OTP). Best effort.
      try {
        const admin = createAdminClient();
        await recordLoginSession(admin, data.user.id, request);
        await admin
          .from("profiles")
          .update({
            email_verified: true,
            email_verified_at: new Date().toISOString(),
          })
          .eq("id", data.user.id)
          .eq("email_verified", false);
      } catch (err) {
        console.error("OAuth callback bookkeeping failed:", err);
      }

      const meta = data.user.user_metadata ?? {};
      const profileComplete =
        meta.first_name &&
        meta.phone &&
        meta.address &&
        meta.postal_code &&
        meta.city;
      if (!profileComplete) {
        return NextResponse.redirect(`${origin}/?tiedot=1`);
      }
      const destination = next === "/" ? "/dashboard" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/kirjaudu?error=auth`);
}
