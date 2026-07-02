# 2. Database

**Source:** `supabase/migrations/` (9 files, `001` through `009`). **Database:** PostgreSQL via Supabase (uses `auth.users`, `auth.uid()`, `gen_random_uuid()`, Row Level Security).

> ## ⚠️ Operational risk — read this first
> These 9 `.sql` files are **not** applied automatically by any CI/CD pipeline, ORM migration runner, or Supabase CLI push. Every file's header comment literally says *"Run this in Supabase SQL Editor."* This means:
> - Schema changes only take effect if a human manually copy-pastes and executes each file, **in numeric order**, in the Supabase SQL Editor.
> - There is no automated guarantee that a given Supabase project (a new dev/staging environment, or even production at any given moment) has all 9 migrations applied.
> - No migration-tracking table (e.g. `schema_migrations`) exists, so there is no programmatic way to verify which migrations have been run.
> - Most statements use `IF NOT EXISTS` / `DROP POLICY IF EXISTS` guards, making the scripts largely re-runnable — but order still matters, since later files assume earlier tables/columns exist.
> - **This already caused two real production bugs in this project**, both fixed in this session: `004`'s customer-read policies on `quotes` were missing (customers saw an empty tarjoukset list even though the data existed and was correctly linked), and `009` (customer UPDATE on quotes) didn't exist yet (the "Hyväksy" button silently failed).

## 2.1 Table reference

### `profiles` (001)
Extends `auth.users` with app-specific profile/role data. One row per authenticated user, same UUID as `auth.users`.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, REFERENCES `auth.users(id)` ON DELETE CASCADE |
| `first_name`, `last_name`, `phone`, `address`, `postal_code`, `city`, `avatar_url` | TEXT | |
| `role` | TEXT | NOT NULL, DEFAULT `'customer'`, CHECK `IN ('owner','admin','employee','customer')` |
| `is_suspended` | BOOLEAN | NOT NULL, DEFAULT `FALSE` |
| `created_at`, `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` |

