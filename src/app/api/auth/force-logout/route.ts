import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Signs the caller out and lands them on /tili-lukittu. Used by
 * (dashboard)/layout.tsx when it sees a suspended or locked profile — a
 * Server Component can't clear auth cookies itself, so it redirects here.
 */
export async function GET(req: NextRequest) {
  const syy =
    req.nextUrl.searchParams.get("syy") === "jaadytetty"
      ? "jaadytetty"
      : "lukittu";

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL(`/tili-lukittu?syy=${syy}`, req.nextUrl.origin),
  );
}
