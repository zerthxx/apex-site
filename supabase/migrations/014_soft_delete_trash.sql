-- Migration 014: Soft-delete + Trash system.
--
-- Today, hard-deleting a customer/project throws a Postgres FK violation the
-- instant it has any quote/project/invoice (most parent->child FKs are plain
-- REFERENCES with no ON DELETE action) — this is the "some records cannot be
-- deleted correctly" bug. There's also no undo. This migration replaces hard
-- delete with deleted_at/deleted_by soft-delete across every CRM entity, and
-- makes "Trash visible to the Owner only" a real, DB-enforced boundary.
--
-- IMPORTANT: this migration was authored against a *live* schema/policy dump
-- (via mcp__supabase__execute_sql / list_tables), not against the other
-- migration files — 010 (RLS column-tampering guards) and 011 (customers
-- unique index) were written and reviewed in earlier sessions but confirmed
-- NEVER applied to production (zero triggers exist live, profiles still has
-- only its original single policy). Since this migration already rewrites
-- RLS on customers/quotes from scratch, 010 and 011 are folded in here rather
-- than left as a known, already-fixed-on-paper gap in the exact policies
-- being rebuilt.
--
-- RLS pattern used throughout (see guard_soft_delete() below for why this
-- needs 4 separate command-scoped policies, not one FOR ALL):
--   SELECT/UPDATE USING: is_staff() AND (deleted_at IS NULL OR is_owner())
--   INSERT/UPDATE WITH CHECK: is_staff()  -- deliberately omits deleted_at:
--     WITH CHECK runs against the NEW row, so repeating the deleted_at
--     condition would make a non-owner's own soft-delete (deleted_at
--     null -> now()) reject itself.
--   DELETE (hard delete) USING: is_owner() AND deleted_at IS NOT NULL
--     -- only the owner, and only on a row that's already in the trash.
-- A FOR ALL policy would bundle DELETE under the same USING as SELECT, which
-- would let any staff member hard-delete a *live* row directly via
-- PostgREST (deleted_at IS NULL alone satisfies a FOR-ALL USING clause) --
-- exactly the "never hard-delete by default" guarantee this migration exists
-- to provide, so DELETE always gets its own, stricter policy.

-- ============================================================
-- 0. Helpers
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','admin','employee')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'owner'
  );
$$;

-- Guards deleted_at/deleted_by on every STAFF-owned soft-deletable table:
-- only staff (or the service role) may transition deleted_at at all, and
-- deleted_by is always server-set from auth.uid() (never client-supplied),
-- so "who deleted it" is trustworthy and non-staff self-service update
-- policies (e.g. customers.customer_update_own) can never be used to sneak
-- a row into (or out of) the trash.
CREATE OR REPLACE FUNCTION public.guard_soft_delete()
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

  IF TG_OP = 'INSERT' THEN
    IF NEW.deleted_at IS NOT NULL AND NOT caller_is_staff THEN
      RAISE EXCEPTION 'Not authorized to insert a deleted row';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at OR NEW.deleted_by IS DISTINCT FROM OLD.deleted_by THEN
    IF NOT caller_is_staff THEN
      RAISE EXCEPTION 'Not authorized to change deletion status';
    END IF;
    NEW.deleted_by := CASE WHEN NEW.deleted_at IS NOT NULL THEN auth.uid() ELSE NULL END;
  END IF;

  RETURN NEW;
END;
$$;

-- Same deleted_by integrity guarantee, but for notifications: any user may
-- legitimately soft-delete their OWN notification (self-service, not staff
-- gated) — RLS itself (own_notifications_*) already restricts this to the
-- row's own user or the owner-only trash policies, so this trigger only
-- needs to stop deleted_by being forged to someone else's id.
CREATE OR REPLACE FUNCTION public.guard_own_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot insert a pre-deleted row';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
    NEW.deleted_by := CASE WHEN NEW.deleted_at IS NOT NULL THEN auth.uid() ELSE NULL END;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. customer_notes — created fresh (referenced in code, never actually
--    live). Staff-only, same shape src/app/api/crm/customers/[id]/notes
--    already expects.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID REFERENCES auth.users(id)
);
-- Defensive: migration 003 (never applied live, confirmed via direct query —
-- see docs/02-database.md's warning about manual, untracked migrations) also
-- defines a customer_notes table, without deleted_at/deleted_by and with a
-- stale "staff_notes" FOR ALL policy. If 003 ever did run first in some other
-- environment, the CREATE TABLE above would silently no-op — these two lines
-- make sure the columns and RLS shape are right either way.
ALTER TABLE public.customer_notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.customer_notes ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);
DROP POLICY IF EXISTS "staff_notes" ON public.customer_notes;

