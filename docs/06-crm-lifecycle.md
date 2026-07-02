# 6. The CRM Lifecycle — Visitor → Lead → Customer → Quote → Project → Files → Invoice → Payment

This section is written as a narrative, because that's the only way the "why" actually holds together — the tables and API routes in isolation ([02](./02-database.md), [04](./04-api-reference.md)) don't tell you *why* they're shaped the way they are. Read this after the earlier sections; it's the synthesis.

## Stage 1 — Visitor (no database row exists yet)

Someone lands on the `(marketing)` site. Two paths lead out of this stage:

- **They fill out the contact form** → `POST /api/contact` (public, Zod-validated, rate-limited 5/hour/IP). This is the very first moment a database row can be created.
- **They talk to the AI chat widget** (`ChatBot.tsx` → `/api/chat`) — this is stateless and never writes to the database on its own. If the conversation needs a human, it hands off via Crisp or `/api/chat/handoff` (an email, not a CRM write) — the AI assistant is a **pre-sales filter**, not a lead-capture mechanism in itself.

**Why it's built this way:** the contact form is the only structured lead-capture path, deliberately — it's the one place input is validated (Zod schema) and rate-limited, because it's the one public write endpoint that creates real business records.

## Stage 2 — Lead (a `customers` row exists, `status: "lead"`)

