# Shared Foundations

Common baseline referenced by every template in `.claude/templates/`. Each archetype template (`saas.md`, `crm.md`, etc.) states only what's *different or additional* for that archetype — read this file first so those deltas make sense.

This baseline reflects what's actually installed and working in this workspace (`apex-site/`), not a generic recommendation — new projects built with these templates should match it unless there's a specific reason to diverge.

## Baseline tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, `--webpack`) | Server Components by default; see `apex-site/AGENTS.md` before assuming standard Next 15 conventions — this is a pre-release version |
| UI runtime | React 19 | |
| Backend | Supabase (Postgres + Auth + Storage) | No separate API server, no ORM — Postgres RLS is the real authorization layer |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) + `clsx` + `tailwind-merge` | |
| Forms/validation | `react-hook-form` + `@hookform/resolvers` + `zod` | Same Zod schemas should validate both client-side forms and server-side input |
| Payments | Stripe (`stripe` + Checkout + webhooks) | |
| Email | Resend | |
| CMS (if any content is editorial) | Sanity (`sanity`, `next-sanity`) mounted at `/studio` | Use for blog/case-study/marketing content, not transactional app data |
| Animation | Framer Motion | |
| Icons | `lucide-react` | |
| Observability | `@vercel/speed-insights` | |
| OG images | `@vercel/og` | |
| Language | TypeScript, strict | |
| Lint | ESLint 9 (`eslint-config-next`) | |
| Hosting | Vercel | |

Don't introduce a second library for something this list already covers (a second form library, a second animation library, a second styling approach) without an explicit reason — flag it instead.

## Architecture pattern

One route tree, role-branched — not parallel trees per role. Every page is a Server Component querying Supabase directly with the visitor's cookie-scoped session; `src/app/api/` route handlers exist only for client-triggered mutations or anything needing service-role privileges. `middleware.ts` only refreshes the session cookie — it does not gate routes. Every page/layout that needs an auth check performs it itself.

```
src/
├── app/
│   ├── (marketing)/   public, unauthenticated routes
│   ├── (dashboard)/   auth-gated app — layout.tsx is the sole base auth-guard choke point
│   ├── api/           route handlers for mutations / service-role operations
│   ├── auth/callback/ OAuth/magic-link redirect handler
│   └── studio/        embedded Sanity Studio, if editorial content exists
├── components/{dashboard,layout,sections,shared,providers,ui}/
├── lib/
│   ├── supabase/      client.ts (browser), server.ts (cookie-bound RLS client), admin.ts (service-role, bypasses RLS)
│   ├── schemas/        Zod schemas shared by client forms and server validation
│   └── constants.ts, types.ts, utils.ts
supabase/migrations/    hand-written, sequentially numbered .sql — manual-apply only (see below)
```

## Authentication baseline

- Supabase Auth (email/password + OAuth as needed).
- Treat every login as effectively 2FA where the product warrants it: password check, then an OTP code emailed via Resend — not Supabase's built-in confirmation flow. OAuth can skip OTP.
- Role convention: `isStaff` = owner|admin|employee (or the archetype's equivalent internal-user roles). `isAdmin`/`canModerate` = owner|admin only. Keep this convention consistent everywhere rather than inventing per-feature role checks.
- There is no framework-level route guard — every gated page/route must check auth itself. Don't assume `middleware.ts` protects anything beyond refreshing the session cookie.
- No password-reset flow ships by default — build one explicitly if the product needs it; don't assume it exists.

## Migration discipline (critical — read this)

Migrations are **manual-apply only** unless a project explicitly wires up CI/CD or the Supabase CLI push. Writing a `.sql` file has zero effect on the live database until someone runs it in the Supabase SQL Editor. Every schema change must:
1. Ship as a new, sequentially numbered migration file.
2. Include the RLS policy for any new/changed user-scoped table in the *same* migration.
3. Be called out explicitly to whoever is deploying: "run migration `NNN` in the Supabase SQL Editor before this ships."

Never use `CREATE TABLE IF NOT EXISTS` to "update" a table that may already exist with a different shape — it's a silent no-op. Use `ALTER TABLE`.

## Command → agent mapping

Use the existing `.claude/commands/*` and `.claude/agents/*` rather than improvising a workflow:

| Need | Command | Subagent(s) |
|---|---|---|
| New feature end-to-end | `/feature` | `software-architect` → `database-engineer`/`backend-engineer` → `frontend-engineer` → `qa-engineer` → `code-reviewer` |
| Bug fix | `/bugfix` | `backend-engineer`/`frontend-engineer`/`database-engineer` → `code-reviewer` → `qa-engineer` |
| Restructure without behavior change | `/refactor` | `software-architect` (if large) → engineer(s) → `qa-engineer` → `code-reviewer` |
| Schema/migration/RLS | `/database` | `database-engineer` |
| API endpoint design/impl | `/api` | `backend-engineer` |
| UI work | `/frontend` | `frontend-engineer` |
| Server-side logic | `/backend` | `backend-engineer` |
| General code review | `/review` | `code-reviewer` |
| Deep security audit | `/security` | `code-reviewer` |
| Deep performance audit | `/performance` | `code-reviewer` (+ `database-engineer` for query-heavy scope) |
| Test planning/execution | `/qa` | `qa-engineer` |
| Pre-ship checklist | `/deploy` | `code-reviewer` |

For any change with meaningful blast radius (new feature, schema change, cross-module refactor), apply the plan-gate pattern in `.claude/shared/plan-gate.md`: present the plan, wait for explicit approval, then implement.

## Baseline security checklist

- RLS policy exists and is correct for every table holding tenant/user-scoped data.
- Every gated page/route performs its own auth check (no reliance on `middleware.ts`).
- Server-side validation (Zod) on all external input, regardless of client-side validation already in place.
- No IDOR: every lookup by ID verifies the caller owns or is authorized to see that row.
- Secrets never sent to the client bundle; service-role client (`admin.ts`) never imported into client components.
- Stripe (or any payment) webhooks verify signatures and are idempotent.
- Run `/security` before shipping anything touching auth, payments, or user data.

## Baseline performance checklist

- Server Components fetch data directly; `"use client"` scope kept as small as possible.
- No unbounded queries against a table expected to grow — paginate or cap.
- Indexes match real query patterns (foreign keys, filter/sort columns).
- No N+1 query patterns — prefer joins/set-based queries.
- Run `/performance` before shipping anything with a new list view or new query pattern.

## Baseline deployment checklist

Use `/deploy` — it already runs: env var audit, `npm run build`, `npm run lint`, `npx tsc --noEmit`, a security pass, and a performance pass, then produces a pass/warning/blocker checklist plus any manual steps (pending migrations, new env vars).

## Best practices (apply across every archetype)

- Read `apex-site/docs/` (or the equivalent hand-written technical reference for a new project) before making a non-trivial change — treat it as the source of truth over assumptions.
- Don't fork role-based features into parallel route trees; branch existing pages on role instead.
- Don't add a second helper for something the codebase already solved one way (e.g., two competing activity-logging functions) — reuse or consolidate, don't duplicate.
- Match existing UI copy language/tone/formatting conventions for the project (this workspace's convention is Finnish, `toLocaleDateString("fi-FI")`) — don't silently switch locale or tone.
- No speculative abstractions or feature flags for scenarios not yet requested.
- Every schema change ships with its RLS policy and its manual-apply instruction — never treat either as a follow-up.
