-- ============================================================
-- 008_project_comments_customer_access.sql
-- Run this in Supabase SQL Editor
-- ============================================================

-- Customers can read comments on their own projects
DROP POLICY IF EXISTS "customer_read_project_comments" ON public.project_comments;
CREATE POLICY "customer_read_project_comments" ON public.project_comments
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Customers can add comments to their own projects
DROP POLICY IF EXISTS "customer_insert_project_comments" ON public.project_comments;
CREATE POLICY "customer_insert_project_comments" ON public.project_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.customers c ON c.id = p.customer_id
      WHERE c.user_id = auth.uid()
    )
  );
