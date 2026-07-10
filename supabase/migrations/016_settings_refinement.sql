-- ============================================================
-- Migration 016: Settings refinement
-- Run this in Supabase SQL Editor
--
-- Adds:
--   1. user_notification_preferences — moves notification settings out of
--      auth user_metadata into a real table (backfilled from metadata)
--   2. user_sessions: structured location (country_code, city)
--   3. api_keys: description, expiration, revocation, last_used_ip,
--      created_by (future team/workspace attribution)
--   4. user_preferences — RESERVED for a future Preferences settings
--      section (language, timezone, theme, date format, currency).
--      No application flows use it yet.
-- ============================================================

-- ============================================================
-- 1. user_notification_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_projects  BOOLEAN NOT NULL DEFAULT TRUE,
  email_invoices  BOOLEAN NOT NULL DEFAULT TRUE,
  email_news      BOOLEAN NOT NULL DEFAULT FALSE,
  browser_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_notification_preferences" ON public.user_notification_preferences;
CREATE POLICY "own_notification_preferences" ON public.user_notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Backfill from the legacy user_metadata.notifications shape so existing
-- users keep their choices. Metadata itself is left in place (harmless).
INSERT INTO public.user_notification_preferences
  (user_id, email_projects, email_invoices, email_news)
SELECT
  id,
  COALESCE((raw_user_meta_data->'notifications'->>'projects')::boolean, TRUE),
  COALESCE((raw_user_meta_data->'notifications'->>'invoices')::boolean, TRUE),
  COALESCE((raw_user_meta_data->'notifications'->>'news')::boolean, FALSE)
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 2. user_sessions — structured approximate location
-- ============================================================
ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS city         TEXT;

-- ============================================================
-- 3. api_keys — lifecycle + attribution metadata
-- ============================================================
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_used_ip TEXT,
  ADD COLUMN IF NOT EXISTS created_by   UUID REFERENCES auth.users(id);

-- Existing personal keys were created by their owner.
UPDATE public.api_keys SET created_by = user_id WHERE created_by IS NULL;

-- ============================================================
-- 4. user_preferences — RESERVED (no UI/flows yet)
--
-- Future "Asetukset → Yleiset" section: language, timezone, theme,
-- date format, currency. Created now so the architecture is ready and
-- later features don't need another auth-metadata migration.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language    TEXT NOT NULL DEFAULT 'fi',
  timezone    TEXT NOT NULL DEFAULT 'Europe/Helsinki',
  theme       TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light','system')),
  date_format TEXT NOT NULL DEFAULT 'fi-FI',
  currency    TEXT NOT NULL DEFAULT 'EUR',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_preferences" ON public.user_preferences;
CREATE POLICY "own_preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
