-- ============================================================
-- 006_file_requests.sql
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Allow customers to see files in their own projects
DROP POLICY IF EXISTS "customer_project_files" ON public.project_files;
CREATE POLICY "customer_project_files" ON public.project_files
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Allow customers to insert files into their own projects (for upload)
DROP POLICY IF EXISTS "customer_upload_files" ON public.project_files;
CREATE POLICY "customer_upload_files" ON public.project_files
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

-- 2. File requests table
CREATE TABLE IF NOT EXISTS public.file_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','fulfilled','cancelled')),
  requested_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

ALTER TABLE public.file_requests ENABLE ROW LEVEL SECURITY;

-- Staff can manage all requests
DROP POLICY IF EXISTS "staff_file_requests" ON public.file_requests;
CREATE POLICY "staff_file_requests" ON public.file_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
  );

-- Customers can view their own requests
DROP POLICY IF EXISTS "customer_own_file_requests" ON public.file_requests;
CREATE POLICY "customer_own_file_requests" ON public.file_requests
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Customers can update status to 'fulfilled' on their own requests
DROP POLICY IF EXISTS "customer_fulfill_file_requests" ON public.file_requests;
CREATE POLICY "customer_fulfill_file_requests" ON public.file_requests
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS file_requests_project_id_idx ON public.file_requests (project_id);
CREATE INDEX IF NOT EXISTS file_requests_customer_id_idx ON public.file_requests (customer_id);
CREATE INDEX IF NOT EXISTS file_requests_status_idx ON public.file_requests (status);
