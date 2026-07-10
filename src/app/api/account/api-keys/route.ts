import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

/**
 * Personal API keys. The raw key is shown exactly once at creation/rotation;
 * only its SHA-256 hash is stored. Revoke keeps the row visible but inactive;
 * delete removes it. All lifecycle events land in the account timeline.
 *
 * Note: key ENFORCEMENT (accepting these keys on API endpoints) is a future
 * feature — last_used_at/last_used_ip are written by it when it lands.
 */

const KEY_COLUMNS =
  "id, name, description, key_prefix, last_used_at, expires_at, revoked_at, created_at";

function generateKey() {
  const rawKey = `apex_${crypto.randomBytes(32).toString("hex")}`;
  return {
    rawKey,
    keyHash: crypto.createHash("sha256").update(rawKey).digest("hex"),
    keyPrefix: rawKey.slice(0, 12),
  };
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("api_keys")
    .select(KEY_COLUMNS)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data ?? [] });
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Nimi vaaditaan").max(100),
  description: z.string().trim().max(200).optional(),
  expiresInDays: z
    .union([z.literal(30), z.literal(90), z.literal(365)])
    .nullable()
    .optional(),
});

export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Tarkista avaimen tiedot." },
      { status: 400 },
    );
  }
  const { name, description, expiresInDays } = parsed.data;

  const { rawKey, keyHash, keyPrefix } = generateKey();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null;

  const { data: record, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      created_by: user.id,
      name,
      description: description || null,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      expires_at: expiresAt,
    })
    .select(KEY_COLUMNS)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(
    supabase,
    user.id,
    "api_key_created",
    { name },
    {
      ipAddress: getClientIp(req) ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ key: rawKey, record }, { status: 201 });
}

const patchSchema = z.object({
  id: z.uuid(),
  action: z.enum(["revoke", "rotate"]),
});

export async function PATCH(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const { id, action } = parsed.data;

  const { data: existing } = await supabase
    .from("api_keys")
    .select(KEY_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Avainta ei löytynyt" }, { status: 404 });
  }

  if (action === "revoke") {
    if (existing.revoked_at) {
      return NextResponse.json(
        { error: "Avain on jo peruttu" },
        { status: 400 },
      );
    }
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    await logActivity(supabase, user.id, "api_key_revoked", {
      name: existing.name,
    });
    return NextResponse.json({ success: true });
  }

  // rotate: issue a fresh secret with the same metadata, revoke the old key.
  const { rawKey, keyHash, keyPrefix } = generateKey();
  const stillValidExpiry =
    existing.expires_at && new Date(existing.expires_at) > new Date()
      ? existing.expires_at
      : null;

  const { data: record, error: insertError } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      created_by: user.id,
      name: existing.name,
      description: existing.description,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      expires_at: stillValidExpiry,
    })
    .select(KEY_COLUMNS)
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("revoked_at", null);

  await logActivity(supabase, user.id, "api_key_created", {
    name: existing.name,
    rotated_from: id,
  });

  return NextResponse.json(
    { key: rawKey, record, rotatedId: id },
    { status: 201 },
  );
}

const deleteSchema = z.object({ id: z.uuid() });

export async function DELETE(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("api_keys")
    .select("name")
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Avainta ei löytynyt" }, { status: 404 });
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, user.id, "api_key_deleted", {
    name: existing.name,
  });
  return NextResponse.json({ success: true });
}
