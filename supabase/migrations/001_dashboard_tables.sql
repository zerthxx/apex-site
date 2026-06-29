-- ============================================================
-- Apex Site — Dashboard tables migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. profiles
-- Syncs with auth.users on sign-up via trigger below.
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name   TEXT,
  last_name    TEXT,
  phone        TEXT,
  address      TEXT,
  postal_code  TEXT,
  city         TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'customer'
               CHECK (role IN ('owner','admin','employee','customer')),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_profile" ON public.profiles;
CREATE POLICY "own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Admin/owner can read all profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin')
    )
  );

-- Trigger: auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  event_data  JSONB NOT NULL DEFAULT '{}',
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_logs_select" ON public.activity_logs;
CREATE POLICY "own_logs_select" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_logs_insert" ON public.activity_logs;
CREATE POLICY "own_logs_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can read all logs
DROP POLICY IF EXISTS "admin_read_all_logs" ON public.activity_logs;
CREATE POLICY "admin_read_all_logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin')
    )
  );

-- ============================================================
-- 3. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('quote','project','invoice','message','system')),
  title      TEXT NOT NULL,
  body       TEXT,
  href       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_notifications" ON public.notifications;
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 4. user_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_hint   TEXT,
  ip_address    TEXT,
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logged_out_at TIMESTAMPTZ
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_sessions" ON public.user_sessions;
CREATE POLICY "own_sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 5. CRM foundation tables
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  business_id TEXT,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_companies" ON public.companies;
CREATE POLICY "admin_companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin','employee')
    )
  );

CREATE TABLE IF NOT EXISTS public.customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  company_id  UUID REFERENCES public.companies(id),
  first_name  TEXT,
  last_name   TEXT,
  email       TEXT,
  phone       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_customers" ON public.customers;
CREATE POLICY "admin_customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin','employee')
    )
  );

-- Customer sees their own record
DROP POLICY IF EXISTS "own_customer_record" ON public.customers;
CREATE POLICY "own_customer_record" ON public.customers
  FOR SELECT USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'planning'
              CHECK (status IN ('planning','active','review','completed','cancelled')),
  start_date  DATE,
  end_date    DATE,
  budget      NUMERIC(12,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_projects" ON public.projects;
CREATE POLICY "admin_projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin','employee')
    )
  );

CREATE TABLE IF NOT EXISTS public.quotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  project_id  UUID REFERENCES public.projects(id),
  title       TEXT NOT NULL,
  amount      NUMERIC(12,2),
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','sent','accepted','rejected')),
  valid_until DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_quotes" ON public.quotes;
CREATE POLICY "admin_quotes" ON public.quotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin','employee')
    )
  );

CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES public.projects(id),
  customer_id    UUID REFERENCES public.customers(id),
  invoice_number TEXT,
  amount         NUMERIC(12,2),
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','sent','paid','overdue','cancelled')),
  due_date       DATE,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_invoices" ON public.invoices;
CREATE POLICY "admin_invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin','employee')
    )
  );
