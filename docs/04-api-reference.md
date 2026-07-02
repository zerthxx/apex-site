# 4. API Reference

Complete inventory of all 36 route files under `src/app/api/` plus the OAuth callback under `src/app/auth/`.

**Common patterns across every route:**
- Regular client `createClient()` (`@/lib/supabase/server`) — cookie-bound, RLS-enforced.
- Admin client `createAdminClient()` (`@/lib/supabase/admin`) — service-role, bypasses RLS. Used when: (a) looking up another user's `auth.users` metadata via `admin.auth.admin.*`, (b) reading/writing another user's `profiles` row, (c) accessing the private storage bucket, or (d) operating before any session exists (OTP, webhooks, contact form).
- Two parallel logging helpers both write to `activity_logs`: `@/lib/activity` (`logActivity(supabase, userId, event_type, event_data)`, no try/catch) and `@/lib/supabase/activityLog` (typed `ActivityEventType` union, try/catch-wrapped, also captures IP/user-agent).
- Error messages are in Finnish (`"Ei oikeuksia"` = no permissions, `"Ei kirjautunut"` = not logged in).
- Standard staff check: `["owner","admin","employee"].includes(profile?.role ?? "")`; owner/admin-only actions further restrict to `["owner","admin"]`.

---

## Auth

### `GET /auth/callback`
Exchanges an OAuth `code` for a session, redirects based on profile completeness. See [03-authentication-security.md §3.4](./03-authentication-security.md#34-google-oauth-flow) for full detail. Logs `google_login` on success.

---

## Account

### `POST /api/account/api-keys`
Creates a personal API key. Body `{ name }`. Returns `201 { key (raw, shown once), record }`. Any authenticated user, self-scoped. Generates `apex_<64 hex>`, stores only a SHA-256 hash + 12-char prefix in `api_keys`.

### `DELETE /api/account/api-keys`
Body `{ id }`. Deletes `.eq("id", id).eq("user_id", user.id)` — self-scoped by query, not just RLS.

### `GET /api/account/company-info`
Returns the caller's own `customers` row fields (`company_name, y_tunnus, toimiala, lisatiedot`). `401` unauthenticated.

### `PATCH /api/account/company-info`
Upsert — updates the caller's `customers` row if it exists, else inserts a new one seeded from `user_metadata`/auth email plus submitted fields.

### `POST /api/account/delete-request`
No body. Records a deletion request timestamp into `user_metadata.deletion_requested_at` via the **admin API** (`admin.auth.admin.updateUserById`, required since regular clients can't write `user_metadata`), then emails the site owner via Resend. No `activity_logs`/`notifications` entry.

---

## Activity Log

### `GET /api/activity`
Query: `limit` (default 50, max 200), `userId` (optional). Self-scoped unless caller is owner/admin requesting another user's logs (`403` otherwise).

### `POST /api/activity`
Body `{ event_type (required), event_data? }`. Generic write endpoint — inserts `activity_logs` with `ip_address` (from `x-forwarded-for`) and `user_agent` headers. This is what the client-side OTP sign-in flow calls to log `"login"` after a successful OTP verify.

---

## Admin — Settings / Templates / Users

### `GET`/`PATCH /api/admin/settings`
Owner/admin only (`requireAdmin()`). Lists/upserts `system_settings` (`key, value, updated_at, updated_by`). No activity log on change, despite being a config mutation.

### `GET`/`POST`/`PATCH`/`DELETE /api/admin/templates`
Owner/admin only. CRUD over `email_templates`. No activity logging anywhere in this file.

### `GET /api/admin/users`
Owner/admin only, with correctly-differentiated `401` (not logged in) vs `403` (logged in, not admin). Uses `createAdminClient()` for **two** operations: `admin.auth.admin.listUsers({perPage:1000})` (impossible via regular client — no RLS-based way to list `auth.users`) and a bypass-RLS `profiles` read ("so RLS doesn't filter out other users' profiles," per inline comment). Merges into one combined user object.

### `PATCH /api/admin/users`
Body `{ userId, action: "suspend"|"unsuspend"|"role", role? }`. Guards: cannot change own role; only an existing `owner` can grant `owner`; non-owners cannot modify an existing owner's role; `role` must be one of the 4 valid values. All writes via `createAdminClient()` since they target *other users'* rows. `suspend` also force-signs-out the user globally (`admin.auth.admin.signOut(userId, "global")`). Logs `user_suspended`/`user_unsuspended`/`role_changed`.

---

## Chat / AI Support

### `POST /api/chat`
Public, unauthenticated. Body `{ messages: [{role, content}] }`. Forwards the last 10 messages + a system prompt (built from static knowledge) to OpenAI `gpt-4o-mini` via raw `fetch`. Returns `{ reply }`. See [07-payments-ai-notifications.md](./07-payments-ai-notifications.md) for the full AI architecture.

### `POST /api/chat/handoff`
Public. Body `{ name, email, problem, history }`. Emails the full transcript to the site owner via Resend when the AI hands off to a human.

---

## Contact (public lead capture)

### `POST /api/contact`
Public marketing-site contact form. Zod-validated (`nimi`, `sahkoposti`, `puhelin?`, `yritys?`, `palvelu` enum, `budjetti?`, `aikataulu?`, `viesti` 20–2000 chars, `honeypot` must be empty). In-memory rate limit: 5 requests/hour/IP (not distributed). Uses a **service-role client** (no session exists for a public form) to: look up/create a `customers` lead (`status: "lead"`), find-or-create a `companies` row if a company name was given, and notify every `owner`/`admin` via `notifications` (`type: "system"`). All CRM writes are wrapped in try/catch and best-effort — a DB failure here does not fail the request. Also sends two Resend emails (office notification + visitor auto-reply).

---

## CRM — Companies

### `GET /api/crm/companies`
Staff only. Query `q` (`ilike` name search). Returns companies with a computed `contact_count` (separate query over `customers.company_id`, merged in JS).

### `POST`/`PATCH /api/crm/companies`
Staff only. Create/update. No activity logging in this file at all.

### `DELETE /api/crm/companies`
Owner/admin only (stricter than create/update, which allow employee).

### `GET /api/crm/companies/[id]`
Staff only. Returns `{ company, contacts, projects }` — contacts via `customers.company_id`, but **projects are queried via `projects.customer_id = <company id>`**, which looks like a copy-paste mismatch (a company's id is not a customer id) — worth verifying against actual behavior.

### `PATCH`/`DELETE /api/crm/companies/[id]`
`PATCH`: staff. `DELETE`: owner/admin only.

---

## CRM — Customers

### `GET /api/crm/customers`
Staff only. Query `q` (searches first/last/email), `status`. Joined to `companies`.

### `POST /api/crm/customers`
Staff only. Requires at least one of `first_name`/`last_name`/`email`. **Does not accept or set `user_id`** — this is the exact gap that caused the "customer can't see their quotes" bug fixed earlier this session; `(dashboard)/layout.tsx` now self-heals this by email match on next login. Logs `customer_created`.

### `GET /api/crm/customers/[id]`
Staff only. Returns the customer plus their quotes/projects/invoices in parallel queries.

### `PATCH`/`DELETE /api/crm/customers/[id]`
`PATCH`: staff, logs `customer_updated`. `DELETE`: owner/admin only, logs `customer_deleted`.

---

## Calendar Events

### `GET`/`POST`/`PATCH`/`DELETE /api/events`
All staff (owner/admin/employee) uniformly — **no extra owner/admin restriction on delete**, unlike most other resources. `GET` supports `month=YYYY-MM` filtering. `POST` requires `title`+`start_at`, sets `created_by`. No activity logging in this file.

---

## Files / File Requests

### `GET`/`POST`/`DELETE /api/files`
Staff only, uniform. `GET`: optional `project_id` filter. `POST`: registers file *metadata* (not the binary — see `/upload` below), auto-computes next `version` by counting existing rows with the same `name`+`project_id`. `DELETE`: removes the storage object then the DB row, logs `file_deleted`.

### `GET /api/files/download/[id]`
Generates a 1-hour signed download URL. Staff can download any file; customers must own (via `customers.user_id → projects.customer_id`) the file's project (`403` otherwise, `404` if the file row is missing). Uses `createAdminClient()` for the signed-URL generation ("regular client can't access private bucket," per comment) but the regular client for the ownership check.

### `GET`/`POST /api/files/requests`
`GET`: any authenticated user, no role check (RLS enforces the real boundary — see [03 §3.9.E](./03-authentication-security.md)). `POST`: staff only, requires `project_id`+`customer_id`+`title`.

### `PATCH /api/files/requests`
Body `{ id, status }`. **No role/ownership check at all** in application code (§3.9.E) — relies entirely on the `customer_fulfill_file_requests` RLS policy. Sets `fulfilled_at` when status becomes `"fulfilled"`.

### `POST /api/files/upload`
`multipart/form-data`: `file` (required), `project_id` (optional for staff, required for customers). Customers restricted to their own project. Storage path: `${projectId}/${timestamp}_${filename}` or `shared/${timestamp}_${filename}`. Uses `createAdminClient()` for the storage upload ("bypass bucket RLS," per comment); regular client for versioning + the `project_files` insert. Logs `file_uploaded`.

---

## Invoices

### `GET /api/invoices`
Staff sees all (filterable by `status`/`customer_id`); customers auto-scoped to their own `customers.id` (empty array if unlinked).

### `POST /api/invoices`
Staff only. Requires `customer_id`. **Invoice numbering**: `INV-YYYYMM-NNN` where `NNN` = a running count of *all* existing invoices + 1 — **not scoped per month**, so numbers are not guaranteed sequential-within-month if invoices from other months are counted too. If created directly with `status: "sent"`, notifies the customer. Logs `invoice_created`.

### `PATCH /api/invoices`
Staff only. Auto-sets `paid_at` when `status` is set to `"paid"`; logs `invoice_paid` only in that case.

### `DELETE /api/invoices`
Owner/admin only.

---

## Payments (see [07-payments-ai-notifications.md](./07-payments-ai-notifications.md) for the full Stripe narrative)

### `GET /api/payments`
Staff sees all (joined to invoices+customers); customers see their own (joined to invoices only). Query `status`, `limit` (default 100, max 500).

### `DELETE /api/payments`
Owner/admin only.

### `POST /api/payments/checkout`
Body `{ invoice_id }`. Requires invoice status `sent`/`overdue` and `amount > 0`. Staff can pay any invoice; customers only their own. **Idempotent**: reuses an existing pending Stripe session if one is live, blocks re-payment if already `completed`. Creates a `payments` row (`status: "pending"`) *before* calling Stripe, then a Stripe Checkout Session (`mode: "payment"`, dynamic `price_data` from `invoice.amount * 100`, Finnish locale, metadata carries `invoice_id`/`customer_id`/`internal_payment_id`). Returns the Stripe-hosted `url`. Uses `createAdminClient()` for all `payments` reads/writes.

### `GET /api/payments/export`
Owner/admin only. Streams a CSV (`Content-Disposition: attachment`) of payments in a date range, up to 5000 rows.

### `POST /api/payments/refund`
Owner/admin only. Requires the payment be `completed` with a `stripe_payment_intent`. Calls `stripe.refunds.create`, cascades `refunded` status to both `payments` and the linked `invoices` row. Logs `payment_refunded`.

### `POST /api/webhooks/stripe`
Public (Stripe-signed, `runtime: "nodejs"` for raw-body signature verification via `STRIPE_WEBHOOK_SECRET`). Always returns `200`/`{received:true}` even on internal processing errors ("so Stripe doesn't retry" — errors only `console.error`'d). Handles `checkout.session.completed` (marks payment+invoice paid, fetches receipt URL, notifies customer, logs `invoice_paid_via_stripe`), `payment_intent.payment_failed` (marks payment failed), `charge.refunded` (cascades refund status). Exclusively uses `createAdminClient()` since no user session exists in a webhook call. **🔴 Bug**: the `checkout.session.completed` notification insert uses columns `title`/`message`/`link`, but the real `notifications` schema is `title`/`body`/`href` with a `type` CHECK that doesn't include `'payment'` — this insert fails silently, meaning **customers likely never receive an actual "payment received" notification** despite the code appearing to send one.

---

## Projects

### `GET /api/projects`
Staff sees all (filterable by `status`); customers see only their own.

### `POST /api/projects`
Staff only. Requires `name`. Defaults `status: "planning"`, `progress_pct: 0`. Logs `project_created`.

### `PATCH /api/projects`
Staff only. Logs `project_updated`.

### `DELETE /api/projects`
Owner/admin only. Logs `project_deleted`.

---

## Project Comments

### `GET /api/projects/[id]/comments`
🔴 **See [03-authentication-security.md §3.9.A](./03-authentication-security.md#39-known-security-gaps-in-priority-order) — no ownership/role check, uses the admin client, is a live IDOR.** Resolves each commenter's display name via `admin.auth.admin.getUserById`.

### `POST /api/projects/[id]/comments`
Body `{ body }` (non-empty after trim). Staff can comment on any project; customers restricted to their own. If staff posted, notifies the project's customer (`type: "message"`); if a customer posted, notifies **every** staff profile. Uses the admin client (needed to resolve the poster's display name and to write notifications for arbitrary recipients).

### `DELETE /api/projects/[id]/comments`
Body `{ commentId }`. **Owner/admin only** — note employees can *post* comments but not *delete* them, an intentional asymmetry matching the "moderation is owner/admin-only" convention used elsewhere.

---

## Quotes

### `GET /api/quotes`
Staff sees all (filterable); customers see only their own, relying on both an app-level filter and the `customer_own_quotes` RLS policy.

### `POST /api/quotes`
Staff only. Requires `title`. Defaults `status: "draft"`. Logs `quote_created`; if created directly as `"sent"`, notifies the customer.

### `PATCH /api/quotes` — the main automated cascade in the system
Staff can update any field. **Non-staff customers are restricted to exactly `{status: "accepted"|"rejected"}`** — any other key or value → `403`. Status-transition side effects:
- `sent` → notifies the customer.
- `accepted` → if no `projects` row already references this `quote_id`, **auto-creates one** (`customer_id`, `quote_id`, `name: quote.title`, `status: "planning"`, `budget: quote.amount`), notifies all owner/admin profiles, notifies the customer, and returns `{ quote, project: newProject }`.
Logs `quote_sent`/`quote_accepted`/`quote_rejected` via a status→event map.

### `DELETE /api/quotes`
Owner/admin only. Logs `quote_deleted` (fetches the title first for the log entry).

---

## Notifications

### `GET /api/notifications`
Self-scoped. Query `unread=1` filters to unread only. Limit 50.

### `PATCH /api/notifications`
Body `{ id }` (mark one read) or `{ all: true }` (mark all read) — both scoped to `user_id = caller`.

---

## Sessions

### `GET`/`DELETE /api/sessions`
Self-scoped. `DELETE` body `{ logoutOthers: true }` (calls `supabase.auth.signOut({scope:"others"})` + bulk-marks `user_sessions` logged out) or `{ sessionId }` (marks one). **No activity log entry for session revocation** despite a `"logout"` event type existing in the typed union. See [03 §3.6](./03-authentication-security.md#36-sessions) for why this feature is currently non-functional (nothing populates `user_sessions`).

---

## Staff

### `GET /api/staff`
Any staff member. Lists `profiles` where role is owner/admin/employee — used to populate assignee dropdowns elsewhere in the app.

---

## Tasks

### `GET`/`POST`/`PATCH`/`DELETE /api/tasks`
All staff uniformly, including delete (no owner/admin restriction, unlike most other resources — consistent with `events`). `GET` supports `mine=1` and `project_id` filters. Logs `task_created`/`task_updated` (no delete logging).

---

## Search

### `GET /api/search`
Staff-only global command-palette search. Query `q` (min 2 chars). Parallel `ilike`/`or` queries across `customers`, `companies`, `projects`, `quotes`, `project_files` — up to 5 results per category. Non-staff callers get an empty result set rather than an error (soft-deny).

---

## OTP

### `POST /api/otp/send` / `POST /api/otp/verify`
Pre-session flows using an ad-hoc admin client. See [03-authentication-security.md §3.2](./03-authentication-security.md#32-registration-flow-email--password--custom-otp) for full detail, including the missing-migration gap for `otp_codes`.

---

## Revalidation (Sanity CMS webhook)

### `POST /api/revalidate`
Server-to-server webhook, authenticated by a shared secret header (`x-sanity-webhook-secret` === `SANITY_REVALIDATE_SECRET`), not by user session. Triggers Next.js `revalidatePath()` for `/blogi`, `/portfolio` (and their `[slug]` pages) on Sanity content publish.

---

## Cross-cutting findings

- **Admin-client usage is consistently justified** by one of: needing the Supabase Admin API (`auth.admin.*`), writing to another user's row that RLS would otherwise block, private storage bucket access, or no session existing yet (OTP, contact form, Stripe webhook) — **except** the comments-GET route, which is the one unjustified/dangerous usage (§3.9.A).
- **Quote acceptance is the single automated business-logic cascade** in the whole system — everything else is a direct 1:1 CRUD operation.
- **Notification schema inconsistency**: every route uses `title`/`body`/`href` except the Stripe webhook, which uses `title`/`message`/`link` — a real, currently-broken notification.
- **Delete restricted to owner/admin** on: companies, customers, invoices, payments, projects, quotes, project comments. **Delete allowed for all staff (including employee)** on: tasks, calendar events. This is a real, consistent policy — not an oversight — but worth knowing before adding a new resource, to match the existing convention.
- **In-memory rate limiting** (`contact`, `otp/send`) is per-instance, not safe for a multi-instance/serverless deployment.

**Full file inventory (36 route files + 1 auth callback):** `account/api-keys`, `account/company-info`, `account/delete-request`, `activity`, `admin/settings`, `admin/templates`, `admin/users`, `chat`, `chat/handoff`, `contact`, `crm/companies`, `crm/companies/[id]`, `crm/customers`, `crm/customers/[id]`, `events`, `files`, `files/download/[id]`, `files/requests`, `files/upload`, `invoices`, `notifications`, `otp/send`, `otp/verify`, `payments`, `payments/checkout`, `payments/export`, `payments/refund`, `projects`, `projects/[id]/comments`, `quotes`, `revalidate`, `search`, `sessions`, `staff`, `tasks`, `webhooks/stripe`, plus `auth/callback`.
