import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Unified one-time verification codes & tokens (verification_codes, migration 015).
 *
 * Replaces the legacy otp_codes table. Secrets are stored as SHA-256 hashes,
 * are single-use (used_at), expire, and carry a per-row attempt counter.
 *
 * Two shapes:
 *  - 6-digit codes, scoped by (target, purpose) where target is a lowercased
 *    email address or an E.164 phone number. Compared with timingSafeEqual.
 *  - Opaque tokens (256-bit, base64url) looked up by their own hash — used for
 *    the second step of recovery flows and for change-revert links.
 */

export const CODE_TTL_MINUTES = 10;
export const TOKEN_TTL_MINUTES = 15;
export const REVERT_TTL_DAYS = 7;
const MAX_ATTEMPTS = 5;

export type VerificationPurpose =
  | "login_2fa"
  | "reauth"
  | "email_verify"
  | "phone_verify"
  | "password_reset"
  | "email_change"
  | "phone_change"
  | "email_recovery"
  | "reset_token"
  | "recovery_token"
  | "change_revert";

export type VerificationChannel = "email" | "sms" | "token";

export type VerificationRow = {
  id: string;
  user_id: string | null;
  purpose: VerificationPurpose;
  channel: VerificationChannel;
  target: string;
  code_hash: string;
  payload: Record<string, unknown>;
  attempts: number;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashesMatch(candidate: string, storedHex: string): boolean {
  const a = Buffer.from(hashSecret(candidate), "hex");
  const b = Buffer.from(storedHex, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

type CreateOptions = {
  userId?: string | null;
  purpose: VerificationPurpose;
  channel: VerificationChannel;
  target: string;
  secret: string;
  payload?: Record<string, unknown>;
  ip?: string | null;
  ttlMinutes?: number;
};

/**
 * Stores a new code/token. For 6-digit codes, any previous unused code for
 * the same (target, purpose) is invalidated so only the latest is valid.
 * Tokens are keyed by their own hash and share the placeholder target
 * "token", so they must be scoped per user instead — and change_revert
 * tokens are never invalidated by newer ones: if a hijacker changes the
 * email twice, the original owner's first revert link must keep working
 * for the full 7-day window.
 */
export async function createVerification(
  admin: SupabaseClient,
  opts: CreateOptions,
): Promise<{ ok: boolean }> {
  const ttl = opts.ttlMinutes ?? CODE_TTL_MINUTES;

  if (opts.channel !== "token") {
    await admin
      .from("verification_codes")
      .delete()
      .eq("target", opts.target)
      .eq("purpose", opts.purpose)
      .is("used_at", null);
  } else if (opts.purpose !== "change_revert" && opts.userId) {
    await admin
      .from("verification_codes")
      .delete()
      .eq("user_id", opts.userId)
      .eq("purpose", opts.purpose)
      .is("used_at", null);
  }

  const { error } = await admin.from("verification_codes").insert({
    user_id: opts.userId ?? null,
    purpose: opts.purpose,
    channel: opts.channel,
    target: opts.target,
    code_hash: hashSecret(opts.secret),
    payload: opts.payload ?? {},
    expires_at: new Date(Date.now() + ttl * 60_000).toISOString(),
    created_ip: opts.ip ?? null,
  });

  return { ok: !error };
}

type ConsumeResult = { ok: true; row: VerificationRow } | { ok: false };

async function findAndCheck(
  admin: SupabaseClient,
  purpose: VerificationPurpose,
  target: string,
  secret: string,
): Promise<ConsumeResult> {
  const { data: row } = await admin
    .from("verification_codes")
    .select("*")
    .eq("target", target)
    .eq("purpose", purpose)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) return { ok: false };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false };

  if (!hashesMatch(secret, row.code_hash)) {
    await admin
      .from("verification_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return { ok: false };
  }

  return { ok: true, row: row as VerificationRow };
}

/**
 * Verifies a 6-digit code and marks it used atomically. Replay-safe: the
 * conditional update (`used_at IS NULL`) guarantees a code succeeds at most
 * once even under concurrent requests.
 */
export async function consumeVerification(
  admin: SupabaseClient,
  purpose: VerificationPurpose,
  target: string,
  secret: string,
): Promise<ConsumeResult> {
  const found = await findAndCheck(admin, purpose, target, secret);
  if (!found.ok) return found;

  const { data: claimed } = await admin
    .from("verification_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", found.row.id)
    .is("used_at", null)
    .select("id");

  if (!claimed || claimed.length === 0) return { ok: false };
  return found;
}

/**
 * Checks a code without consuming it (used when one token must authorize a
 * two-step flow). Failed attempts still count toward the attempt cap.
 */
export function peekVerification(
  admin: SupabaseClient,
  purpose: VerificationPurpose,
  target: string,
  secret: string,
): Promise<ConsumeResult> {
  return findAndCheck(admin, purpose, target, secret);
}

/** Tokens are looked up by their own hash (no separate target scope). */
async function findToken(
  admin: SupabaseClient,
  purpose: VerificationPurpose,
  token: string,
): Promise<ConsumeResult> {
  const { data: row } = await admin
    .from("verification_codes")
    .select("*")
    .eq("purpose", purpose)
    .eq("code_hash", hashSecret(token))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (!row) return { ok: false };
  return { ok: true, row: row as VerificationRow };
}

export async function consumeToken(
  admin: SupabaseClient,
  purpose: VerificationPurpose,
  token: string,
): Promise<ConsumeResult> {
  const found = await findToken(admin, purpose, token);
  if (!found.ok) return found;

  const { data: claimed } = await admin
    .from("verification_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", found.row.id)
    .is("used_at", null)
    .select("id");

  if (!claimed || claimed.length === 0) return { ok: false };
  return found;
}

export function peekToken(
  admin: SupabaseClient,
  purpose: VerificationPurpose,
  token: string,
): Promise<ConsumeResult> {
  return findToken(admin, purpose, token);
}
