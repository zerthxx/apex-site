-- ============================================================
-- Migration 015: Account Recovery & Verification System
-- Run this in Supabase SQL Editor
--
-- Adds:
--   1. profiles: verification flags, lock state, forced password reset
--   2. verification_codes: unified one-time codes/tokens (email, SMS, tokens)
--   3. admin_audit_logs: append-only audit trail for admin support actions
--   4. recovery_requests: "lost phone" support tickets
--   5. rate_limit_events: durable Postgres-backed rate limiting
--   6. user_mfa_factors + mfa_backup_codes: schema prep for future 2FA
--   7. user_sessions: admin read policy (login history / devices views)
--   8. otp_codes: documents the legacy table that existed only in the
--      live DB (code migrates to verification_codes with this release)
-- ============================================================

-- ============================================================
-- 1. profiles — verification + lock state
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_verified        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_locked             BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS locked_reason         TEXT,
  ADD COLUMN IF NOT EXISTS locked_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS force_password_reset  BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: every existing account passed either the custom email OTP at
-- signup or Google OAuth (Google verifies the email), so mark them verified.
UPDATE public.profiles
SET email_verified = TRUE, email_verified_at = NOW()
WHERE email_verified = FALSE;

-- One verified phone per account — required for phone-based recovery lookup.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_profiles_verified_phone
  ON public.profiles (phone)
  WHERE phone_verified = TRUE AND phone IS NOT NULL;

-- Extend the migration-010 tamper guard: the new security columns may only be
-- changed by the service role, and a user editing their own phone number via
-- the REST API automatically loses verified status (otherwise a stolen session
-- could point a "verified" phone at an attacker's number and hijack recovery).
CREATE OR REPLACE FUNCTION public.guard_profiles_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
    RAISE EXCEPTION 'Not authorized to change role or suspension status directly';
  END IF;

  IF NEW.email_verified IS DISTINCT FROM OLD.email_verified
     OR NEW.email_verified_at IS DISTINCT FROM OLD.email_verified_at
     OR NEW.is_locked IS DISTINCT FROM OLD.is_locked
     OR NEW.locked_reason IS DISTINCT FROM OLD.locked_reason
     OR NEW.locked_at IS DISTINCT FROM OLD.locked_at
     OR NEW.force_password_reset IS DISTINCT FROM OLD.force_password_reset
  THEN
    RAISE EXCEPTION 'Not authorized to change account security fields directly';
  END IF;

  IF NEW.phone IS DISTINCT FROM OLD.phone THEN
    NEW.phone_verified := FALSE;
    NEW.phone_verified_at := NULL;
  ELSIF NEW.phone_verified IS DISTINCT FROM OLD.phone_verified
     OR NEW.phone_verified_at IS DISTINCT FROM OLD.phone_verified_at
  THEN
    RAISE EXCEPTION 'Not authorized to change phone verification status directly';
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. verification_codes — unified one-time codes and tokens
--
-- Stores SHA-256 hashes only, never plaintext. Single-use via used_at.
-- Per-row attempt counter caps brute force on a single code.
-- No RLS policies on purpose: service-role access only.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose     TEXT NOT NULL CHECK (purpose IN (
                'login_2fa',       -- 6-digit email code at login/signup (replaces otp_codes)
                'reauth',          -- 6-digit email code re-auth for passwordless (Google) users
                'email_verify',    -- verify current email
                'phone_verify',    -- verify a phone number (initial, or admin-set)
                'password_reset',  -- 6-digit code for forgot-password (email or SMS)
                'email_change',    -- 6-digit code sent to the NEW email address
                'phone_change',    -- 6-digit SMS code sent to the NEW phone number
                'email_recovery',  -- 6-digit SMS code for the forgot-email flow
                'reset_token',     -- long token minted after password_reset verify
                'recovery_token',  -- long token minted after email_recovery verify
                'change_revert'    -- long-lived token letting the OLD contact undo a change
              )),
  channel     TEXT NOT NULL CHECK (channel IN ('email','sms','token')),
  target      TEXT NOT NULL,            -- lowercased email, E.164 phone, or 'user:<uuid>' for tokens
  code_hash   TEXT NOT NULL,            -- sha256 hex of the code/token
  payload     JSONB NOT NULL DEFAULT '{}',
  attempts    INTEGER NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_ip  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_target
  ON public.verification_codes (target, purpose);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user
  ON public.verification_codes (user_id);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
-- No policies: only the service-role client may touch this table.

-- ============================================================
-- 3. admin_audit_logs — append-only admin action audit trail
--
-- support_ticket_id / screenshot_url are optional context supplied by the
-- acting admin. approval_* fields are schema prep for future multi-admin
-- ("four eyes") approval — today every row is created with status 'none'.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- admin_id / target_user_id are nullable with ON DELETE SET NULL so audit
  -- rows survive user deletion; the *_email snapshots keep them attributable.
  admin_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email       TEXT NOT NULL,
  target_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_email      TEXT,
  action            TEXT NOT NULL,
  old_value         JSONB,
  new_value         JSONB,
  reason            TEXT NOT NULL,
  ip_address        TEXT,
  user_agent        TEXT,
  support_ticket_id TEXT,
  screenshot_url    TEXT,
  approval_status   TEXT NOT NULL DEFAULT 'none'
                    CHECK (approval_status IN ('none','pending','approved','rejected')),
  approved_by       UUID REFERENCES auth.users(id),
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target
  ON public.admin_audit_logs (target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin
  ON public.admin_audit_logs (admin_id, created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Owners/admins may read; nobody may insert/update/delete through RLS.
-- Writes happen exclusively via the service-role client → append-only in
-- practice (application code never updates or deletes audit rows).
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
    )
  );

-- ============================================================
-- 4. recovery_requests — "lost phone" support tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recovery_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone_hint  TEXT,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','in_progress','resolved','rejected')),
  handled_by  UUID REFERENCES auth.users(id),
  resolution  TEXT,
  created_ip  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_requests_status
  ON public.recovery_requests (status, created_at DESC);

ALTER TABLE public.recovery_requests ENABLE ROW LEVEL SECURITY;

-- Staff can read the queue; only owner/admin may update. Public inserts go
-- through the API with the service-role client (rate-limited there).
DROP POLICY IF EXISTS "staff_read_recovery_requests" ON public.recovery_requests;
CREATE POLICY "staff_read_recovery_requests" ON public.recovery_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','admin','employee')
    )
  );

