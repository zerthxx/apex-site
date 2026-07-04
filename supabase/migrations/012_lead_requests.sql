-- Migration 012: Log every quote-request/contact-form submission as its own row,
-- independent of customers.status.
--
-- Bug: CRM -> Liidit (src/app/(dashboard)/crm/liidit/page.tsx) only shows
-- customers where status = 'lead'. POST /api/contact only ever sets
-- status = 'lead' for a brand-new email or an 'inactive' customer coming back;
-- an existing 'active' customer (a real paying customer, e.g. one with
-- accepted quotes) submitting a new quote request never changes their status,
-- so their request silently never appears anywhere staff would look for new
-- requests. Flipping an active customer's status to 'lead' to work around this
-- would misrepresent them elsewhere in the CRM (they are not an unconfirmed
-- lead), so instead every submission is now logged as its own event row here,
-- decoupled entirely from customers.status.
--
-- Staff-only read access (mirrors the "admin_customers" FOR ALL pattern used
-- throughout this schema). All writes go through the service-role client in
-- POST /api/contact, exactly like customer_notes, so no customer-facing INSERT
-- policy is needed.

CREATE TABLE IF NOT EXISTS public.lead_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  first_name  TEXT,
  last_name   TEXT,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  service     TEXT,
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_requests_customer_id_idx ON public.lead_requests (customer_id);
CREATE INDEX IF NOT EXISTS lead_requests_created_at_idx ON public.lead_requests (created_at DESC);

ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_lead_requests" ON public.lead_requests;
CREATE POLICY "staff_lead_requests" ON public.lead_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner','admin','employee')
    )
  );
