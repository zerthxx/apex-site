import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  let email: string, code: string;
  try {
    ({ email, code } = await req.json());
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  if (!email || !code) return NextResponse.json({ error: "Puuttuvia tietoja" }, { status: 400 });

  const supabase = adminClient();

  const { data, error } = await supabase
    .from("otp_codes")
    .select()
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Väärä tai vanhentunut koodi." }, { status: 400 });
  }

  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id);

  return NextResponse.json({ success: true });
}
