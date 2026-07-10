import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/adminAudit";
import { logActivity } from "@/lib/supabase/activityLog";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { revokeAllSessions } from "@/lib/sessionRevocation";
import {
  createVerification,
  generateCode,
  normalizeEmail,
} from "@/lib/verification";
import {
  isSmsConfigured,
  maskEmail,
  maskPhone,
  normalizePhone,
  sendSms,
} from "@/lib/sms";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

/**
 * Admin support tools for a single account.
 *
 * GET  — full support view: verification status, sessions/devices, login
 *        history, recovery history (masked), audit trail, recovery tickets.
 * PATCH — support actions. Every action requires a reason, writes the
 *        admin_audit_logs row BEFORE executing (nothing happens silently) and
 *        notifies the affected user. Optional support_ticket_id/screenshot_url
 *        attach context to the audit row.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const admin = createAdminClient();

  const { data: userData, error: userErr } =
    await admin.auth.admin.getUserById(id);
  if (userErr || !userData.user) {
    return NextResponse.json(
      { error: "Käyttäjää ei löytynyt" },
      { status: 404 },
    );
  }
  const target = userData.user;

  const [profileRes, sessionsRes, activityRes, codesRes, auditRes, ticketsRes] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          "role, is_suspended, is_locked, locked_reason, locked_at, force_password_reset, email_verified, email_verified_at, phone, phone_verified, phone_verified_at, avatar_url, first_name, last_name, created_at",
        )
        .eq("id", id)
        .single(),
      admin
        .from("user_sessions")
        .select(
          "id, device_hint, ip_address, last_seen, created_at, logged_out_at",
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("activity_logs")
        .select(
          "id, event_type, event_data, ip_address, user_agent, created_at",
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      admin
        .from("verification_codes")
        .select(
          "id, purpose, channel, target, attempts, expires_at, used_at, created_at",
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(25),
      admin
        .from("admin_audit_logs")
        .select(
          "id, admin_email, action, old_value, new_value, reason, ip_address, support_ticket_id, screenshot_url, created_at",
        )
        .eq("target_user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      admin
        .from("recovery_requests")
        .select(
          "id, name, email, phone_hint, description, status, resolution, created_at",
        )
        .or(`user_id.eq.${id},email.eq.${normalizeEmail(target.email ?? "")}`)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  // Never expose raw contact targets from the codes table — mask them.
  const recoveryHistory = (codesRes.data ?? []).map((c) => ({
    ...c,
    target:
      c.channel === "sms"
        ? maskPhone(c.target)
        : c.channel === "email"
          ? maskEmail(c.target)
          : "—",
  }));

  return NextResponse.json({
    user: {
      id: target.id,
      email: target.email,
      created_at: target.created_at,
      last_sign_in_at: target.last_sign_in_at,
      provider: target.app_metadata?.provider ?? "email",
      has_password:
        target.identities?.some((i) => i.provider === "email") ||
        target.user_metadata?.has_password === true,
    },
    profile: profileRes.data,
    sessions: sessionsRes.data ?? [],
    activity: activityRes.data ?? [],
    recoveryHistory,
    auditLog: auditRes.data ?? [],
    recoveryRequests: ticketsRes.data ?? [],
  });
}

const patchSchema = z.object({
  action: z.enum([
    "change_email",
    "change_phone",
    "force_password_reset",
    "lock",
    "unlock",
    "suspend",
    "unsuspend",
  ]),
  reason: z.string().min(5, "Perustelu vaaditaan").max(1000),
  supportTicketId: z.string().max(100).optional(),
  screenshotUrl: z.url().optional(),
  newEmail: z.email().optional(),
  newPhone: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { user: caller, role: callerRole } = auth;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Virheellinen pyyntö — perustelu vaaditaan (väh. 5 merkkiä)." },
      { status: 400 },
    );
  }
  const { action, reason, supportTicketId, screenshotUrl, newEmail, newPhone } =
    parsed.data;

  if (id === caller.id) {
    return NextResponse.json(
      { error: "Et voi kohdistaa tukitoimintoa omaan tiliisi." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  const { data: targetData, error: targetErr } =
    await admin.auth.admin.getUserById(id);
  if (targetErr || !targetData.user) {
    return NextResponse.json(
      { error: "Käyttäjää ei löytynyt" },
      { status: 404 },
    );
  }
  const target = targetData.user;

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role, phone, phone_verified, is_locked, is_suspended")
    .eq("id", id)
    .single();

  if (targetProfile?.role === "owner" && callerRole !== "owner") {
    return NextResponse.json(
      { error: "Vain owner voi kohdistaa toimintoja owner-tiliin." },
      { status: 403 },
    );
  }

  const meta = {
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
  };

  // Audit FIRST — if the audit row can't be written, nothing happens.
  async function audit(
    actionName: string,
    oldValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null,
  ): Promise<boolean> {
    const res = await logAdminAction(admin, {
      adminId: caller.id,
      adminEmail: caller.email ?? "",
      targetUserId: id,
      targetEmail: target.email ?? null,
      action: actionName,
      oldValue,
      newValue,
      reason,
      ip: meta.ip,
      userAgent: meta.userAgent,
      supportTicketId,
      screenshotUrl,
    });
    return res.ok;
  }
  const auditFailure = NextResponse.json(
    { error: "Auditlokin kirjaus epäonnistui — toimintoa ei suoritettu." },
    { status: 500 },
  );

  if (action === "change_email") {
    if (!newEmail)
      return NextResponse.json(
        { error: "Uusi sähköposti puuttuu" },
        { status: 400 },
      );
    const normalized = normalizeEmail(newEmail);
    const oldEmail = target.email ? normalizeEmail(target.email) : null;
    if (normalized === oldEmail) {
      return NextResponse.json(
        { error: "Osoite on jo käytössä tilillä" },
        { status: 400 },
      );
    }

    if (
      !(await audit("change_email", { email: oldEmail }, { email: normalized }))
    )
      return auditFailure;

    const { error } = await admin.auth.admin.updateUserById(id, {
      email: normalized,
      email_confirm: true,
    });
    if (error) {
      return NextResponse.json(
        { error: "Sähköpostiosoitetta ei voitu ottaa käyttöön." },
        { status: 400 },
      );
    }
    await admin
      .from("profiles")
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq("id", id);
    await admin
      .from("customers")
      .update({ email: normalized })
      .eq("user_id", id);
    await revokeAllSessions(id);

    if (oldEmail) {
      await sendSecurityNotification(admin, {
        userId: id,
        event: "email_changed",
        emailTo: oldEmail,
        smsTo: targetProfile?.phone_verified ? targetProfile.phone : null,
        req,
        detail: `Uusi osoite: ${maskEmail(normalized)} (Apex-tuen tekemä muutos)`,
      });
    }
    await logActivity(
      admin,
      id,
      "email_changed",
      { by_admin: caller.id },
      {
        ipAddress: meta.ip ?? undefined,
        userAgent: meta.userAgent ?? undefined,
      },
    );
    return NextResponse.json({ success: true });
  }

  if (action === "change_phone") {
    if (!newPhone)
      return NextResponse.json(
        { error: "Uusi numero puuttuu" },
        { status: 400 },
      );
    const normalized = normalizePhone(newPhone);
    if (!normalized) {
      return NextResponse.json(
        { error: "Virheellinen puhelinnumero." },
        { status: 400 },
      );
    }
    const { data: taken } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", normalized)
      .eq("phone_verified", true)
      .neq("id", id)
      .maybeSingle();
    if (taken) {
      return NextResponse.json(
        { error: "Numero on jo käytössä toisella tilillä." },
        { status: 400 },
      );
    }

    const oldPhone = targetProfile?.phone ?? null;
    const oldVerified = targetProfile?.phone_verified ?? false;
    if (
      !(await audit("change_phone", { phone: oldPhone }, { phone: normalized }))
    )
      return auditFailure;

    // Admin sets the number UNVERIFIED — the user proves possession via SMS.
    const { error } = await admin
      .from("profiles")
      .update({
        phone: normalized,
        phone_verified: false,
        phone_verified_at: null,
      })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

    // Kick off the verification SMS right away (best effort — the user can
    // re-request from settings if the code expires).
    if (isSmsConfigured()) {
      const code = generateCode();
      const created = await createVerification(admin, {
        userId: id,
        purpose: "phone_verify",
        channel: "sms",
        target: normalized,
        secret: code,
        payload: { phone: normalized },
        ip: meta.ip,
      });
      if (created.ok) {
        await sendSms(
          normalized,
          `ApexSite: vahvistuskoodisi on ${code}. Koodi vanhenee 10 minuutissa.`,
        );
      }
    }

    await sendSecurityNotification(admin, {
      userId: id,
      event: "phone_changed",
      emailTo: target.email,
      smsTo: oldVerified ? oldPhone : null,
      req,
      detail: `Uusi numero: ${maskPhone(normalized)} (Apex-tuen tekemä muutos)`,
    });
    await logActivity(
      admin,
      id,
      "phone_changed",
      { by_admin: caller.id },
      {
        ipAddress: meta.ip ?? undefined,
        userAgent: meta.userAgent ?? undefined,
      },
    );
    return NextResponse.json({ success: true });
  }

  if (action === "force_password_reset") {
    if (
      !(await audit("force_password_reset", null, {
        force_password_reset: true,
      }))
    )
      return auditFailure;

    const { error } = await admin
      .from("profiles")
      .update({ force_password_reset: true })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });
    await revokeAllSessions(id);

    await sendSecurityNotification(admin, {
      userId: id,
      event: "force_password_reset",
      emailTo: target.email,
      smsTo: targetProfile?.phone_verified ? targetProfile.phone : null,
      req,
    });
    await logActivity(
      admin,
      id,
      "force_password_reset",
      { by_admin: caller.id },
      {
        ipAddress: meta.ip ?? undefined,
        userAgent: meta.userAgent ?? undefined,
      },
    );
    return NextResponse.json({ success: true });
  }

  if (action === "lock" || action === "unlock") {
    const locking = action === "lock";
    if (
      !(await audit(
        action,
        { is_locked: targetProfile?.is_locked ?? false },
        { is_locked: locking },
      ))
    )
      return auditFailure;

    const { error } = await admin
      .from("profiles")
      .update(
        locking
          ? {
              is_locked: true,
              locked_reason: reason,
              locked_at: new Date().toISOString(),
            }
          : { is_locked: false, locked_reason: null, locked_at: null },
      )
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

    if (locking) {
      await revokeAllSessions(id);
      await sendSecurityNotification(admin, {
        userId: id,
        event: "account_locked",
        emailTo: target.email,
        smsTo: targetProfile?.phone_verified ? targetProfile.phone : null,
        req,
      });
    }
    await logActivity(
      admin,
      id,
      locking ? "account_locked" : "account_unlocked",
      {
        by_admin: caller.id,
      },
    );
    return NextResponse.json({ success: true });
  }

  if (action === "suspend" || action === "unsuspend") {
    const suspending = action === "suspend";
    if (
      !(await audit(
        action,
        { is_suspended: targetProfile?.is_suspended ?? false },
        { is_suspended: suspending },
      ))
    )
      return auditFailure;

    const { error } = await admin
      .from("profiles")
      .update({ is_suspended: suspending })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });
    if (suspending) await revokeAllSessions(id);

    await logActivity(
      admin,
      id,
      suspending ? "account_suspended" : "account_unsuspended",
      {
        by_admin: caller.id,
      },
    );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Tuntematon toiminto" }, { status: 400 });
}
