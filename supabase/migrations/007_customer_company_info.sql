-- ============================================================
-- 007_customer_company_info.sql
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add company info columns to customers table
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS y_tunnus TEXT,
  ADD COLUMN IF NOT EXISTS toimiala TEXT,
  ADD COLUMN IF NOT EXISTS lisatiedot TEXT;

-- Allow customers to UPDATE their own record
DROP POLICY IF EXISTS "customer_update_own" ON public.customers;
CREATE POLICY "customer_update_own" ON public.customers
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
