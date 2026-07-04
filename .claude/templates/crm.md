# CRM Template

Read `.claude/templates/_foundations.md` first — this file only covers what's specific to a CRM (lead/contact lifecycle, pipelines, staff-facing operations). `apex-site`'s own `/crm` module (lead → customer → quote → project → invoice) is a live reference implementation of this exact pattern — see `apex-site/docs/06-crm-lifecycle.md`.

## Recommended architecture

- Staff-only surface (or staff + limited customer self-service view) — branch on `isStaff`/`isAdmin`, per foundations; don't build a separate CRM app.
- Model the CRM as a **linear lifecycle with stage transitions**, not a bag of loosely related tables: each stage (lead, qualified, quote/proposal, won, active account) is its own table or a status column with a clear, enumerated transition graph.
- Every transition (stage change, assignment, note added) is an activity-log event — the CRM's core value is the audit trail, not just current state.

## Folder structure

```
src/app/(dashboard)/crm/
├── page.tsx              pipeline/list view (staff sees all, filtered by stage/owner)
├── [id]/page.tsx          contact/lead detail — timeline, notes, associated quotes/projects
├── new/page.tsx           manual lead creation (staff)
src/app/api/
├── contact/               public lead-intake endpoint (POST from marketing site forms)
├── crm/[id]/              stage transitions, assignment, notes (mutations)
src/lib/
├── activityLog.ts         typed, try/catch-wrapped — canonical logger, prefer over any duplicate
```

## Tech stack additions

- No new libraries typically required beyond the baseline — a CRM is primarily a data-modeling and workflow problem, not a new-dependency problem. Resist adding a pipeline/kanban library unless the drag-and-drop UX genuinely requires it; a filtered list grouped by stage often suffices.

## Database design

Core tables:
- `customers` (or `contacts`/`leads`) — one row per person/organization in the pipeline, with a `stage` enum or FK to a `stages` table.
- `[stage]_history` or a generic `activity_logs` — every transition, note, and assignment change, timestamped and attributed to a staff user.
- `quotes`/`deals` — proposals tied to a customer, with their own status (`draft`/`sent`/`accepted`/`rejected`).
- `tasks` — follow-ups tied to a customer/deal, with an owner and due date.

RLS: staff roles need broad read/write (all customers); if any customer-facing self-service view exists (e.g., viewing their own quote), that customer must be scoped to only their own row — two different policies on the same table, not one loose policy for everyone. Use `/database`.

## Authentication

Per foundations. CRM data is staff-facing by default — the default-deny posture matters more here than in a pure customer-self-service product, since a leak exposes every lead/customer's data to every logged-in user, not just cross-tenant. Explicitly verify: a non-staff logged-in user (if the product has any non-staff logins at all) cannot list or read other customers' CRM records.

## API structure

- `POST /api/contact` — public, unauthenticated lead intake (rate-limit and validate hard; this is the one CRM endpoint the public can hit).
- `PATCH /api/crm/[id]/stage` — staff-only stage transition; logs to `activity_logs`.
- `POST /api/crm/[id]/notes` — staff-only note addition.
- `PATCH /api/crm/[id]/assign` — staff-only owner reassignment.

Design each with `/api`; all are staff-authorization-critical, so pair with `/security` before shipping.

## UI components

- Pipeline/list view: filterable by stage, owner, date range; staff sees all records by default.
- Detail view: contact info, full activity timeline (chronological, not just "last updated"), associated quotes/tasks, inline stage-transition control.
- Quick actions: add note, change stage, assign owner — should not require a full page navigation for the common case.
- Search (staff command palette or dedicated search) if the pipeline grows beyond what fits on one filtered page.

## Security checklist

Per foundations, plus:
- [ ] Every CRM read/write route checks `isStaff` (or the correct narrower role) server-side — not just hidden client-side.
- [ ] Public lead-intake endpoint validates and rate-limits input; it's the one route an unauthenticated attacker can reach.
- [ ] No route accepts a customer/lead ID from the client without verifying the caller's authorization to view/modify that specific record (IDOR check).
- [ ] Run `/security` before shipping any new CRM mutation route.

## Performance checklist

Per foundations, plus:
- [ ] Pipeline/list view is bounded (pagination or a hard cap) — this project's existing convention caps unpaginated list fetches at ~100–500 rows; don't silently exceed that as the pipeline grows.
- [ ] Activity timeline queries are indexed on `(customer_id, created_at)`.
- [ ] Run `/performance` once the pipeline is expected to exceed a few hundred active records.

## Deployment checklist

Run `/deploy`, plus confirm:
- [ ] Public lead-intake endpoint is reachable and tested from the actual marketing site forms (not just staff-side CRM UI).
- [ ] Email notifications (new lead alerts to staff, if present) are configured and tested against the real provider (e.g., Resend).

## Development phases

1. **Lead capture**: public intake endpoint, `customers`/`leads` table, RLS (staff-read-all). → `/database`, `/api`
2. **Pipeline view**: staff list + detail pages, stage transitions, activity log. → `/feature`, `/frontend`
3. **Workflow**: notes, assignment, tasks/follow-ups, email notifications on key transitions.
4. **Conversion**: quote/deal generation, acceptance flow, handoff to whatever the "won" state creates (project, subscription, order).
5. **Hardening**: `/security` (staff-authorization is the highest-risk surface here), `/performance`, `/deploy`.

## Best practices

- Model stage transitions explicitly (enum + transition rules), don't let "status" become a free-text field different engineers set inconsistently.
- Every transition is logged — the activity trail is the product's core value, not incidental.
- Default-deny for CRM data: staff-only unless a specific record is explicitly customer-visible.
- Reuse the existing `activityLog.ts` pattern rather than introducing a second logging helper.
