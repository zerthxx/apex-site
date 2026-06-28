import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  return data.user;
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });
  }

  const admin = adminClient();
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      deletion_requested_at: new Date().toISOString(),
    },
  });

  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: "Apex Site <noreply@apexsite.fi>",
    to: "0zerthx0@gmail.com",
    subject: `Tilin poistopyyntö — ${user.email}`,
    html: `
      <div style="font-family:sans-serif;background:#060810;color:#F0EEE8;padding:32px;border-radius:12px;max-width:480px;">
        <h2 style="color:#C8813A;margin:0 0 16px;">Tilin poistopyyntö</h2>
        <p style="color:#A8A49C;margin:0 0 16px;">Asiakas on pyytänyt tilinsä poistamista:</p>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="padding:8px 0;color:#A8A49C;font-size:13px;">Sähköposti</td><td style="padding:8px 0;color:#F0EEE8;font-size:13px;">${user.email}</td></tr>
          <tr><td style="padding:8px 0;color:#A8A49C;font-size:13px;">Käyttäjä ID</td><td style="padding:8px 0;color:#F0EEE8;font-size:13px;">${user.id}</td></tr>
          <tr><td style="padding:8px 0;color:#A8A49C;font-size:13px;">Nimi</td><td style="padding:8px 0;color:#F0EEE8;font-size:13px;">${user.user_metadata?.first_name ?? ""} ${user.user_metadata?.last_name ?? ""}</td></tr>
          <tr><td style="padding:8px 0;color:#A8A49C;font-size:13px;">Pyynnön aika</td><td style="padding:8px 0;color:#F0EEE8;font-size:13px;">${new Date().toLocaleString("fi-FI")}</td></tr>
        </table>
        <p style="color:#5E5C58;font-size:12px;margin-top:24px;">Ota asiakkaaseen yhteyttä 3 arkipäivän kuluessa ennen tilin poistamista.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
