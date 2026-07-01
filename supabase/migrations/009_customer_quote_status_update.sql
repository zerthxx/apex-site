-- ============================================================
-- Migration 009 — Customers can accept/reject their own quotes
-- Run in Supabase SQL Editor
-- ============================================================

-- customer_own_quotes (004) only granted SELECT. Customers clicking
-- "Hyväksy"/"Hylkää" need UPDATE too, restricted to their own quotes.
DROP POLICY IF EXISTS "customer_update_own_quote" ON public.quotes;
CREATE POLICY "customer_update_own_quote" ON public.quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = quotes.customer_id
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = quotes.customer_id
      AND c.user_id = auth.uid()
    )
  );