`POST /api/contact`, using a **service-role client** (no user session exists for an anonymous form submission — this is one of the few genuinely necessary uses of `createAdminClient()`), does the following, all best-effort (wrapped in try/catch — a DB hiccup here must not fail the visitor's form submission):

1. Looks up an existing `customers` row by email. If none exists, inserts one with `status: "lead"` and the form's message/budget/timeline packed into `notes`.
2. If a company name was given, finds-or-creates a `companies` row and links `customers.company_id`.
3. If the matched customer was previously `"inactive"`, upgrades them back to `"lead"` (a returning prospect).
4. Notifies every `owner`/`admin` profile (`type: "system"`, "Uusi liidi").
5. Sends two emails via Resend (office notification + visitor auto-reply).

**At this point, `customers.user_id` is still `NULL`.** There is no login account yet — a lead is purely a CRM contact. This is deliberate: you shouldn't need a login to be a lead.

## Stage 3 — Customer conversation (still no login required)

This is the manual step this project discussed at length earlier: **support calls the lead, and you don't yet know their company name, their exact requirements, or their logo — and that's fine.** Nothing in the schema requires those fields to exist before a lead can progress. Staff record whatever they learn in `customers.notes`, or in the future-scaffolded `customer_notes`/`customer_timeline` tables (built in migration 003, but with no UI/API yet — see [08](./08-code-review-roadmap.md)).

## Stage 4 — Quote (`quotes` row, `status: "draft"` → `"sent"`)

Staff create a quote (`POST /api/quotes`, staff-only, defaults `status: "draft"`) linked to the `customer_id`. Once ready, it's transitioned to `"sent"` (`PATCH /api/quotes`), which:
- Notifies the customer, **if** `customers.user_id` is set (i.e., they already have a login).
- Logs `quote_sent`.

**Here is the exact bug this project fixed twice this session, and why it happened.** If the lead was created via the CRM (`POST /api/crm/customers`) rather than via the public contact form, `user_id` is *never* set at creation time — there is no field for it in that endpoint. If the actual customer signs up for a portal account *afterward*, using the same email, nothing used to connect the two. `(dashboard)/layout.tsx` now self-heals this on every dashboard page load: if a logged-in `customer`-role user has no linked `customers` row, it searches for an unclaimed one with a matching email and links it. **This is why the fix belongs in the layout, not the CRM-create endpoint alone** — a customer might sign up for a login *before or after* the CRM record exists, and the layout runs on every session regardless of ordering.

The customer sees the quote at `/portaali/tarjoukset/{id}` and can **Hyväksy** (accept) or **Hylkää** (reject) it directly — but only once two things both exist: the `customer_own_quotes` SELECT policy (migration 004) so they can see it at all, and the `customer_update_own_quote` UPDATE policy (migration 009) so the button actually does something. Both were missing until this session; the button existed in the UI for a while before the database caught up. **This is the single clearest illustration in the whole codebase of the "manual migrations" risk described in [02-database.md](./02-database.md) — a fully-built, fully-wired UI feature that silently did nothing for however long the migration went unapplied.**

## Stage 5 — Quote accepted → Project auto-created (no manual step)

When status flips to `"accepted"` via `PATCH /api/quotes`, the route doesn't just update a row — it runs the **one real business-logic cascade in the entire app**:

1. Checks whether a `projects` row already references `quote_id` (idempotency — accepting twice doesn't create two projects).
2. If not, inserts a new `projects` row: `customer_id`, `quote_id`, `name: quote.title`, `status: "planning"`, `budget: quote.amount`, `progress_pct: 0`.
3. Notifies every owner/admin ("Uusi projekti luotu").
4. Notifies the customer ("Projektisi on aloitettu").

**Why this matters for anyone maintaining the app:** this is the one place where "the quote" and "the project" are the same business event seen from two angles, and it's implemented as a side effect buried inside a `PATCH` handler rather than as an explicit, separately-testable state machine. If you ever need to add a step between "accepted" and "project exists" (e.g. requiring a signed contract first), this is the function you'd need to touch, and it's easy to miss on a first read of `api/quotes/route.ts` because nothing in the route's name suggests it also writes to `projects`.

## Stage 6 — Collecting the missing pieces (company name, logo, exact requirements)

This is the part of the earlier conversation this documentation formalizes. **Nothing blocks project creation on these being filled in** — they're gathered *after* the project already exists, through three separate mechanisms:

- **Company details** (`company_name`, `y_tunnus`, `toimiala`, `lisatiedot`) — the customer self-serves this at `/asetukset/yritystiedot` (`GET`/`PATCH /api/account/company-info`), or staff fill it in via `/crm/asiakkaat/{id}`. Migration 007 added these as free-text fields *parallel to* the normalized `company_id → companies` link — two ways to represent "what company," not reconciled with each other (see [02-database.md](./02-database.md)).
- **Logo and other assets** — staff open the project's Tiedostot tab and create a **file request** (`POST /api/files/requests`: title, description, due date). It shows as a pending request the customer sees and can fulfill directly by uploading (`POST /api/files/upload`), after which either side marks it `fulfilled` (`PATCH /api/files/requests`).
- **Exact requirements / back-and-forth** — the project's **Kommentit** tab (`project_comments` table), a two-way thread notifying whichever side didn't post.

**Why this staged-collection design is correct for this business**: a sales call shouldn't stall on paperwork. The schema lets a lead become a paying project with almost no required fields, and back-fills detail asynchronously, which matches how the earlier conversation in this project described the actual sales process (support calls, doesn't know the company name yet, gets a rough "wants a webshop" and turns that into a quote anyway).

## Stage 7 — Work happens

`tasks` (Kanban board, staff-only, no customer visibility at all), `progress_pct` on the project (staff-editable, customer-visible read-only), `calendar_events` (staff-only). None of this is customer-facing except the read-only progress bar and the comment thread.

## Stage 8 — Invoice (`invoices` row)

Staff create an invoice against the project/customer (`POST /api/invoices`, auto-numbered `INV-YYYYMM-NNN` — though the counter isn't actually scoped per month, see [04-api-reference.md](./04-api-reference.md)). If created directly as `"sent"`, the customer is notified.

## Stage 9 — Payment (Stripe)

The customer clicks **Maksa** on their invoice → `POST /api/payments/checkout` → redirected to Stripe-hosted checkout. Stripe's webhook (not the checkout call itself) is the actual source of truth for "did this get paid" — `checkout.session.completed` marks both the `payments` row and the `invoices` row as paid, asynchronously, whenever Stripe confirms it. This two-step design (checkout creates a `pending` record; the webhook confirms it) is correct and standard practice — **but** the payment-confirmation notification is currently broken due to a column-name mismatch (see [07-payments-ai-notifications.md](./07-payments-ai-notifications.md)), so the customer's only *reliable* confirmation today is the redirect to `/portaali/maksut/success`, not an in-app notification.

## The lifecycle end to end, as a single diagram

```
(marketing) visitor
     │  fills /api/contact  (public, service-role client, best-effort CRM write)
     ▼
customers (status: lead, user_id: NULL)
     │  staff learns more, calls, records notes
     │  staff may separately create a login-less CRM record via /crm/asiakkaat
     │  customer may separately sign up for a portal login — (dashboard)/layout.tsx
     │  self-heals the user_id link by matching email, on any dashboard visit
     ▼
quotes (status: draft → sent)          ← customer can only see this once user_id is linked
     │  customer clicks Hyväksy/Hylkää  ← requires RLS migration 009 to actually work
     ▼ (status: accepted)
projects (auto-created by PATCH /api/quotes, idempotent on quote_id)
     │  company info filled in later (self-service or staff)  — /asetukset/yritystiedot
     │  logo/assets requested + uploaded later                — file_requests + files/upload
     │  requirements clarified in the comment thread           — project_comments
     │  work tracked                                           — tasks, progress_pct
     ▼
invoices (status: pending → sent)
     │  customer clicks Maksa
     ▼
Stripe Checkout → payments (pending) → [Stripe webhook confirms] → payments+invoices (completed/paid)
```
