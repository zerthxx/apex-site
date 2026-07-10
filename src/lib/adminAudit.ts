import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Append-only audit trail for admin support actions (admin_audit_logs,
 * migration 015). "Nothing may happen silently": callers must write the audit
 * row BEFORE performing the action and abort if the write fails — so every
 * attempted admin action leaves a trace even when the action itself errors.
 */

export type AdminAuditEntry = {
  adminId: string;
  adminEmail: string;
  targetUserId?: string | null;
  targetEmail?: string | null;
  action: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  reason: string;
  ip?: string | null;
  userAgent?: string | null;
  supportTicketId?: string | null;
  screenshotUrl?: string | null;
};

export async function logAdminAction(
  admin: SupabaseClient,
  entry: AdminAuditEntry,
): Promise<{ ok: boolean }> {
  const { error } = await admin.from("admin_audit_logs").insert({
    admin_id: entry.adminId,
    admin_email: entry.adminEmail,
    target_user_id: entry.targetUserId ?? null,
    target_email: entry.targetEmail ?? null,
    action: entry.action,
    old_value: entry.oldValue ?? null,
    new_value: entry.newValue ?? null,
    reason: entry.reason,
    ip_address: entry.ip ?? null,
    user_agent: entry.userAgent ?? null,
    support_ticket_id: entry.supportTicketId || null,
    screenshot_url: entry.screenshotUrl || null,
  });

  if (error) console.error("admin_audit_logs insert failed:", error);
  return { ok: !error };
}
