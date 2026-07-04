-- Migration 013: Add structured detail fields to lead_requests.
--
-- Every quote-request submission was already logged (migration 012), but only
-- as a customer_id + a single free-text `message` blob — the customer's CRM
-- profile has no tab showing quote-request details at all, and the specific
-- solution/package, budget, timeline, and contact preference weren't stored
-- as their own fields, just folded into that one string. This adds the
-- missing columns so the customer profile (CRM -> Asiakkaat -> [customer] ->
-- Tarjouspyynnöt) can show each field separately.

ALTER TABLE public.lead_requests
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS budget TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS contact_preference TEXT;