**RLS:** `own_profile` (`FOR ALL USING auth.uid() = id`) — self read/write. `admin_read_all_profiles` (`FOR SELECT` where caller's own role is owner/admin) — staff directory.

**Trigger:** `handle_new_user()` (SECURITY DEFINER) fires `AFTER INSERT ON auth.users` and auto-creates the matching `profiles` row from `raw_user_meta_data` (`first_name`, `last_name`, `phone`), `ON CONFLICT (id) DO NOTHING`. SECURITY DEFINER is required because at the instant a new `auth.users` row is inserted, the session has no `profiles` row yet, and RLS would otherwise block the insert.

**Why it exists:** the central RBAC table — nearly every RLS policy in the schema checks this table's `role` column.

---

### `activity_logs` (001)
`id, user_id → auth.users (CASCADE), event_type TEXT NOT NULL, event_data JSONB DEFAULT '{}', ip_address, user_agent, created_at`.

**RLS:** `own_logs_select`/`own_logs_insert` (self-scoped), `admin_read_all_logs` (owner/admin read everything).

**Why it exists:** audit trail — see [07-payments-ai-notifications.md](./07-payments-ai-notifications.md) for every event type actually logged.

---

### `notifications` (001)
`id, user_id NOT NULL → auth.users (CASCADE), type TEXT NOT NULL CHECK IN ('quote','project','invoice','message','system'), title NOT NULL, body, href, is_read DEFAULT FALSE, created_at`.

**RLS:** `own_notifications` (`FOR ALL`, self-scoped).

**Why it exists:** in-app notification bell/feed. **Known bug:** the Stripe webhook inserts notifications with `title`/`message`/`link` columns instead of the real `title`/`body`/`href` — those inserts fail silently against this schema (see [07](./07-payments-ai-notifications.md)).

---

### `user_sessions` (001)
`id, user_id NOT NULL → auth.users (CASCADE), session_token UNIQUE NOT NULL, device_hint, ip_address, last_seen, created_at, logged_out_at`.

**RLS:** `own_sessions` (`FOR ALL`, self-scoped). **Why it exists:** "active devices" screen (`/istunnot`), lets a user see/revoke their own sessions.

---

### `companies` (001)
`id, name NOT NULL, business_id, email, phone, address, city, created_at`.

**RLS:** `admin_companies` (`FOR ALL`, staff: owner/admin/employee) — **staff-only, no customer-facing access policy exists at all.**

**Why it exists:** CRM organization/account record — a `customers` contact can belong to a `companies` org.

---

### `customers` (001; extended 002, 007)
The CRM contact record — the hub nearly everything else hangs off of.

| Column | Added in | Notes |
|---|---|---|
| `id`, `user_id → auth.users`, `company_id → companies`, `first_name`, `last_name`, `email`, `phone`, `notes`, `created_at` | 001 | `user_id` is **nullable** — a CRM contact can exist with no linked login account |
| `status TEXT DEFAULT 'active' CHECK IN ('active','inactive','lead')`, `assigned_to → auth.users` | 002 | |
| `company_name`, `y_tunnus`, `toimiala`, `lisatiedot` | 007 | free-text self-service company fields, **parallel to** the normalized `company_id → companies` FK, no reconciliation between the two |

**RLS:** `admin_customers` (staff full CRUD), `own_customer_record` (`SELECT` where `user_id = auth.uid()`), `customer_update_own` (007 — customers can self-edit their own record, e.g. fill in company fields).

**Why it exists:** bridges an authenticated portal login (`user_id`) to business context. **This is the exact table whose missing `user_id` link caused the "asiakas ei näe tarjouksia" bug** — a CRM-created customer never gets `user_id` set by `POST /api/crm/customers`, so it has to be back-filled later (now done automatically by `(dashboard)/layout.tsx`'s self-healing email match, added this session).

---

### `projects` (001; extended 002)
| Column | Added in |
|---|---|
| `id`, `customer_id → customers`, `name NOT NULL`, `description`, `status`, `start_date`, `end_date`, `budget NUMERIC(12,2)`, `created_at`, `updated_at` | 001 |
| `progress_pct INT DEFAULT 0 CHECK 0–100`, `assigned_to → auth.users`, `quote_id → quotes`, `deadline` | 002 |

**Status CHECK history — a breaking change:** `001` allowed `('planning','active','review','completed','cancelled')`; `002` **drops and replaces** it with `('planning','development','testing','review','completed','cancelled')` — `'active'` was removed, `'development'`/`'testing'` added. Any pre-existing `'active'`-status row from the `001` era would violate the new constraint if migrations are ever replayed against seeded data.

**RLS:** `admin_projects` (staff full CRUD), `customer_own_projects` (004 — customers SELECT-only their own, via `customers.user_id = auth.uid()` join).

**Why it exists:** the core delivery entity — an accepted quote becomes a project, which then accumulates tasks/files/comments/invoices.

---

### `quotes` (001; extended 002, 003)
`id, customer_id → customers, project_id → projects, title NOT NULL, amount, status TEXT DEFAULT 'draft' CHECK IN ('draft','sent','accepted','rejected'), valid_until, notes, created_at` (001); `company_id → companies` (002); `pdf_url, accepted_at, rejected_at, accepted_by → auth.users` (003).

**Circular reference note:** `quotes.project_id` and `projects.quote_id` both exist. `projects.quote_id` is the common direction (accepted quote → new project); `quotes.project_id` lets a quote be filed under an *existing* project (e.g. a change order). Nothing in the schema enforces these stay consistent with each other.

**RLS:**
- `admin_quotes` (staff full CRUD)
- `customer_own_quotes` (004, SELECT-only)
- `customer_update_own_quote` (009, UPDATE — lets a customer accept/reject their own quote). **No column-level restriction**: the policy allows UPDATE on any column of the customer's own quote row, not just `status` — enforcement that only `status` can change is done in application code (`PATCH /api/quotes`), not the database.

**Child table `quote_items`** (003): `id, quote_id → quotes (CASCADE), description NOT NULL, quantity NUMERIC DEFAULT 1, unit_price NUMERIC DEFAULT 0, discount_pct, vat_pct DEFAULT 24 (Finnish standard VAT), sort_order, created_at`. RLS: staff-only — **no customer read policy exists for line items**, even though customers can read the parent quote.

**Why it exists:** sales proposal/estimate with an acceptance workflow customers can now self-service (as of 009). Accepted quotes become `projects` rows.

---

### `invoices` (001; extended 005)
`id, project_id → projects, customer_id → customers, invoice_number, amount, status TEXT DEFAULT 'pending' CHECK, due_date, paid_at, created_at` (001); `stripe_payment_intent, stripe_checkout_session, refunded_at, refund_id` (005).

**Status CHECK history:** `001`: `('pending','sent','paid','overdue','cancelled')` → `005` adds `'refunded'`.

**RLS:** `admin_invoices` (staff full CRUD), `customer_own_invoices` (004, **SELECT-only**). Migration 004's own comment claims customers get "read + status update for payment confirmation," but **only a SELECT policy was actually written** — this is a discrepancy between the stated intent and the shipped SQL.

**Why it exists:** billing document, Stripe-integrated for online payment collection, feeds the `payments` ledger.

---

### `tasks` (002)
`id, title NOT NULL, description, due_date, priority TEXT DEFAULT 'medium' CHECK IN ('low','medium','high','urgent'), status TEXT DEFAULT 'todo' CHECK IN ('todo','in_progress','review','done'), assigned_to → auth.users, created_by → auth.users, project_id → projects, created_at, updated_at`.

**RLS:** `staff_tasks` (`FOR ALL`, staff-only — **no customer visibility at all**).

**Why it exists:** internal Kanban-style task board.

---

### `calendar_events` (002)
`id, title NOT NULL, description, start_at NOT NULL, end_at, all_day DEFAULT FALSE, type TEXT DEFAULT 'meeting' CHECK IN ('meeting','deadline','milestone','reminder'), related_project_id → projects, related_task_id → tasks, created_by → auth.users, created_at`.

**RLS:** `staff_events` (staff-only, full CRUD). **Why it exists:** internal team calendar.

---

### `project_files` (002; extended 003, 004)
`id, project_id → projects, name NOT NULL, storage_path NOT NULL, size_bytes, mime_type, version DEFAULT 1, uploaded_by → auth.users, created_at` (002); `category TEXT CHECK IN ('contract','invoice','quote','image','design','source','other') DEFAULT 'other'` (003); `quote_id → quotes, invoice_id → invoices, customer_id → customers` (004).

**RLS (accumulated across 3 migrations, several overlapping SELECT policies coexist):** `staff_files` (staff full CRUD), `customer_own_files` (004, via project OR direct `customer_id` tag), `customer_project_files` (006, near-duplicate of part of the 004 policy — redundant, not conflicting, since Postgres OR-combines multiple permissive policies), `customer_upload_files` (006, INSERT).

**Child table `file_comments`** (003): staff-only, no customer access.

**Why it exists:** document/asset metadata (actual bytes in Supabase Storage) — supports versioning and can be tagged to a project, quote, invoice, or customer directly.

---

### `file_requests` (006)
`id, project_id NOT NULL → projects (CASCADE), customer_id NOT NULL → customers (CASCADE), title NOT NULL, description, due_date, status TEXT DEFAULT 'pending' CHECK IN ('pending','fulfilled','cancelled'), requested_by → auth.users, created_at, fulfilled_at`. Indexed on `project_id`, `customer_id`, `status`.

**RLS:** `staff_file_requests` (full CRUD), `customer_own_file_requests` (SELECT own), `customer_fulfill_file_requests` (UPDATE own, **no WITH CHECK** — same column-level caveat as the quotes UPDATE policy).

**Why it exists:** structured "please upload X" workflow (e.g. requesting a logo) — the mechanism behind the CRM lifecycle answer given earlier in this project.

---

### `payments` — ⚠️ shape bug (created 003, "redefined" 005)
`003` creates `payments` with one shape (`provider TEXT CHECK IN ('manual','stripe','paypal','bank_transfer')`, `currency DEFAULT 'EUR'`, `status CHECK IN ('pending','completed','failed','refunded')`, `transaction_id`, `provider_data JSONB`). `005` tries to create a **richer**, Stripe-specific shape (`stripe_payment_intent`, `stripe_checkout_session UNIQUE`, `customer_id`, `payment_method`, `type CHECK IN ('one_time','subscription')`, `receipt_url`, `metadata`, `refunded_at`, `refund_id`) using `CREATE TABLE IF NOT EXISTS public.payments (...)`.

**The bug:** because `003` already created the table, `005`'s `CREATE TABLE IF NOT EXISTS` is a **no-op** — none of the new columns get added, since there's no companion `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` fallback (unlike how `005` correctly handled `invoices` with `ALTER TABLE`). **If migrations were run in order 003 → 005, the live `payments` table is still the old, thinner `003` shape, but the application code (`api/payments/checkout`, the Stripe webhook) assumes the `005` shape exists.** The `customer_own_payments` RLS policy from `005` references a `customer_id` column that may not exist on the live table, which would make that policy non-functional or error at query time. **This needs a corrective migration** (`ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS ...` for every 005 column) — see [08-code-review-roadmap.md](./08-code-review-roadmap.md).

**RLS (005, applies regardless of the table-shape bug since policies are independent of `CREATE TABLE IF NOT EXISTS`):** `staff_payments` (full CRUD), `customer_own_payments` (SELECT own via `customer_id`).

**Why it exists:** the actual money-movement ledger (as opposed to `invoices`, which is the billing document) — built "future-ready" for Stripe subscriptions, though no subscription-creation code exists yet.

---

### `system_settings` (002) — seed-value inconsistency
`key TEXT PK, value JSONB NOT NULL, updated_at, updated_by → auth.users`.

**RLS:** `admin_settings` (owner/admin **only** — `employee` explicitly excluded, unlike most "staff" policies).

**Seed data bug:** both `002` and `004` seed `support_email` via `ON CONFLICT (key) DO NOTHING` — `002` sets `"support@apexsite.fi"`, `004` attempts `"info@apexsite.fi"`. Whichever migration runs first wins; the second insert is silently ignored. If run in numeric order, the effective value is `support@apexsite.fi`, not `info@apexsite.fi` as `004`'s author apparently intended.

---

### `api_keys` (002)
`id, user_id NOT NULL → auth.users (CASCADE), name NOT NULL, key_prefix NOT NULL, key_hash NOT NULL, last_used_at, created_at`. RLS: `own_api_keys` (self-scoped). Stores only a hash + display prefix, never the raw key — standard practice.

---

### `project_comments` (003; RLS extended 008)
`id, project_id NOT NULL → projects (CASCADE), user_id NOT NULL → auth.users, body NOT NULL, created_at`.

**RLS:** `staff_project_comments` (full CRUD), `customer_read_project_comments` (008, SELECT via project ownership join), `customer_insert_project_comments` (008, INSERT — `WITH CHECK (auth.uid() = user_id AND ...)`, so a customer can only post as themselves).

**Why it exists:** the project-scoped discussion thread — this is the exact table behind the comment-delete feature built earlier in this project (`canModerate` = owner/admin can delete any comment).

---

### "Future foundation" scaffolding (all created in 003)

Migration `003`'s own comment states these are pre-built ahead of planned phases — "UI/API for these tables will be built in future phases." All are staff-only RLS unless noted:

- **`customer_timeline`** — per-customer event feed (`customer_id`, `event_type`, `event_data JSONB`, `created_by`).
- **`customer_notes`** — internal staff notes on a customer, not customer-visible.
- **`tags`** / **`customer_tags`** — reusable label taxonomy + many-to-many join to customers.
- **`milestones`** — project checkpoints (`project_id`, `title`, `due_date`, `completed_at`, `sort_order`).
- **`time_entries`** — staff time tracking/billable hours. RLS: `own_time_entries` — a staffer sees their own; owner/admin see all (note: `employee` is excluded from the "see all" clause, unlike broader staff policies).
- **`email_templates`** (created 002, listed here) — reusable transactional email templates. RLS: owner/admin only.
- **`conversation_participants` / `conversations` / `messages`** — a parallel direct-messaging system, separate from `project_comments`. **Notable schema defect**: `conversation_participants.conversation_id` is created with no FK (since `conversations` doesn't exist yet at that point in the file), and a *second*, differently-named column `conversation_id_fk` is added later with the actual FK constraint — leaving two UUID columns that both mean "which conversation," where the unconstrained original (`conversation_id`) is almost certainly the one actually used by RLS policies and app code, and `conversation_id_fk` is likely dead. Looks like a migration-authoring mistake; a cleanup migration should consolidate these.
- **`teams` / `team_members`** — internal department grouping. RLS: owner/admin only.
- **`leave_requests`** — vacation/sick-leave requests, self + owner/admin override.
- **`integration_configs`** — per-user third-party integration settings (`provider CHECK IN ('stripe','google_calendar','google_drive','github','slack','discord','outlook')`). Self-scoped.
- **`webhooks` / `webhook_deliveries`** — outbound webhook subscriptions + delivery log. `webhook_deliveries` RLS is **SELECT-only** for the owning user — inserts presumably come from a service-role backend process not yet built.
- **`organizations`** — multi-tenant "enterprise account" container. **Not actually wired in**: no `organization_members` table exists, and its RLS policy (`org_member_read`) checks the caller's *global* staff role, not real org membership — this is unfinished scaffolding, not a working multi-tenant boundary.
- **`subscriptions`** — SaaS billing subscription record, tied to `organizations`/`user_id`. Appears to anticipate a future "Apex Site sells subscriptions to organizations" model, distinct from the current "invoice individual customers per project" model — not connected to the live CRM tables via any FK yet.
- **`audit_reports`** — generated compliance/audit report snapshots. Owner/admin only.

## 2.2 Functions and triggers

Exactly one function/trigger pair exists in the entire schema:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

No other triggers, no `updated_at` auto-touch triggers, no computed columns, and **no views** exist anywhere in the 9 migrations.

## 2.3 Entity-relationship structure

```
auth.users (Supabase Auth)
    │
    ├──(1:1, id=id, CASCADE)──▶ profiles (role: owner/admin/employee/customer)
    │
    └──(1:0..1, user_id)──▶ customers ◀──(company_id)── companies
                                │
                                ├──(customer_id)──▶ quotes ──(company_id)──▶ companies
                                │        │  ▲                    │
                                │        │  └──(quote_id)── projects
                                │        └──(1:N)──▶ quote_items
                                │
                                ├──(customer_id)──▶ projects ──(quote_id)──▶ quotes
                                │        │
                                │        ├──▶ tasks, milestones, time_entries, calendar_events
                                │        ├──▶ project_files ──▶ file_comments
                                │        ├──▶ project_comments
                                │        └──▶ file_requests
                                │
                                ├──(customer_id)──▶ invoices ──(project_id)──▶ projects
                                │        │
                                │        └──(invoice_id)──▶ payments ──(customer_id)──▶ customers
                                │
                                ├──▶ file_requests, customer_timeline, customer_notes, customer_tags ◀──(tag_id)── tags
```

**Plain-English summary:**
- `companies` → `customers`: one company, many contacts.
- `customers` → `projects`/`quotes`/`invoices`: one customer, many of each.
- `quotes` → `projects`: an accepted quote typically *becomes* a project (`projects.quote_id`); a quote can also be filed against an *existing* project (`quotes.project_id`) — the schema doesn't enforce these stay consistent.
- `quotes` → `quote_items`: one quote, many line items (cascade delete).
- `projects` → `invoices` → `payments`: project gets billed, invoice gets paid (possibly multiple payment attempts per invoice).
- `projects` → `tasks`/`milestones`/`time_entries`/`calendar_events`/`project_comments`/`file_requests`: all project-scoped operational data.
- Nearly every table has a `created_by`/`assigned_to`/`uploaded_by`/`user_id`/`requested_by` column back to `auth.users` — a consistent "who did this" audit pattern.
- `conversations`/`messages` is a **separate** parallel messaging system from `project_comments` — general/support/direct chat vs. project-specific threads.
- `organizations`/`subscriptions` are unconnected forward-looking scaffolding for a possible future multi-tenant billing model.

## 2.4 Cross-cutting RLS pattern summary

Three patterns recur across nearly all tables:

1. **"Staff" pattern** — `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin','employee'))`. Grants full access to any internal staff member regardless of row ownership. Used by most operational tables.
2. **"Own record" pattern** — `auth.uid() = user_id` (or equivalent). Used by personal/account-scoped tables: `profiles`, `activity_logs`, `notifications`, `user_sessions`, `api_keys`, `integration_configs`, `webhooks`, `subscriptions`.
3. **"Customer via join" pattern** — `EXISTS (SELECT 1 FROM customers c WHERE c.id = <table>.customer_id AND c.user_id = auth.uid())`, or the equivalent through a `projects` join. This is how the customer portal gets a read-mostly (plus limited write: accept/reject quote, upload file, post comment, fulfill file request) view over data staff otherwise manage in full.

## 2.5 Migration-by-migration summary

| File | Purpose | New tables | Notable alterations |
|---|---|---|---|
| `001_dashboard_tables.sql` | Foundational schema | `profiles`, `activity_logs`, `notifications`, `user_sessions`, `companies`, `customers`, `projects`, `quotes`, `invoices` | `handle_new_user()` trigger |
| `002_crm_and_features.sql` | Phase 1 features | `tasks`, `calendar_events`, `project_files`, `email_templates`, `system_settings`, `api_keys` | Redefines `projects.status`; adds `customers.status/assigned_to`, `projects.progress_pct/assigned_to/quote_id/deadline`, `quotes.company_id` |
| `003_future_foundation.sql` | Scaffolding for phases 2–12 | `customer_timeline`, `customer_notes`, `tags`, `customer_tags`, `quote_items`, `milestones`, `time_entries`, `file_comments`, `payments` (v1), `conversation_participants`, `conversations`, `messages`, `project_comments`, `teams`, `team_members`, `leave_requests`, `integration_configs`, `webhooks`, `webhook_deliveries`, `organizations`, `subscriptions`, `audit_reports` | Adds `quotes.pdf_url/accepted_at/rejected_at/accepted_by`, `project_files.category` |
| `004_connectivity.sql` | Customer-portal read access | — | Adds `project_files.quote_id/invoice_id/customer_id`; customer SELECT policies on `quotes`/`projects`/`invoices`/`project_files` |
| `005_payments.sql` | Stripe module | `payments` (v2 — **not actually applied**, see bug above) | Adds `invoices.stripe_*/refunded_at/refund_id`; `invoices.status` +`'refunded'` |
| `006_file_requests.sql` | Customer file upload workflow | `file_requests` | Customer SELECT/INSERT on `project_files` |
| `007_customer_company_info.sql` | Self-service company profile | — | `customers.company_name/y_tunnus/toimiala/lisatiedot`; customer UPDATE on `customers` |
| `008_project_comments_customer_access.sql` | Customer-visible comment thread | — | Customer SELECT/INSERT on `project_comments` |
| `009_customer_quote_status_update.sql` | Customer quote accept/reject | — | Customer UPDATE on `quotes` |

## 2.6 Findings worth fixing (priority order)

1. **`payments` table shape bug** (§ above) — write a corrective migration `010` that adds every `005` column via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
2. **`invoices` customer UPDATE claimed but never implemented** — either add the policy migration `004` promised, or stop implying customers can self-service invoice status.
3. **`conversation_participants` orphaned `conversation_id_fk` column** — consolidate into one properly-FK'd column.
4. **`system_settings.support_email` seed inconsistency** — pick one value and fix it via a direct `UPDATE`, since `ON CONFLICT DO NOTHING` will never self-correct.
5. **Customer UPDATE policies lack column-level restriction** (`quotes`, `file_requests`) — acceptable today because the API layer enforces "only status" restrictions, but if anyone ever writes directly to Postgres (a script, a different client), this is not actually enforced by the database.
6. **`projects.status` breaking change between 001 and 002** — document this in the migration file itself so nobody replays `001` alone against seed data expecting `'active'` to still be valid.
