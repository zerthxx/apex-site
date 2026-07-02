# 1. Overall Architecture

## 1.1 Tech stack (from `package.json`)

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | `16.2.9` — a pre-release/altered API surface; `AGENTS.md` explicitly warns to consult `node_modules/next/dist/docs/` before writing code, don't assume standard Next.js 15 conventions hold |
| UI runtime | React / React DOM | `19.2.4` |
| Database + Auth + Storage | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | `^2.108.2` / `^0.12.0` |
| Payments | Stripe SDK | `^22.3.0` |
| CMS (marketing site content) | Sanity (`@sanity/client`, `next-sanity`, `sanity` studio) | `^7.x` / `^13.1.1` / `^6.2.0` |
| Transactional email | Resend | `^6.14.0` |
| Styling | Tailwind CSS v4 + `tailwind-merge` + `clsx` | `^4` |
| Icons | `lucide-react` | `^1.21.0` |
| Animation | `framer-motion` | `^12.41.0` |
| Forms/validation | `react-hook-form` + `@hookform/resolvers` + `zod` | `^7.80` / `^5.4` / `^4.4` |
| Misc | `@vercel/og` (OG image generation), `@vercel/speed-insights` | |
| AI | OpenAI `gpt-4o-mini` via **raw `fetch`**, not the `openai` npm SDK (it isn't a dependency) | |

**No ORM.** All database access is the Supabase JS client calling PostgREST directly (`.from("table").select(...)`) — there is no Prisma/Drizzle schema file anywhere. The SQL migration files under `supabase/migrations/` are the only source of truth for the schema, and they are hand-written, not generated.

## 1.2 Folder structure

```
apex-site/
├── src/
│   ├── app/
│   │   ├── (marketing)/        ← public site: hinnoittelu, palvelut, portfolio, blogi, ukk, kirjaudu, ...
│   │   ├── (dashboard)/        ← THE app: auth-gated, role-branching. See docs/05.
│   │   │   ├── dashboard/          /dashboard — home
│   │   │   ├── crm/                /crm/asiakkaat, /crm/yritykset — staff-only CRM
│   │   │   ├── portaali/           /portaali/* — customer portal (also used by staff)
│   │   │   ├── admin/              /admin/* — owner/admin-only control panel
│   │   │   ├── asetukset/          /asetukset/* — account settings (shared layout, 6 tabs)
│   │   │   ├── tehtavat/           /tehtavat — staff task Kanban
│   │   │   ├── kalenteri/          /kalenteri — staff calendar
│   │   │   ├── ilmoitukset/        /ilmoitukset — notification inbox
│   │   │   ├── istunnot/           /istunnot — active session management
│   │   │   └── layout.tsx          shared auth guard + role fetch + customer auto-link + Sidebar/Topbar shell
│   │   ├── (asiakas)/asetukset/ ← LEGACY route, now just `redirect("/asetukset/profiili")`. Kept so old bookmarks/links don't 404.
│   │   ├── api/                 ← all backend logic that isn't a direct Supabase query from a Server Component. See docs/04.
│   │   ├── auth/callback/       ← OAuth/magic-link redirect handler
│   │   └── studio/[[...tool]]/  ← embedded Sanity Studio (CMS admin UI) at /studio
│   ├── components/
│   │   ├── dashboard/           ← Sidebar, Topbar, DashboardShell, ActivityFeed, NotificationDropdown, StatCard, UserTable, RoleBadge, SidebarLink
│   │   ├── layout/               ← marketing site Header/Footer
│   │   ├── sections/             ← marketing site page sections
│   │   ├── shared/                ← cross-cutting UI (e.g. SearchBar)
│   │   ├── providers/            ← context providers
│   │   └── ui/                   ← AuthModal, ChatBot, CrispChat, ProfileModal, IntroOverlay, generic primitives
│   ├── lib/
│   │   ├── supabase/             ← client.ts (browser), server.ts (cookie-bound RLS client), admin.ts (service-role client), activityLog.ts
│   │   ├── chat/                 ← knowledge.ts (static company knowledge base), buildSystemPrompt.ts
│   │   ├── sanity/                ← Sanity client config
│   │   ├── schemas/               ← Zod validation schemas (e.g. contact form)
│   │   ├── activity.ts            ← generic logActivity() helper
│   │   ├── stripe.ts              ← Stripe SDK client singleton
│   │   ├── constants.ts, types.ts, utils.ts, animations.ts
│   ├── middleware.ts             ← Supabase session-cookie refresh ONLY — no route protection (see docs/03)
├── supabase/migrations/          ← 9 hand-written .sql files, MUST be run manually in Supabase SQL Editor (see docs/02)
├── AGENTS.md / CLAUDE.md         ← warns this Next.js build has non-standard behavior; read node_modules/next/dist/docs before writing code
```

### Two-audience route split: `(marketing)` vs `(dashboard)`

Next.js route groups (parenthesized folders) don't affect the URL — they're purely organizational. This app uses exactly two, and the split is deliberate:

- **`(marketing)`** — the public, unauthenticated website (pricing, services, portfolio, blog, contact, login page). No Supabase session required. This is also where the Sanity-backed content lives (case studies, blog posts) and where the `ChatBot`/`CrispChat` sales-assistant widget is mounted.
- **`(dashboard)`** — everything behind a login: staff tools (CRM, admin panel, tasks, calendar) and the customer self-service portal, sharing **the same route tree** (`/portaali/*`) with content branching by role rather than having separate staff/customer URL spaces. This is the single biggest architectural decision in the app — see §1.4 below.

## 1.3 Request flow

There is no separate backend service. Two request shapes exist:

**A. Server-rendered page load** (the majority of the app):
```
Browser → Next.js Server Component (page.tsx)
            → createClient() [cookie-bound Supabase client]
            → supabase.auth.getUser()   (reads the session cookie, no network round-trip to re-auth)
            → direct .from("table").select(...) query, RLS-enforced by Postgres itself
            → HTML rendered server-side and streamed to the browser
```
The server component *is* the authorization boundary for reads in most cases — if RLS allows the query, the data comes back; if not, it silently returns zero rows (this is why several of the bugs fixed earlier in this project manifested as "empty page," not an error).

**B. Client-side mutation** (anything triggered by a button click — create/update/delete, file upload, Stripe checkout):
```
Browser (Client Component, "use client")
   → fetch("/api/...", { method: "POST"/"PATCH"/"DELETE" })
        → route.ts: createClient() [same cookie-bound client] → supabase.auth.getUser()
        → manual role check against `profiles.role` (NOT delegated to RLS alone — see docs/03 §"defense in depth")
        → DB write, either through the regular RLS-bound client or createAdminClient() (service-role, bypasses RLS) when the operation legitimately needs to act outside the caller's own RLS scope (e.g. notifying a different user, looking up another user's auth metadata, writing to a private storage bucket)
   ← JSON response
   → client component merges the result into local React state (no global state manager — see §1.5)
```

## 1.4 Design pattern: one route tree, role-branched content

Instead of `/staff/projects` and `/customer/projects` as separate trees, this app has **one** `/portaali/projektit` page whose `page.tsx` server component does:

```ts
const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");
// then queries either ALL projects (staff) or only the customer's own (via customers.user_id)
```//
...and passes `isStaff` (and often a stricter `canModerate` = owner/admin-only) down to the client component, which conditionally renders columns/buttons/modals.

**Why this matters architecturally:** it means the customer portal and the staff-facing project/quote/invoice management tool are *literally the same code*, not two parallel implementations that could drift apart. The cost is that every list/detail page has to carry two authorization checks — one implicit (RLS decides what rows come back) and one explicit (`isStaff`/`canModerate` decides what UI renders) — and if those two ever disagree (e.g. a UI check allows something RLS blocks), the failure mode is a silently-broken button, not a clear error. That exact failure mode is what caused the "Hyväksy button does nothing" and "poistetut tarjoukset eivät näy" issues fixed earlier in this project: the UI was ready, but the RLS policy didn't exist yet.

## 1.5 Other recurring patterns

- **No global client state manager.** Every list page fetches its full dataset once (capped at 100–500 rows) in the server component, then does search/filter **client-side** with `Array.filter`. There is no pagination API, no server-side search endpoint for these lists (the one exception is `/api/search`, the staff command-palette global search). This is simple and fast at current data volumes, but will not scale past a few hundred rows per table without becoming a real problem — see [08-code-review-roadmap.md](./08-code-review-roadmap.md).
- **"Optimistic-ish" mutations.** Most create/edit flows call the API, `await` the JSON response, then merge the returned object into local state — not true optimistic UI (updating before the server confirms). Two exceptions: the task Kanban board advances a card's column locally before the PATCH resolves, and notification read-marking updates the bell/badge instantly.
- **Consistent staff/admin naming:** `isStaff` = owner **or** admin **or** employee (day-to-day CRUD). `canModerate` / `isAdmin` = owner **or** admin only (delete/moderate/system-settings actions). This convention is used identically in nearly every page and API route — once you know it, you can predict the authorization behavior of new code without reading it.
- **Two parallel `logActivity()` helpers** exist (`src/lib/activity.ts` and `src/lib/supabase/activityLog.ts`) with different type-safety and error-handling — both write to the same `activity_logs` table. Not a deliberate pattern, more likely organic duplication — flagged in [08-code-review-roadmap.md](./08-code-review-roadmap.md).
- **`middleware.ts` does *not* protect routes.** It exists solely to refresh the Supabase session cookie on every request (`supabase.auth.getUser()` inside the SSR client triggers a token refresh if needed, and the middleware re-writes the refreshed cookies onto the response). All route protection — "redirect to `/` if not logged in," "redirect to `/dashboard` if not staff" — is implemented **per-page**, repeated in every `page.tsx`. See [03-authentication-security.md](./03-authentication-security.md) for the full implication of this.
