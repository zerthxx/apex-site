-- Migration 002: CRM + Features (Phase 1)
-- Run this in Supabase SQL Editor

-- ─────────────────────────────────────────────
-- Extend existing tables
-- ─────────────────────────────────────────────

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','lead')),
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
    CHECK (status IN ('planning','development','testing','review','completed','cancelled'));

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id),
  ADD COLUMN IF NOT EXISTS deadline DATE;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- ─────────────────────────────────────────────
-- tasks
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by  UUID REFERENCES auth.users(id),
  project_id  UUID REFERENCES public.projects(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='staff_tasks') THEN
    CREATE POLICY "staff_tasks" ON public.tasks FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- calendar_events
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT,
  start_at           TIMESTAMPTZ NOT NULL,
  end_at             TIMESTAMPTZ,
  all_day            BOOLEAN NOT NULL DEFAULT FALSE,
  type               TEXT NOT NULL DEFAULT 'meeting' CHECK (type IN ('meeting','deadline','milestone','reminder')),
  related_project_id UUID REFERENCES public.projects(id),
  related_task_id    UUID REFERENCES public.tasks(id),
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='calendar_events' AND policyname='staff_events') THEN
    CREATE POLICY "staff_events" ON public.calendar_events FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- project_files
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.project_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES public.projects(id),
  name         TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes   BIGINT,
  mime_type    TEXT,
  version      INTEGER NOT NULL DEFAULT 1,
  uploaded_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_files' AND policyname='staff_files') THEN
    CREATE POLICY "staff_files" ON public.project_files FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- email_templates
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  variables  JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='email_templates' AND policyname='admin_email_templates') THEN
    CREATE POLICY "admin_email_templates" ON public.email_templates FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- system_settings
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.system_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_settings' AND policyname='admin_settings') THEN
    CREATE POLICY "admin_settings" ON public.system_settings FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

INSERT INTO public.system_settings (key, value) VALUES
  ('company_name', '"Apex Site"'),
  ('support_email', '"support@apexsite.fi"'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────
-- api_keys
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  key_prefix   TEXT NOT NULL,
  key_hash     TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='api_keys' AND policyname='own_api_keys') THEN
    CREATE POLICY "own_api_keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