CREATE INDEX IF NOT EXISTS customer_notes_customer_id_idx ON public.customer_notes (customer_id);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Add deleted_at / deleted_by to every existing soft-deletable table
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers','companies','quotes','projects','invoices','payments',
    'tasks','calendar_events','project_files','project_comments',
    'notifications','lead_requests'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id)', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (deleted_at) WHERE deleted_at IS NOT NULL', t || '_deleted_at_idx', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_guard_soft_delete ON public.%I', t);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS customer_notes_deleted_at_idx ON public.customer_notes (deleted_at) WHERE deleted_at IS NOT NULL;

-- Attach the staff-gated guard to every table EXCEPT notifications (self-service).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers','companies','quotes','projects','invoices','payments',
    'tasks','calendar_events','project_files','project_comments',
    'lead_requests','customer_notes'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_guard_soft_delete ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_guard_soft_delete BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.guard_soft_delete()', t);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_guard_own_soft_delete ON public.notifications;
CREATE TRIGGER trg_guard_own_soft_delete
  BEFORE INSERT OR UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.guard_own_soft_delete();

-- ============================================================
-- 3. Staff FOR ALL -> 4-way command split, per table
-- ============================================================

-- customers (was: admin_customers FOR ALL)
DROP POLICY IF EXISTS "admin_customers" ON public.customers;
CREATE POLICY "customers_select" ON public.customers FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "customers_insert" ON public.customers FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "customers_update" ON public.customers FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "customers_delete" ON public.customers FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- companies (was: admin_companies FOR ALL)
DROP POLICY IF EXISTS "admin_companies" ON public.companies;
CREATE POLICY "companies_select" ON public.companies FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "companies_insert" ON public.companies FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "companies_update" ON public.companies FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "companies_delete" ON public.companies FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- quotes (was: admin_quotes FOR ALL)
DROP POLICY IF EXISTS "admin_quotes" ON public.quotes;
CREATE POLICY "quotes_select" ON public.quotes FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "quotes_insert" ON public.quotes FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "quotes_update" ON public.quotes FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "quotes_delete" ON public.quotes FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- projects (was: admin_projects FOR ALL)
DROP POLICY IF EXISTS "admin_projects" ON public.projects;
CREATE POLICY "projects_select" ON public.projects FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "projects_insert" ON public.projects FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "projects_update" ON public.projects FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "projects_delete" ON public.projects FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- invoices (was: admin_invoices FOR ALL)
DROP POLICY IF EXISTS "admin_invoices" ON public.invoices;
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- payments (was: staff_payments FOR ALL)
DROP POLICY IF EXISTS "staff_payments" ON public.payments;
CREATE POLICY "payments_select" ON public.payments FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "payments_insert" ON public.payments FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "payments_update" ON public.payments FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "payments_delete" ON public.payments FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- tasks (was: staff_tasks FOR ALL)
DROP POLICY IF EXISTS "staff_tasks" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- calendar_events (was: staff_events FOR ALL)
DROP POLICY IF EXISTS "staff_events" ON public.calendar_events;
CREATE POLICY "calendar_events_select" ON public.calendar_events FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "calendar_events_insert" ON public.calendar_events FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "calendar_events_update" ON public.calendar_events FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "calendar_events_delete" ON public.calendar_events FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- project_files (was: staff_files FOR ALL)
DROP POLICY IF EXISTS "staff_files" ON public.project_files;
CREATE POLICY "project_files_select" ON public.project_files FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "project_files_insert" ON public.project_files FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "project_files_update" ON public.project_files FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "project_files_delete" ON public.project_files FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- project_comments (was: staff_project_comments FOR ALL)
DROP POLICY IF EXISTS "staff_project_comments" ON public.project_comments;
CREATE POLICY "project_comments_staff_select" ON public.project_comments FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "project_comments_staff_insert" ON public.project_comments FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "project_comments_staff_update" ON public.project_comments FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "project_comments_delete" ON public.project_comments FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- lead_requests (was: staff_lead_requests FOR ALL)
DROP POLICY IF EXISTS "staff_lead_requests" ON public.lead_requests;
CREATE POLICY "lead_requests_select" ON public.lead_requests FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "lead_requests_insert" ON public.lead_requests FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "lead_requests_update" ON public.lead_requests FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "lead_requests_delete" ON public.lead_requests FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- customer_notes (new table, staff-only from the start)
CREATE POLICY "customer_notes_select" ON public.customer_notes FOR SELECT
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()));
CREATE POLICY "customer_notes_insert" ON public.customer_notes FOR INSERT
  WITH CHECK (is_staff());
CREATE POLICY "customer_notes_update" ON public.customer_notes FOR UPDATE
  USING (is_staff() AND (deleted_at IS NULL OR is_owner()))
  WITH CHECK (is_staff());
