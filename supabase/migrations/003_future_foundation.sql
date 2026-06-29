-- Migration 003: Future Foundation (Phase 2–12)
-- Run this in Supabase SQL Editor after 002
-- These tables are created now so future phases don't require schema redesigns.
-- UI/API for these tables will be built in future phases.

-- ─────────────────────────────────────────────
-- Phase 2 — CRM Extensions
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_timeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  event_data  JSONB DEFAULT '{}',
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customer_timeline' AND policyname='staff_timeline') THEN
    CREATE POLICY "staff_timeline" ON public.customer_timeline FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customer_notes' AND policyname='staff_notes') THEN
    CREATE POLICY "staff_notes" ON public.customer_notes FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  color      TEXT DEFAULT '#888888',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tags' AND policyname='staff_tags') THEN
    CREATE POLICY "staff_tags" ON public.tags FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.customer_tags (
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id      UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (customer_id, tag_id)
);

ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customer_tags' AND policyname='staff_customer_tags') THEN
    CREATE POLICY "staff_customer_tags" ON public.customer_tags FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 3 — Sales (quote line items, VAT, PDF)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quote_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id     UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  quantity     NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price   NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_pct NUMERIC(5,2) DEFAULT 0,
  vat_pct      NUMERIC(5,2) DEFAULT 24,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quote_items' AND policyname='staff_quote_items') THEN
    CREATE POLICY "staff_quote_items" ON public.quote_items FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id);

-- ─────────────────────────────────────────────
-- Phase 4 — Project Management (milestones, time tracking)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='milestones' AND policyname='staff_milestones') THEN
    CREATE POLICY "staff_milestones" ON public.milestones FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.time_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES public.projects(id),
  task_id          UUID REFERENCES public.tasks(id),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  description      TEXT,
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  duration_minutes INTEGER,
  billable         BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_entries' AND policyname='own_time_entries') THEN
    CREATE POLICY "own_time_entries" ON public.time_entries FOR ALL USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 5 — Documents extensions
-- ─────────────────────────────────────────────

ALTER TABLE public.project_files ADD COLUMN IF NOT EXISTS category TEXT
  CHECK (category IN ('contract','invoice','quote','image','design','source','other')) DEFAULT 'other';

CREATE TABLE IF NOT EXISTS public.file_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id    UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.file_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='file_comments' AND policyname='staff_file_comments') THEN
    CREATE POLICY "staff_file_comments" ON public.file_comments FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 6 — Payments (Stripe-ready)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     UUID REFERENCES public.invoices(id),
  provider       TEXT NOT NULL DEFAULT 'manual'
    CHECK (provider IN ('manual','stripe','paypal','bank_transfer')),
  currency       TEXT NOT NULL DEFAULT 'EUR',
  amount         NUMERIC(12,2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','failed','refunded')),
  transaction_id TEXT,
  provider_data  JSONB DEFAULT '{}',
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='staff_payments') THEN
    CREATE POLICY "staff_payments" ON public.payments FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 7 — Messaging
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL,
  user_id         UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversation_participants' AND policyname='own_participations') THEN
    CREATE POLICY "own_participations" ON public.conversation_participants FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL DEFAULT 'direct'
    CHECK (type IN ('direct','project','support')),
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversations' AND policyname='participant_conversations') THEN
    CREATE POLICY "participant_conversations" ON public.conversations FOR ALL USING (
      EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
    );
  END IF;
END $$;

ALTER TABLE public.conversation_participants
  ADD COLUMN IF NOT EXISTS conversation_id_fk UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id),
  body            TEXT NOT NULL,
  attachments     JSONB DEFAULT '[]',
  read_by         JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at       TIMESTAMPTZ
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='participant_messages') THEN
    CREATE POLICY "participant_messages" ON public.messages FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
      )
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.project_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_comments' AND policyname='staff_project_comments') THEN
    CREATE POLICY "staff_project_comments" ON public.project_comments FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 9 — Team Management
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='staff_teams') THEN
    CREATE POLICY "staff_teams" ON public.teams FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id   UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='staff_team_members') THEN
    CREATE POLICY "staff_team_members" ON public.team_members FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  type        TEXT NOT NULL CHECK (type IN ('vacation','sick','other')),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes       TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leave_requests' AND policyname='own_leave_requests') THEN
    CREATE POLICY "own_leave_requests" ON public.leave_requests FOR ALL USING (
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 11 — Integrations
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.integration_configs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider   TEXT NOT NULL CHECK (provider IN ('stripe','google_calendar','google_drive','github','slack','discord','outlook')),
  enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  config     JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='integration_configs' AND policyname='own_integrations') THEN
    CREATE POLICY "own_integrations" ON public.integration_configs FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- Phase 12 — Enterprise
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.webhooks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  events     TEXT[] NOT NULL DEFAULT '{}',
  secret     TEXT NOT NULL,
  enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='webhooks' AND policyname='own_webhooks') THEN
    CREATE POLICY "own_webhooks" ON public.webhooks FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id      UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL,
  response_status INTEGER,
  delivered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success         BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='webhook_deliveries' AND policyname='own_webhook_deliveries') THEN
    CREATE POLICY "own_webhook_deliveries" ON public.webhook_deliveries FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.webhooks WHERE id = webhook_id AND user_id = auth.uid())
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  logo_url   TEXT,
  plan       TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  settings   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='organizations' AND policyname='org_member_read') THEN
    CREATE POLICY "org_member_read" ON public.organizations FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID REFERENCES public.organizations(id),
  user_id              UUID REFERENCES auth.users(id),
  plan                 TEXT NOT NULL DEFAULT 'free',
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','trialing','past_due','cancelled')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='own_subscriptions') THEN
    CREATE POLICY "own_subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_by  UUID NOT NULL REFERENCES auth.users(id),
  report_type   TEXT NOT NULL,
  date_from     DATE NOT NULL,
  date_to       DATE NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_reports' AND policyname='admin_audit_reports') THEN
    CREATE POLICY "admin_audit_reports" ON public.audit_reports FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin'))
    );
  END IF;
END $$;
