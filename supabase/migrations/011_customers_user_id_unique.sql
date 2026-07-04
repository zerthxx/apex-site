-- Migration 011: Prevent duplicate customer rows per user account.
--
-- src/app/(dashboard)/layout.tsx self-heals a missing `customers` row for
-- self-service signups (see migration-010-era fix). That code has a
-- check-then-insert race: two near-simultaneous requests for the same new
-- user (e.g. a double page load) can both see "no customer row yet" and both
-- insert one, since nothing in the schema stops it. Reproduced live on
-- 2026-07-04: a single signup produced two `customers` rows 94ms apart with
-- the same user_id.
--
-- Fix: a partial unique index on customer_id — partial (WHERE user_id IS NOT
-- NULL) because customers created via the CRM before the person ever signs up
-- legitimately have user_id = NULL, and there can be many such unlinked leads.
-- The app code (src/app/(dashboard)/layout.tsx) now also catches the resulting
-- 23505 unique-violation gracefully if it loses the race.

CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique
  ON public.customers (user_id)
  WHERE user_id IS NOT NULL;