DROP POLICY IF EXISTS "admin_update_recovery_requests" ON public.recovery_requests;
CREATE POLICY "admin_update_recovery_requests" ON public.recovery_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
    )
  );

-- ============================================================
-- 5. rate_limit_events — durable rate limiting
--
-- One row per counted event; checks are COUNT(*) within a time window on
-- (bucket, created_at). Old rows are purged opportunistically by the app.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id         BIGSERIAL PRIMARY KEY,
  bucket     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_bucket
  ON public.rate_limit_events (bucket, created_at);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only.

-- ============================================================
-- 6. Future 2FA prep (NOT active yet — no application flows use these)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_mfa_factors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_type      TEXT NOT NULL CHECK (factor_type IN ('totp')),
  secret_encrypted TEXT,
  verified_at      TIMESTAMPTZ,
  last_used_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_mfa_factors_user
  ON public.user_mfa_factors (user_id);

ALTER TABLE public.user_mfa_factors ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only (secrets never reach the browser client).

CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash  TEXT NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user
  ON public.mfa_backup_codes (user_id);

ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only.

-- ============================================================
-- 7. user_sessions — let owner/admin read all sessions
--    (powers the admin "devices / login history" view; users already
--    read their own via the existing own_sessions policy)
-- ============================================================
DROP POLICY IF EXISTS "admin_read_all_sessions" ON public.user_sessions;
CREATE POLICY "admin_read_all_sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','admin')
    )
  );

-- ============================================================
-- 8. otp_codes — document the legacy table
--
-- This table previously existed ONLY in the live database (created by hand,
-- never in a migration). Schema below matches the live shape inferred from
-- src/app/api/otp/*. As of this release the code writes to
-- verification_codes instead; otp_codes is kept temporarily so in-flight
-- codes issued just before deploy don't break, and will be dropped in a
-- future migration.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  code       TEXT NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
-- No policies: service-role only.
