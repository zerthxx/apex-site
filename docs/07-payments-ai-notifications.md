# 7. Payments (Stripe), AI Assistant, Activity Logs, Notifications, Config

## 7.1 Payments / Stripe — real integration, not a placeholder

`stripe ^22.3.0` is a real dependency, called server-side with actual API calls (Checkout Sessions, PaymentIntents, Refunds, webhook signature verification). Client singleton: `src/lib/stripe.ts` (`new Stripe(process.env.STRIPE_SECRET_KEY!)`, no API version pinned).

### Checkout flow (`POST /api/payments/checkout`)
1. Authenticates via Supabase session, fetches the target `invoices` row.
2. Only allowed if invoice status is `sent`/`overdue` and `amount > 0`.
3. Staff can pay any invoice; customers only their own (verified via `customers.user_id`).
4. **Idempotency**: checks for an existing `pending`/`completed` `payments` row for the invoice. If `completed`, blocks re-payment. If `pending` with a live Stripe session, reuses that session's URL instead of creating a duplicate.
5. Inserts a `payments` row (`status: "pending"`) via the **admin client** before calling Stripe.
6. Creates a Stripe Checkout Session (`mode: "payment"`, single dynamic `price_data` line item priced from `invoice.amount * 100` cents, metadata carries `invoice_id`/`customer_id`/`internal_payment_id`, Finnish locale, success/cancel URLs → `/portaali/maksut/success` / `/cancel`).
7. Updates the `payments` row with the new `stripe_checkout_session` id, returns the hosted checkout `url`.

