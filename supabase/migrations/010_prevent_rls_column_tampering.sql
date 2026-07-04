-- Migration 010: Prevent privilege escalation and unauthorized column tampering.
--
-- Several "customers can update their own row" RLS policies (profiles, quotes,
-- customers) restrict WHICH ROW can be touched (auth.uid() match) but not WHICH
-- COLUMNS can be changed. Since RLS is the only enforcement layer for direct
-- Supabase REST API calls (the Next.js app's own field-whitelisting can be
-- bypassed entirely by calling Supabase directly with a normal user's JWT),
-- this allowed any authenticated customer to:
--   - profiles: set their own role to 'owner'/'admin' (full privilege escalation)
--   - quotes: rewrite their own quote's amount/title/notes before "accepting" it
--   - customers: rewrite their own status/notes/assigned_to (staff-only CRM fields)
--
-- Confirmed live via a direct anon-key + real session attack against profiles.role
-- during security audit on 2026-07-04.
--
-- Fix: BEFORE UPDATE triggers that block changes to protected columns unless the
-- request is a service-role (backend admin client) call. The Next.js app's own
-- staff-only routes (e.g. src/app/api/admin/users/route.ts) already exclusively
-- use the service-role admin client for these changes, so legitimate flows are
-- unaffected.

-- 1. profiles: only the service role may change role / is_suspended.
CREATE OR REPLACE FUNCTION public.guard_profiles_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
    RAISE EXCEPTION 'Not authorized to change role or suspension status directly';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profiles_update ON public.profiles;
CREATE TRIGGER trg_guard_profiles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profiles_update();

-- 2. quotes: non-staff callers may only flip status to accepted/rejected on their
--    own quote (mirrors src/app/api/quotes/route.ts PATCH's app-level check).
CREATE OR REPLACE FUNCTION public.guard_quotes_customer_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_is_staff boolean;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','employee')
  ) INTO caller_is_staff;

  IF caller_is_staff THEN
    RETURN NEW;
  END IF;

  IF NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.notes IS DISTINCT FROM OLD.notes
     OR NEW.valid_until IS DISTINCT FROM OLD.valid_until
     OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.project_id IS DISTINCT FROM OLD.project_id
  THEN
    RAISE EXCEPTION 'Customers may only change quote status';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('accepted','rejected') THEN
    RAISE EXCEPTION 'Customers may only set quote status to accepted or rejected';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_quotes_customer_update ON public.quotes;
CREATE TRIGGER trg_guard_quotes_customer_update
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.guard_quotes_customer_update();

-- 3. customers: self-service updates limited to contact/company-info fields.
--    status, notes, assigned_to, company_id, user_id are staff-managed CRM fields
--    (mirrors src/app/api/account/company-info/route.ts's app-level field whitelist).
CREATE OR REPLACE FUNCTION public.guard_customers_self_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_is_staff boolean;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','employee')
  ) INTO caller_is_staff;

  IF caller_is_staff THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.notes IS DISTINCT FROM OLD.notes
     OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
  THEN
    RAISE EXCEPTION 'Not authorized to change this field directly';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_customers_self_update ON public.customers;
CREATE TRIGGER trg_guard_customers_self_update
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.guard_customers_self_update();

-- 4. profiles: close the INSERT/DELETE bypass around the guard above.
--
-- "own_profile" (001_dashboard_tables.sql) is `FOR ALL USING (auth.uid() = id)`
-- with no WITH CHECK. Postgres applies USING as the implicit WITH CHECK when
-- none is given, so that single clause also authorizes INSERT and DELETE, not
-- just UPDATE. The BEFORE UPDATE trigger above never fires on INSERT, so a
-- customer could DELETE their own profile row (nothing else FK-references
-- profiles.id) and INSERT a fresh one with role='owner' — full self-escalation,
-- bypassing trg_guard_profiles_update entirely.
--
-- profiles rows are created by handle_new_user(), a SECURITY DEFINER trigger
-- on auth.users (001_dashboard_tables.sql) that runs as the table owner and
-- bypasses RLS, so customers never need direct INSERT/DELETE on profiles.
-- Replace the FOR ALL policy with SELECT/UPDATE only.
DROP POLICY IF EXISTS "own_profile" ON public.profiles;

CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "own_profile_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