CREATE POLICY "customer_notes_delete" ON public.customer_notes FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- ============================================================
-- 4. Customer-facing "own_*" policies: add deleted_at IS NULL (customers
--    never see Trash, so no owner-exception needed)
-- ============================================================
DROP POLICY IF EXISTS "own_customer_record" ON public.customers;
CREATE POLICY "own_customer_record" ON public.customers FOR SELECT
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "customer_update_own" ON public.customers;
CREATE POLICY "customer_update_own" ON public.customers FOR UPDATE
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "customer_own_quotes" ON public.quotes;
CREATE POLICY "customer_own_quotes" ON public.quotes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = quotes.customer_id AND c.user_id = auth.uid()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "customer_update_own_quote" ON public.quotes;
CREATE POLICY "customer_update_own_quote" ON public.quotes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = quotes.customer_id AND c.user_id = auth.uid()) AND deleted_at IS NULL)
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = quotes.customer_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "customer_own_invoices" ON public.invoices;
CREATE POLICY "customer_own_invoices" ON public.invoices FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = invoices.customer_id AND c.user_id = auth.uid()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "customer_own_payments" ON public.payments;
CREATE POLICY "customer_own_payments" ON public.payments FOR SELECT
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "customer_own_projects" ON public.projects;
CREATE POLICY "customer_own_projects" ON public.projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = projects.customer_id AND c.user_id = auth.uid()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "customer_own_files" ON public.project_files;
CREATE POLICY "customer_own_files" ON public.project_files FOR SELECT
  USING (
    (
      project_id IN (SELECT p.id FROM public.projects p JOIN public.customers c ON c.id = p.customer_id WHERE c.user_id = auth.uid())
      OR customer_id IN (SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid())
    ) AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "customer_project_files" ON public.project_files;
CREATE POLICY "customer_project_files" ON public.project_files FOR SELECT
  USING (
    project_id IN (SELECT p.id FROM public.projects p JOIN public.customers c ON c.id = p.customer_id WHERE c.user_id = auth.uid())
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "customer_read_project_comments" ON public.project_comments;
CREATE POLICY "customer_read_project_comments" ON public.project_comments FOR SELECT
  USING (
    project_id IN (SELECT p.id FROM public.projects p JOIN public.customers c ON c.id = p.customer_id WHERE c.user_id = auth.uid())
    AND deleted_at IS NULL
  );
-- customer_insert_project_comments / customer_upload_files (INSERT, WITH CHECK
-- only) are unaffected: new rows are never inserted with deleted_at already set.

-- ============================================================
-- 5. notifications: split self-service FOR ALL, add owner-only trash access
-- ============================================================
DROP POLICY IF EXISTS "own_notifications" ON public.notifications;

CREATE POLICY "own_notifications_select" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "own_notifications_insert" ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_notifications_update" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_notifications_delete" ON public.notifications FOR DELETE
  USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Cross-user visibility for the Trash page only — deliberately scoped to
-- deleted_at IS NOT NULL on every command (not FOR ALL), so the owner does
-- NOT gain access to other users' *live* notifications, which would be a
-- real privacy regression from today's fully-private-per-user design.
CREATE POLICY "owner_trash_notifications_select" ON public.notifications FOR SELECT
  USING (is_owner() AND deleted_at IS NOT NULL);
CREATE POLICY "owner_trash_notifications_update" ON public.notifications FOR UPDATE
  USING (is_owner() AND deleted_at IS NOT NULL)
  WITH CHECK (is_owner());
CREATE POLICY "owner_trash_notifications_delete" ON public.notifications FOR DELETE
  USING (is_owner() AND deleted_at IS NOT NULL);

-- ============================================================
-- 6. Reapply migration 010 (profiles/quotes/customers column-tampering
--    guards) and 011 (customers.user_id unique index) — verified NOT live.
--    profiles itself isn't part of Trash; this only closes an adjacent,
--    already-designed, already-reviewed gap while these exact tables are
--    already being touched.
-- ============================================================

-- 010, section 1+4: profiles — only service role may change role/is_suspended;
-- customers get SELECT/UPDATE only (no INSERT/DELETE — rows are created by
-- handle_new_user(), a SECURITY DEFINER trigger that bypasses RLS entirely).
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

DROP POLICY IF EXISTS "own_profile" ON public.profiles;
CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 010, section 2: quotes — non-staff callers may only flip status to
-- accepted/rejected on their own quote.
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

-- 010, section 3: customers — self-service updates limited to contact/
-- company-info fields; status/notes/assigned_to/company_id/user_id are
-- staff-managed CRM fields.
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

-- 011: prevent duplicate customer rows per user account (partial — customers
-- created via the CRM before signup legitimately have user_id NULL).
CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique
  ON public.customers (user_id)
  WHERE user_id IS NOT NULL;