### Webhook (`POST /api/webhooks/stripe`, `runtime: "nodejs"`)
Verifies signature via `stripe.webhooks.constructEvent`. Always returns `200` even on internal errors (so Stripe doesn't retry — errors only logged to console). Handles:
- **`checkout.session.completed`**: marks `payments` and `invoices` both `completed`/`paid` (fetches `receipt_url` by expanding `latest_charge`), inserts a customer notification and an `activity_logs` row directly (`event_type: "invoice_paid_via_stripe"`, `user_id: null` — bypassing the `logActivity()` helpers entirely).
- **`payment_intent.payment_failed`**: `payments.status = "failed"`.
- **`charge.refunded`**: looks up by `stripe_payment_intent`, cascades `refunded` to both `payments` and the linked `invoices`.
- **`payment_intent.succeeded`**: explicit no-op (handled by `checkout.session.completed` instead).

> 🔴 **Bug**: the notification insert on `checkout.session.completed` uses `title`/`message`/`link` columns and `type: "payment"`. The real `notifications` schema (migration 001) only has `title`/`body`/`href`, with a `CHECK` limiting `type` to `('quote','project','invoice','message','system')` — `'payment'` isn't a valid value. **This insert fails on every successful payment**, silently, since the webhook doesn't check the insert's error and always returns 200. Customers likely never actually receive a "payment received" in-app notification, despite the code appearing to send one. Every other notification insert site in the codebase correctly uses `title`/`body`/`href` — this is the one outlier.

### Refunds (`POST /api/payments/refund`)
Owner/admin only. Requires `status: "completed"` + a `stripe_payment_intent`. Calls `stripe.refunds.create`, cascades status to `payments`/`invoices`, logs `payment_refunded`.

### `payments` table
See [02-database.md](./02-database.md) for the full schema and the **table-shape bug** (migration `005`'s richer Stripe-ready columns likely never actually applied if `003` already created the table, since `CREATE TABLE IF NOT EXISTS` is a no-op when the table exists — this needs a corrective `ALTER TABLE` migration).

### UI pages
`/portaali/maksut` (role-branched list + stats), `/admin/maksut` (superset: refund action, CSV export via `/api/payments/export`), `/portaali/maksut/success` (confirms the session server-side via the Stripe SDK, shows a receipt link), `/portaali/maksut/cancel` (flips a pending payment to `failed` via the admin client).

**Conclusion**: Stripe is a real, working end-to-end integration (checkout → webhook → invoice/payment status → receipt), with one concrete defect: the malformed notification payload on payment completion.

## 7.2 AI Assistant — real OpenAI integration, plus a live-chat handoff path

### Architecture
- **`src/components/ui/ChatBot.tsx`** — the floating orange circular button seen throughout the dashboard/marketing site (`fixed bottom-5 right-5`, `MessageCircle` icon). Wired to a real backend: `send()` POSTs to `/api/chat`.
- **`src/app/api/chat/route.ts`** — loads static `getKnowledge()`, builds a system prompt via `buildSystemPrompt()`, calls the **real OpenAI REST API directly** (`fetch("https://api.openai.com/v1/chat/completions")`, no SDK — `openai` isn't a package dependency). Model: `gpt-4o-mini`. Sends `[system, ...last 10 messages]`, `max_tokens: 400`, `temperature: 0.7`. Returns `{ reply }`.
- **`src/lib/chat/knowledge.ts`** — a **hardcoded, static** `CompanyKnowledge` object (company info, 5 services with pricing, 3 packages, 3 maintenance tiers, addon prices, a 7-step process description, FAQ — all in Finnish). Comment explicitly says `// Future: replace with vector DB / CMS call`. **No RAG, no embeddings, no vector search exist** — it's an in-memory object re-read on every request.
- **`src/lib/chat/buildSystemPrompt.ts`** — assembles the knowledge into one long Finnish system prompt. Key behavioral rules baked into the prompt text (not code-enforced): persona is "Apex Site's sales assistant" (not a general AI); strict topic refusal for anything off-business (geography, politics, homework, general programming, etc.) via an exact canned Finnish refusal sentence; sales behavior (ask clarifying questions, suggest a package, offer a free consultation call); reply in Finnish or English matching the visitor, max 3–4 sentences, no invented prices/facts.

### Conversation state
Entirely client-side and ephemeral — a `useState<Message[]>` array in `ChatBot.tsx`, nothing persisted to Supabase. No conversation ID, no chat-history table.

### Handoff to human support
If the OpenAI reply starts with a literal `"[HANDOFF] ..."` string (per the system prompt's instruction — used when the visitor asks for a human, seems frustrated, or wants to book/order), the frontend strips the tag and, after 1.5s, calls `openCrisp()`. **`src/components/ui/CrispChat.tsx`** loads the Crisp live-chat widget globally but immediately hides its own floating button (`chat:hide` on load) — Crisp only ever surfaces programmatically through this handoff flow or a "Live-tuki" button. **`POST /api/chat/handoff`** is a separate, simpler path: emails the full transcript via Resend to a hardcoded address. Note: nothing in the reviewed `ChatBot.tsx` code actually calls this route directly — the handoff flow goes straight to Crisp; `/api/chat/handoff` may be wired from elsewhere in the Crisp UI not covered by this audit, or may be a partially-connected feature worth double-checking.

### Vendor summary
OpenAI (`gpt-4o-mini`), raw REST, no SDK dependency. **No Anthropic/Claude integration** — the knowledge base mentions "OpenAI/Anthropic-integraatiot" only as *marketing copy for a service Apex Site sells to its own clients*, unrelated to the bot's own implementation.

## 7.3 Activity Logs

**Two parallel, non-identical `logActivity` implementations exist** — organic duplication, not a deliberate pattern:

- **`src/lib/activity.ts`** — `logActivity(supabase, userId, event_type: string, event_data = {})`. Loosely typed, no try/catch, no IP/user-agent capture. Used by nearly all business-object routes (quotes, projects, tasks, invoices, files, customers).
- **`src/lib/supabase/activityLog.ts`** — typed `ActivityEventType` union (`"login" | "logout" | "google_login" | "password_change" | "profile_update" | "email_verified" | "account_suspended" | "account_unsuspended" | "role_changed"`), wrapped in try/catch ("logging must never break the main flow"), captures `ip_address`/`user_agent`, exports `EVENT_LABELS` (Finnish display strings). Used by auth/account routes. Its type union doesn't cover most of the event strings actually used elsewhere (e.g. `quote_created`), so it's effectively only exercised by the auth code paths.

### Every distinct `event_type` logged, by call site

| Event type | File |
|---|---|
| `google_login` | `auth/callback/route.ts` |
| `user_suspended`, `user_unsuspended`, `role_changed` | `api/admin/users/route.ts` |
| `project_created`, `project_updated`, `project_deleted` | `api/projects/route.ts` |
| `customer_created`, `customer_updated`, `customer_deleted` | `api/crm/customers/route.ts` / `[id]/route.ts` |
| `quote_created`, `quote_sent`, `quote_accepted`, `quote_rejected`, `quote_deleted` | `api/quotes/route.ts` |
| `payment_refunded` | `api/payments/refund/route.ts` |
| `task_created`, `task_updated` | `api/tasks/route.ts` |
| `invoice_created`, `invoice_paid` | `api/invoices/route.ts` |
| `file_deleted`, `file_uploaded` | `api/files/route.ts`, `api/files/upload/route.ts` |
| `invoice_paid_via_stripe` | `api/webhooks/stripe/route.ts` — inserted **directly**, bypassing both `logActivity` helpers, with `user_id: null` (system-triggered) |

### Admin activity log page (`/admin/logi`)
Owner/admin only, reuses the shared `ActivityFeed` component. `EVENT_ICONS`/`EVENT_ACCENT`/`EVENT_LABELS` were clearly built for the auth event set first — most of the business-object events above (quotes, projects, invoices, files, CRM) fall back to a generic icon and their **raw snake_case type string** as the label, since they're absent from `EVENT_LABELS`. Cosmetic gap, not a functional one.

## 7.4 Notifications

### Every `.from("notifications").insert(` call site

| File | Trigger | Recipient(s) | `type` |
|---|---|---|---|
| `api/quotes/route.ts` (POST, `status:"sent"`) | New quote created already-sent | The quote's customer | `quote` |
| `api/quotes/route.ts` (PATCH, →`sent`) | Staff sends a draft quote | The quote's customer | `quote` |
| `api/quotes/route.ts` (PATCH, →`accepted`, bulk) | Quote accepted → project created | All owner/admin | `project` |
| `api/quotes/route.ts` (PATCH, →`accepted`) | Same event | The customer | `project` |
| `api/invoices/route.ts` | New invoice created `sent` | The customer | `invoice` |
| `api/projects/[id]/comments/route.ts` (staff) | Staff comments | The customer | `message` |
| `api/projects/[id]/comments/route.ts` (customer, bulk) | Customer comments | All owner/admin/employee | `message` |
| `api/contact/route.ts` (bulk) | New public lead | All owner/admin | `system` |
| `api/webhooks/stripe/route.ts` | Payment succeeds | The customer | `payment` **— 🔴 invalid, see §7.1** |

### Display
`NotificationDropdown.tsx` (topbar bell, own local unread state, instant optimistic updates) and `/ilmoitukset` (full page, fixed this session to call `router.refresh()` after marking read so the sidebar badge count re-syncs — previously stale across client-side navigation).

## 7.5 Environment & Config

### Real tech stack — see [01-architecture.md §1.1](./01-architecture.md#11-tech-stack-from-packagejson) for the full table.

### Environment variables

`.env.example` (checked-in template) only documents Sanity vars + `RESEND_API_KEY` + `CONTACT_EMAIL`. The actual local `.env.local` additionally requires (names only): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_CRISP_WEBSITE_ID`.

> 🟡 **`.env.example` is significantly out of date.** It's missing Supabase, OpenAI, and Crisp entirely, and `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` weren't found in either file — Stripe config may live only in the Vercel dashboard rather than locally. **Anyone bootstrapping a fresh environment from `.env.example` alone would be missing the majority of what the app actually needs to run.** This should be fixed as part of onboarding hygiene — see [08-code-review-roadmap.md](./08-code-review-roadmap.md).
