-- ============================================================
-- 005_payments.sql — Stripe Payments Module
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Extend invoices table for Stripe columns + refunded status
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS stripe_payment_intent  TEXT,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_id              TEXT;

-- Extend status check constraint to include 'refunded'
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_status_check
    CHECK (status IN ('pending','sent','paid','overdue','cancelled','refunded'));

-- 2. Payments table (future-ready: supports one-time + subscriptions)
CREATE TABLE IF NOT EXISTS public.payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id              UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id             UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  stripe_payment_intent   TEXT,
  stripe_checkout_session TEXT UNIQUE,
  amount                  NUMERIC(12,2) NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'eur',
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','completed','failed','refunded','cancelled')),
  payment_method          TEXT,
  type                    TEXT NOT NULL DEFAULT 'one_time'
                            CHECK (type IN ('one_time','subscription')),
  stripe_subscription_id  TEXT,
  receipt_url             TEXT,
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                 TIMESTAMPTZ,
  refunded_at             TIMESTAMPTZ,
  refund_id               TEXT
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Staff can manage all payments
DROP POLICY IF EXISTS "staff_payments" ON public.payments;
CREATE POLICY "staff_payments" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))
  );

-- Customers can view their own payments
DROP POLICY IF EXISTS "customer_own_payments" ON public.payments;
CREATE POLICY "customer_own_payments" ON public.payments
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS payments_invoice_id_idx   ON public.payments (invoice_id);
CREATE INDEX IF NOT EXISTS payments_customer_id_idx  ON public.payments (customer_id);
CREATE INDEX IF NOT EXISTS payments_status_idx       ON public.payments (status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx   ON public.payments (created_at DESC);
