-- ============================================================
-- Migration 004 — Module connectivity & customer data access
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. project_files: add quote_id + invoice_id columns
ALTER TABLE public.project_files
  ADD COLUMN IF NOT EXISTS quote_id   UUID REFERENCES public.quotes(id),
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id),
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id);

-- 2. Customers can read their own quotes (via customers.user_id)
DROP POLICY IF EXISTS "customer_own_quotes" ON public.quotes;
CREATE POLICY "customer_own_quotes" ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = quotes.customer_id
      AND c.user_id = auth.uid()
    )
  );

-- 3. Customers can read their own projects
DROP POLICY IF EXISTS "customer_own_projects" ON public.projects;
CREATE POLICY "customer_own_projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = projects.customer_id
      AND c.user_id = auth.uid()
    )
  );

-- 4. Customers can read/update their own invoices (read + status update for payment confirmation)
DROP POLICY IF EXISTS "customer_own_invoices" ON public.invoices;
CREATE POLICY "customer_own_invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = invoices.customer_id
      AND c.user_id = auth.uid()
    )
  );

-- 5. Customers can read their own project files
DROP POLICY IF EXISTS "customer_own_files" ON public.project_files;
CREATE POLICY "customer_own_files" ON public.project_files
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid()
    )
    OR customer_id IN (
      SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid()
    )
  );

-- 6. Default system settings (idempotent)
INSERT INTO public.system_settings (key, value) VALUES
  ('company_name',    '"Apex Site"'),
  ('support_email',   '"info@apexsite.fi"'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;
