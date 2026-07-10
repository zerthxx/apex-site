import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { findUserByEmail } from "@/lib/users";
import { normalizeEmail } from "@/lib/verification";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  name: z.string().min(2).max(200),
  email: z.email(),
  phoneHint: z.string().max(50).optional(),
  description: z.string().min(10).max(4000),
});

/**
 * "Lost phone" support ticket: the user can't receive SMS anymore, so a
 * human admin verifies their identity and replaces the phone via the admin
 * tools. Public + rate-limited; admins get an in-app notification.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Tarkista lomakkeen tiedot (kuvaus vähintään 10 merkkiä)." },
      { status: 400 },
    );
  }
  const { name, email, phoneHint, description } = parsed.data;

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `rec-request:ip:${ip}`, 3, 3600)
    : true;
  const emailOk = await checkRateLimit(
    admin,
    `rec-request:email:${normalizeEmail(email)}`,
    3,
    86400,
  );
  if (!ipOk || !emailOk) return rateLimitResponse();

  // Best-effort link to an existing account — deliberately NOT revealed to
  // the caller (enumeration safety); only staff see it in the queue.
  const existingUser = await findUserByEmail(admin, email);

  const { error } = await admin.from("recovery_requests").insert({
    user_id: existingUser?.id ?? null,
    name,
    email: normalizeEmail(email),
    phone_hint: phoneHint || null,
    description,
    created_ip: ip,
  });
  if (error) {
    return NextResponse.json(
      { error: "Pyynnön tallennus epäonnistui" },
      { status: 500 },
    );
  }

  // Notify owner/admin users in-app.
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["owner", "admin"]);
  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a) => ({
        user_id: a.id,
        type: "system",
        title: "Uusi tilin palautuspyyntö",
        body: `${name} pyytää apua tilin palautuksessa (kadonnut puhelin).`,
        href: "/admin/palautuspyynnot",
      })),
    );
  }

  return NextResponse.json({
    success: true,
    message: "Pyyntö vastaanotettu. Tuki ottaa sinuun yhteyttä sähköpostitse.",
  });
}
