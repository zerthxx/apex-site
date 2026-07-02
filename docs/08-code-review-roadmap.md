# 8. Code Review & Roadmap

## 8.1 What's genuinely excellent

**The role-based RLS model is sound in shape, even where individual policies are incomplete.** Three consistent, well-chosen patterns ("staff," "own record," "customer via join" — see [02-database.md §2.4](./02-database.md#24-cross-cutting-rls-pattern-summary)) cover every table. This is the right way to build a Postgres-backed multi-tenant-ish app — authorization lives in the database, not just in application code, so even a route with a forgotten check usually fails safe (returns zero rows) rather than fails open. The one place this broke down (`GET /api/projects/[id]/comments`, [03-authentication-security.md §3.9.A](./03-authentication-security.md)) broke down specifically *because* it used the service-role client and bypassed this model — which is itself evidence the model works when followed.

**The single-route-tree, role-branched portal** ([01-architecture.md §1.4](./01-architecture.md#14-design-pattern-one-route-tree-role-branched-content)) is a genuinely good call for a business this size. Staff and customers seeing the same `/portaali/projektit/{id}` page, with content branching by role, means the two experiences structurally cannot drift apart the way two parallel implementations would.

**The quote-acceptance cascade** (auto-creating a project, notifying the right people, being idempotent on `quote_id`) is exactly the right amount of automation for this business — it removes a manual step without hiding what happened (both the customer and staff get notified, and an activity log entry exists).

**The staged-collection CRM design** (accept the lead before you know their company name, backfill logo/details later via file requests and comments) matches how this business actually operates, per the earlier conversation in this project — this isn't accidental permissiveness, it's a deliberate design decision that pays off.

**Consistent Finnish-first UX with sensible defaults** — error messages, status labels, date formatting all correctly localized (`toLocaleDateString("fi-FI")`), and the `quote_items.vat_pct DEFAULT 24` (the actual Finnish VAT rate) shows real domain modeling, not a generic template.

## 8.2 What should be improved, in priority order

### Fix now (real bugs/vulnerabilities with user-facing impact)

1. **`GET /api/projects/[id]/comments` IDOR** ([03 §3.9.A](./03-authentication-security.md)) — any authenticated user can read any project's comment thread. Add the same ownership check the `POST` handler in the same file already has.
2. **Stripe webhook notification schema mismatch** ([07 §7.1](./07-payments-ai-notifications.md)) — payment-confirmation notifications silently fail (`title`/`message`/`link` instead of `title`/`body`/`href`, invalid `type: "payment"`). Fix the column names and add `'payment'` to the `notifications.type` CHECK constraint via a new migration, or reuse `'invoice'`.
3. **`payments` table shape bug** ([02 §2.1 "payments"](./02-database.md)) — migration `005`'s Stripe-ready columns likely never applied over `003`'s table if run in order. Write `ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS ...` for every 005 column and check whether `customer_own_payments` RLS currently errors.
4. **`otp_codes` table missing from migrations** ([03 §3.2](./03-authentication-security.md)) — signup/login would break on a fresh DB rebuild. Write `010_otp_codes.sql` from the live schema.
5. **`user_sessions` never populated** ([03 §3.6](./03-authentication-security.md)) — the entire "Active Sessions" feature (table, RLS, API, UI) exists but nothing inserts a row. Either wire it up (insert at OTP-verify and OAuth-callback success) or remove the dead UI until it is.
6. **No password-reset flow** ([03 §3.5](./03-authentication-security.md)) — a logged-out user who forgets their password has no self-service recovery path at all. This is a basic SaaS feature gap, not an edge case.

### Fix soon (correctness/consistency, lower urgency)

7. **Manual-only migrations** ([02](./02-database.md), [03](./03-authentication-security.md)) — the biggest structural risk in the project. Every customer-facing feature so far (migrations 004, 006, 007, 008, 009) has had to retrofit an RLS policy that was missing at ship time, and this will keep happening for any new customer-visible table (`quote_items`, `milestones`, `tasks`, `calendar_events`, `time_entries` currently have zero customer access). At minimum, keep a "migrations applied" checklist next to the SQL files; ideally, move to `supabase db push` against a linked project so repo state and DB state can't silently diverge.
8. **No centralized `isStaff()`/`isAdmin()` helper** ([03 §3.7](./03-authentication-security.md)) — the same role-check array is copy-pasted in ~40 files. Extract `src/lib/auth.ts`.
9. **Two parallel `logActivity()` implementations** ([07 §7.3](./07-payments-ai-notifications.md)) — pick one (the typed, try/catch-wrapped `activityLog.ts` is the better base), migrate all call sites, delete the other.
10. **`.env.example` badly out of date** ([07 §7.5](./07-payments-ai-notifications.md)) — missing Supabase, OpenAI, Crisp, and possibly Stripe env vars entirely. A new developer bootstrapping from this file alone would be stuck immediately.
11. **`conversation_participants` orphaned `conversation_id_fk` column** ([02 §2.1](./02-database.md)) — a migration-authoring mistake left two columns meaning "which conversation." Consolidate.
12. **`system_settings.support_email` seed inconsistency** ([02 §2.1](./02-database.md)) — `ON CONFLICT DO NOTHING` means the wrong value has silently won since migration 004; needs a direct `UPDATE`.
13. **Invoice numbering not scoped per month** ([04](./04-api-reference.md)) — `INV-YYYYMM-NNN` where `NNN` counts *all* invoices ever, not just the current month's, despite the format implying a monthly reset.
14. **Client-side-only pagination/search on every list page** ([05 §5.8](./05-dashboard-portal-admin.md)) — fine today at low row counts (capped 100–500), will degrade as the business grows. Worth a server-side search/pagination pass before customer or project counts get into the low thousands.

### Worth doing eventually (polish/scaling)

15. `/admin/laskutus` totals computed from only the 10 most recent invoices — misleading if used for real financial reporting; should aggregate properly like `/admin/maksut` does.
16. `/kalenteri` month navigation doesn't re-fetch — switching months shows empty data unless it happens to already be loaded.
17. `EVENT_LABELS`/`EVENT_ICONS` in `ActivityFeed` only cover the original auth event set — most business-object events show as raw snake_case strings with a generic icon in the admin activity log.
18. In-memory rate limiters (`contact`, `otp/send`) don't survive server restarts or scale across serverless instances — fine for current traffic, won't be once the app is under real load or deployed multi-region.

## 8.3 Implemented vs. planned

### Fully implemented and working
Auth (email/password + custom OTP, Google OAuth), role-based access control (4 roles), CRM (customers/companies), quotes (with self-service accept/reject as of this session), projects (with comments, files, tasks, progress tracking), invoices, Stripe payments (checkout + webhook + refunds), file requests, notifications, activity logging, admin panel (users/settings/templates/analytics), AI sales chatbot with live-chat handoff, Sanity-backed marketing site (blog/portfolio) with ISR revalidation.

### Built (schema + RLS) but with no UI/API yet — migration 003's explicit "future foundation"
`customer_timeline`, `customer_notes`, `tags`/`customer_tags`, `milestones`, `time_entries`, `teams`/`team_members`, `leave_requests`, `integration_configs`, `webhooks`/`webhook_deliveries`, `organizations`, `subscriptions`, `audit_reports`, `conversations`/`messages` (direct messaging, separate from project comments), `quote_items` (line-item quotes — the `quotes.amount` field is used as a single total everywhere the app actually renders a quote, `quote_items` isn't surfaced anywhere in the UI yet).

### Explicitly not built
Password reset self-service, session tracking (built but non-functional — see above), RAG/vector search for the AI assistant (explicitly deferred per a code comment), true multi-tenant organization support (the `organizations` table has no membership join table and its RLS doesn't actually check org membership), server-side pagination/search for list pages beyond the global command palette.

## 8.4 If you're picking up this codebase — where to start

1. Read [01](./01-architecture.md) → [02](./02-database.md) → [03](./03-authentication-security.md) in that order; they build on each other.
2. Fix the IDOR in `projects/[id]/comments` before anything else — it's a live vulnerability, not a hypothetical one.
3. Before adding *any* new customer-facing feature, ask: "does this need a new RLS policy?" The answer has been yes for nearly every customer-facing feature shipped so far (§8.2 item 7) — write the migration in the same PR as the feature, and actually run it in Supabase before calling the feature done. This project has already shipped UI for a feature that silently did nothing twice in one session because the migration lagged behind the code.
