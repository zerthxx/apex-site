# SaaS Platform Template

Read `.claude/templates/_foundations.md` first — this file only covers what's specific to a multi-tenant SaaS product (customer + staff dashboard, subscriptions/invoicing, lifecycle data). This workspace's own `apex-site` app *is* a live example of this archetype — use it as the reference implementation, not just a spec.

## Recommended architecture

- Single Next.js monolith, role-branched route tree (per foundations) — resist the urge to split into a separate customer app and staff app; branch on `isStaff`/`isAdmin` instead.
- Postgres RLS is the tenancy boundary: every tenant-scoped table filters by `auth.uid()` (or an owning `customer_id`/`organization_id`) in its policy, not in application code alone.
- Linear business data flow, each stage its own table: lead → customer → subscription/quote → active account/project → usage/invoice → payment (via Stripe).
- Background/webhook processing (Stripe events, scheduled billing) lives in `src/app/api/webhooks/*`, verified and idempotent.

## Folder structure

```
src/app/
├── (marketing)/        pricing, features, blog, signup — unauthenticated
├── (dashboard)/         the product itself
│   ├── dashboard/       home/overview
│   ├── [core-feature]/  the thing customers actually pay for
│   ├── asetukset/       account/billing settings
│   └── admin/           staff-only: tenant management, plan overrides
├── api/
│   ├── webhooks/stripe/ subscription lifecycle events
│   ├── billing/         checkout session, portal session creation
│   └── [feature]/       mutation endpoints for the core feature
```

## Tech stack additions

- Stripe **Subscriptions** (not just one-off Checkout) + Customer Portal for self-serve plan management.
- A `plans`/`subscriptions` table pair as the source of truth for entitlements — never gate features on a Stripe API call at request time; sync Stripe state into Postgres via webhook and read from there.

## Database design

Core tables (adapt names to the product):
- `customers` — one row per tenant/account; holds Stripe customer ID.
- `subscriptions` — plan, status (`trialing`/`active`/`past_due`/`canceled`), current period end, synced from Stripe webhooks.
- `[core_entity]` — whatever the product's primary object is (projects, sites, campaigns...), owned by `customer_id`.
- `invoices` — synced from Stripe, linked to `customers`.
- `activity_logs` — every meaningful mutation, for support/debugging and audit.
- `usage_events` (if usage-based billing) — append-only, aggregated on read, never mutated after insert.

Every one of these needs an RLS policy scoping reads/writes to the owning tenant, plus a staff-bypass policy for `isStaff`. Use `/database` to design and migrate these.

## Authentication

Per foundations, plus:
- Plan/entitlement checks are a *second* gate after auth — "logged in" and "has an active subscription for this feature" are different checks; don't conflate them.
- Staff impersonation of a customer account (common support need) must be explicitly logged in `activity_logs`, never silent.

## API structure

- `POST /api/billing/checkout` — create a Stripe Checkout session for a plan.
- `POST /api/billing/portal` — create a Stripe Customer Portal session.
- `POST /api/webhooks/stripe` — handle `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.paid/payment_failed`; verify signature; upsert `subscriptions`/`invoices` idempotently.
- `[feature]` CRUD routes — only for mutations the RLS-scoped client can't do directly, or that need service-role/cross-tenant logic (e.g., admin overrides).

Use `/api` per endpoint; this is exactly `backend-engineer`'s scope.

## UI components

- Plan/pricing comparison table, billing settings page (current plan, upcoming invoice, payment method, cancel/upgrade), usage meter if usage-based.
- Empty states for a brand-new tenant (no data yet) and a churned/past-due tenant (feature-gated, clear upgrade path) — both are common real states, not edge cases.
- Staff-only tenant list/detail view, gated on `isStaff`.

## Security checklist

Per foundations, plus:
- [ ] RLS policy verified per tenant table — test as two different customer accounts, confirm zero cross-tenant visibility.
- [ ] Stripe webhook signature verification is present and tested against a tampered payload.
- [ ] Plan/entitlement checks happen server-side, not just hidden in the UI.
- [ ] Staff impersonation (if present) is logged and cannot be triggered by a non-staff caller.
- [ ] Run `/security` before shipping billing changes.

## Performance checklist

Per foundations, plus:
- [ ] Dashboard home/overview queries are bounded (no full-table scans as tenant data grows).
- [ ] Usage aggregation (if present) is indexed on `(customer_id, created_at)` or computed incrementally, not recomputed from all-time raw events on every page load.
- [ ] Run `/performance` before shipping any new dashboard list/report view.

## Deployment checklist

Run `/deploy`, plus confirm:
- [ ] Stripe webhook endpoint is registered in the Stripe dashboard for the deployed URL, in both test and live mode.
- [ ] All pending migrations (tenant tables + RLS) are applied to the live database.
- [ ] Billing-critical env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price/plan IDs) are set for the target environment.

## Development phases

1. **Foundation**: auth, base tenant model (`customers`), staff/admin role branch, empty dashboard shell. → `/feature`
2. **Core value**: the product's primary entity and workflow (`[core_entity]` CRUD, the thing customers pay for). → `/feature`, `/database`, `/api`, `/frontend`
3. **Monetization**: plans, Stripe Checkout + webhooks, billing settings, entitlement gating. → `/feature` (this is the highest-risk phase — gate carefully)
4. **Operability**: activity logging, staff admin views, support tooling.
5. **Hardening**: `/security`, `/performance`, `/deploy` before public launch.

## Best practices

- Sync Stripe state into Postgres via webhook; never make the request-hot-path depend on a live Stripe API call for entitlement checks.
- Keep one route tree — a "staff mode" toggle/branch, not a second app.
- Every new tenant table ships with its RLS policy in the same change, per foundations.
- Treat webhook idempotency as required, not optional — Stripe retries and can deliver the same event twice.
