# 3. Authentication & Security

> ## 🔴 Read this first — a real, currently-live vulnerability was found while writing this doc
> **`GET /api/projects/[id]/comments`** (`src/app/api/projects/[id]/comments/route.ts`) uses the **service-role admin client** (bypasses RLS) and takes `project_id` straight from the URL with **no ownership or role check at all**. Any authenticated user — including a plain `customer` account — can read any other project's internal comment thread, including staff/customer names and emails resolved via `auth.admin.getUserById`, just by changing the project UUID in the URL. The `POST` handler in the *same file* correctly checks staff-or-owns-project; the `GET` handler does not. **This should be fixed before continuing new feature work.** See §9.D for the fix shape.

## 3.1 Auth provider: Supabase Auth, three client factories

| Client | File | Key used | Bypasses RLS? | Used for |
|---|---|---|---|---|
| Browser client | `src/lib/supabase/client.ts` | anon key | No | `"use client"` components (AuthModal, ProfileModal, Sidebar, settings pages) |
| Server client | `src/lib/supabase/server.ts` | anon key, cookie-bound | No | Server Components, Route Handlers — the workhorse, `await createClient()` → `supabase.auth.getUser()` |
| Admin client | `src/lib/supabase/admin.ts` | **service role key** | **Yes** | Listing all `auth.users`, Storage bucket access, cross-user profile lookups, notification inserts for other users |

`isSupabaseConfigured()` (exported from `client.ts`) guards against missing env vars by checking `NEXT_PUBLIC_SUPABASE_URL` starts with `http` — used throughout the app to no-op gracefully rather than crash.

Because the admin client bypasses RLS entirely, **every route that instantiates it is 100% responsible for its own authorization** — there is no database-level safety net if the application code forgets a check. This is exactly what went wrong in the comments-GET vulnerability above.

## 3.2 Registration flow (email + password + custom OTP)

Implemented in `src/components/ui/AuthModal.tsx`, backed by `POST /api/otp/send` and `POST /api/otp/verify`.

1. Client-side validation (password match, ≥8 chars, terms checkbox).
2. `supabase.auth.signUp({ email, password, options: { data: {...} } })` called **directly from the browser** — creates the `auth.users` row immediately, with `user_metadata` carrying `full_name`, `first_name`, `last_name`, `phone`, `address`, `postal_code`, `city`.
3. Client calls `POST /api/otp/send` — **this is a custom, app-level OTP system, not Supabase's built-in email confirmation.**
4. UI switches to a 6-digit code entry screen with a 60-second resend cooldown.
5. `POST /api/otp/verify` checks the code.
6. On success, client calls `supabase.auth.signInWithPassword(...)` — this is what actually establishes the session; `signUp()` alone doesn't sign the user in.
7. "Remember me" writes `localStorage.apex-remember` + `sessionStorage.apex-session` (see §3.6, `SessionGuard`).
8. Fire-and-forget `POST /api/activity` logs a `login` event.
9. Redirect to `/dashboard`.

**Sign-in also goes through OTP**: `handleSignIn` calls `signInWithPassword` first (to validate the password), immediately `signOut()`s, then re-triggers the same `/api/otp/send` → OTP-entry UI. So **every login, not just signup, is effectively 2-factor: password + a fresh 6-digit email code.** Google OAuth is the one path that skips this (§3.4).

### `/api/otp/send` internals
- Builds its own inline admin client (`createClient` from `@supabase/supabase-js` with the service-role key) — duplicated rather than reusing `src/lib/supabase/admin.ts`.
- In-memory `Map<email, timestamp>` rate limiter, 60s cooldown — **resets on server restart, doesn't share state across serverless instances.**
- Deletes any prior code for that email, inserts a new `otp_codes` row (`email, code, expires_at = now()+10min`).
- Sends the code via Resend as a styled HTML email.

### `/api/otp/verify` internals
- Looks up `otp_codes` where `email`, `code`, `used = false`, `expires_at > now()`; marks `used = true` on match.
- No rate limiting on verify attempts — brute-forceable within the 10-minute window in principle, though a 6-digit space (1,000,000 combos) and single-use consumption make this low-severity.

### 🔴 `otp_codes` is not in any migration file
A search across all 9 SQL migrations found **zero** references to `otp_codes`. This table's schema/indexes/RLS exist **only in the live Supabase database**, undocumented in the repo. If the DB were ever rebuilt from `supabase/migrations/*.sql` alone, **both signup and login would break immediately** (insert against a nonexistent table). This needs a migration `010_otp_codes.sql` written from the live schema and checked in.

## 3.3 Email verification / profile creation

The OTP step above **is** the email-verification mechanism — a custom one, not Supabase's native confirmation-link flow. Profile row creation happens via the `handle_new_user()` Postgres trigger (see [02-database.md §2.2](./02-database.md#22-functions-and-triggers)), which fires on every `auth.users` insert (both email/password and Google OAuth) and copies `first_name`/`last_name`/`phone` out of `raw_user_meta_data` into `profiles`. **`address`/`postal_code`/`city` are collected by the signup form but never copied into `profiles`** by this trigger — they remain only in `auth.users.user_metadata` unless a later update writes them elsewhere. `role` defaults to `'customer'` via the column default.

## 3.4 Google OAuth flow

`src/app/auth/callback/route.ts` (full logic already covered in earlier work this session, restated here for completeness):

1. Client: `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "${origin}/auth/callback" } })`.
2. Google redirects back with `?code=...`.
3. `exchangeCodeForSession(code)` establishes the session and sets cookies.
4. Logs `google_login` activity event.
5. **Profile completeness check**: `first_name && phone && address && postal_code && city` on `user_metadata`. Google never natively provides phone/address/postal/city, so **every first-time Google login redirects to `/?tiedot=1`**, where `ProfileModal.tsx` prompts for the missing fields and calls `supabase.auth.updateUser({ data: {...} })`.
6. Otherwise redirects to `/dashboard` (or a deep-linked `next` param).
7. Any exchange error → `/kirjaudu?error=auth`.

Google OAuth **entirely bypasses the OTP step** — trusted as sufficient verification since Google already confirmed the email.

## 3.5 Password reset & account recovery — built 2026-07 (Account Recovery & Verification System)

> The gap described in earlier versions of this section ("no forgot-password flow") was closed by the Account Recovery & Verification System. **Requires migration `015_account_security.sql` to be run manually in the Supabase SQL Editor BEFORE deploying the code** — the rate limiter fails closed, so without the migration even login-OTP sends refuse.

The system is fully custom (deliberately not Supabase's `resetPasswordForEmail`/email-change built-ins, to keep one branded code-based UX for email + SMS). Key pieces:

- **Shared libs** (`src/lib/`): `auth.ts` (`requireUser/requireStaff/requireAdmin` — the centralized role helper docs/08 asked for; new routes use it), `verification.ts` (unified `verification_codes` table: SHA-256-hashed 6-digit codes and 256-bit tokens, single-use via `used_at`, 5-attempt caps, timing-safe compare; replaces `otp_codes`), `rateLimit.ts` (Postgres `rate_limit_events`, durable, fails closed), `sms.ts` (Twilio via plain REST — env `TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM`; unset = SMS flows return "ei käytettävissä", email flows unaffected), `emails.ts` (shared branded templates; `/api/otp/send` renders through it), `securityNotify.ts` (email + SMS + in-app alerts with time/IP/device/geo, sent to the OLD contact before/with every sensitive change), `adminAudit.ts` (audit row is written BEFORE the action; action aborts if the write fails), `sessionRevocation.ts` (GoTrue `POST /auth/v1/admin/users/{id}/logout` — note: `auth.admin.signOut(jwt)` takes a JWT, so the old `signOut(userId, "global")` calls never worked), `reauth.ts` (password re-entry, or emailed code for Google-only accounts), `users.ts` (lookup by email / verified phone).
- **Verification**: `profiles.email_verified/phone_verified(+_at)` (migration backfills email_verified for existing users; login-OTP verify and the OAuth callback set it going forward). Phone verify at `/asetukset/turvallisuus` → `/api/account/phone/send-code|verify`; one verified phone per account (partial unique index). The migration-010 guard trigger now also auto-unverifies the phone if a user edits `profiles.phone` directly via REST.
- **Forgot password** (`/palauta-salasana` → `/api/recovery/password/start|verify|complete`): email or verified-phone channel, enumeration-safe generic responses, 6-digit code → single-use 15-min reset token → new password, then all sessions revoked + notifications.
- **Forgot email** (`/palauta-sahkoposti` → `/api/recovery/email/*`): verified phone + SMS code → masked current email → new email verified by code → replaced; old email gets a revert link. No usernames exist, so the verified phone is the recovery key. Lost phone → public ticket (`/api/recovery/request` → `recovery_requests` → `/admin/palautuspyynnot`).
- **Change email/phone** (`/api/account/email|phone/change/start|confirm`): re-auth required, code to the NEW contact, old value stays until confirmed, old contact warned at start and alerted at completion with a **7-day revert link** (`/peru-muutos` → `/api/recovery/revert`) that restores the old value, revokes all sessions and sets `force_password_reset`.
- **Change password** (`/api/account/password/change`): server-side now (policy enforced server-side too), optional "log out other devices" (`signOut({ scope: "others" })` on the caller's cookie client), clears `force_password_reset`.
- **Lock/suspend enforcement**: `(dashboard)/layout.tsx` now actually enforces `is_suspended`/`is_locked` per request (redirect via `/api/auth/force-logout` → `/tili-lukittu`), and `force_password_reset` blocks the dashboard UI (overlay in `DashboardShell`) until the password is changed.
- **Admin support tools** (`/admin/kayttajat/[id]` → `GET/PATCH /api/admin/users/[id]`): change email/phone, force password reset, lock/unlock, suspend/unsuspend — every action needs a reason, writes `admin_audit_logs` (admin/target ids + email snapshots, old/new value, IP, UA, optional support-ticket id + screenshot URL, approval fields reserved for future multi-admin sign-off) and notifies the user. Detail view shows verification status, sessions/devices, login history, masked recovery history, audit trail.
- **Sessions fixed**: `user_sessions` rows are now inserted at OTP-verify success and in the OAuth callback, so `/istunnot` and the admin devices view have data (previously always empty, §3.6).
- **Timeline & Security Score**: `/asetukset/turvallisuus` shows a 0–100 score (email verified / phone verified / password set / 2FA) and the account timeline from `activity_logs` (new event types incl. `failed_login`, logged server-side on failed OTP verifies). `user_mfa_factors` + `mfa_backup_codes` tables exist as schema prep for TOTP 2FA — no flows use them yet.

## 3.6 Sessions

`user_sessions` table (migration 001) + `/api/sessions` route (`GET` list, `DELETE` revoke one or all-others) + `/istunnot` UI — fully built end to end, **but dead**:

### 🔴 Nothing ever inserts into `user_sessions`
A repo-wide search found exactly three call sites for `user_sessions`: the sessions API (SELECT/UPDATE), the `/istunnot` page (SELECT), and the dashboard home page (SELECT COUNT). **No code path anywhere inserts a row.** In practice the "Active Sessions" page is very likely **always empty** in production — the UI, API, and RLS policy all exist, but the feature has no data source. This needs a hook at login time (OTP verify success, and the OAuth callback) that inserts a `user_sessions` row with a generated `session_token`, `device_hint` (parsed from `User-Agent`), and `ip_address`.

### `SessionGuard.tsx` — client-side "log out on browser close"
```tsx
useEffect(() => {
  const hasRemember = localStorage.getItem("apex-remember") === "1";
  const hasSession = sessionStorage.getItem("apex-session") === "1";
  if (!hasRemember && !hasSession) createClient().auth.signOut();
}, []);
```
Approximates "sign out when the browser is closed" for users who didn't check "remember me," by checking `sessionStorage` (cleared on tab close) against a `localStorage` opt-in flag. Purely client-side, no server enforcement.

## 3.7 Roles

Four roles enforced by a Postgres `CHECK` constraint: `profiles.role CHECK IN ('owner','admin','employee','customer')`, default `'customer'`.

`RoleBadge.tsx` maps them to Finnish display labels: **Omistaja** (owner), **Admin**, **Työntekijä** (employee), **Asiakas** (customer, default fallback for unrecognized roles).

### 🟡 No centralized role-check helper
There is **no shared `isStaff()`/`isAdmin()`/`STAFF_ROLES` constant anywhere in `src/lib/`.** Every one of the ~40 API route files and every page independently re-fetches `profiles.role` and re-declares:
```ts
const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");
const isAdmin = ["owner","admin"].includes(profile?.role ?? "");
```
Locally-scoped wrapper functions with different names (`requireAdmin()`, `getStaffUser()`, `getUser()`, `getAuthedUser()`) repeat this same pattern per file. It works today because the convention has been followed consistently, but there's no compiler-enforced guarantee a future edit won't typo an array (e.g. forget `"employee"` in one of forty places). **Recommended fix**: extract `src/lib/auth.ts` with `requireUser()`, `requireStaff()`, `requireAdmin()` helpers that every route imports.

### Role capability matrix

| Resource / Action | owner | admin | employee | customer | Enforced by |
|---|:-:|:-:|:-:|:-:|---|
| Suspend/unsuspend users, list all users | ✅ | ✅ | ❌ | ❌ | `api/admin/users` |
| Grant `owner` role | ✅ | ❌ | ❌ | ❌ | `api/admin/users` PATCH |
| Change any other role | ✅ | ✅ | ❌ | ❌ | `api/admin/users` PATCH |
| Change **own** role | ❌ (blocked for everyone, including owner) | | | | same file |
| CRM customers/companies: read/create/edit | ✅ | ✅ | ✅ | ❌ | `api/crm/*` |
| CRM customers/companies: delete | ✅ | ✅ | ❌ | ❌ | `api/crm/*/[id]` |
| Quotes: read all / create / edit any field | ✅ | ✅ | ✅ | own only, read only | `api/quotes` |
| Quotes: accept/reject own (status only) | — | — | — | ✅ | `api/quotes` PATCH + RLS `customer_update_own_quote` (009) |
| Quotes: delete | ✅ | ✅ | ❌ | ❌ | `api/quotes` DELETE |
| Projects: read all / create / edit | ✅ | ✅ | ✅ | own, read only | `api/projects` |
| Projects: delete | ✅ | ✅ | ❌ | ❌ | `api/projects` DELETE |
| Project comments: create | ✅ | ✅ | ✅ | own project only | `api/projects/[id]/comments` POST |
| Project comments: delete | ✅ | ✅ | ❌ | ❌ | same file DELETE |
| Project comments: **read** | any authed user, **no check** | | | | same file GET — 🔴 see §3.9.D |
| Files: list/create/delete records | ✅ | ✅ | ✅ | ❌ | `api/files` |
| File upload/download | ✅ | ✅ | ✅ | own project only | `api/files/upload`, `.../download/[id]` |
| File requests: create | ✅ | ✅ | ✅ | ❌ | `api/files/requests` POST |
| File requests: list/update status | any authed user, **no app-layer check** (RLS enforces) | | | | see §3.9.E |
| Payments: refund, CSV export | ✅ | ✅ | ❌ | ❌ | `api/payments/refund`, `/export` |
| Payments: list | all | all | all | own only | `api/payments` GET |
| Invoices: create/edit | ✅ | ✅ | ✅ | ❌ | `api/invoices` |
| Invoices: delete | ✅ | ✅ | ❌ | ❌ | `api/invoices` DELETE |
| Tasks, calendar events (full CRUD incl. delete) | ✅ | ✅ | ✅ | ❌ | `api/tasks`, `api/events` |
| System settings, email templates | ✅ | ✅ | ❌ | ❌ | `api/admin/settings`, `/templates` |
| Activity logs: own | ✅ | ✅ | ✅ | ✅ | `api/activity` |
| Activity logs: another user's | ✅ | ✅ | ❌ | ❌ | same file |

Sidebar nav visibility (`Sidebar.tsx`, `isAdmin`/`isStaff` booleans) mirrors this table but is **cosmetic only** — hiding a link doesn't grant or deny access; every real check happens server-side in the table above.

## 3.8 Middleware — session refresh only, NOT route protection

`src/middleware.ts` (full file, ~30 lines) does exactly one thing: calls `supabase.auth.getUser()` on every matched request so the `@supabase/ssr` helper can transparently refresh an expiring token and rewrite cookies onto the response. **It contains zero redirect logic, zero role checks.** If `NEXT_PUBLIC_SUPABASE_URL` is unset, it's a complete no-op.

**All real route protection lives in `src/app/(dashboard)/layout.tsx`** (the single choke point for the entire `(dashboard)` route group — `redirect("/")` if no user) **and in each individual page/route's own role check** — there is no middleware-level "if not staff, redirect" gate. This is a deliberate-by-omission architecture: it means adding a new staff-only page requires remembering to add the role check in that page's own `page.tsx`, with nothing at the framework level to catch a forgotten check.

`layout.tsx` also performs the **customer auto-link self-heal** added this session: if a `customer`-role user has no `customers` row linked via `user_id`, it uses the admin client to find a pre-existing `customers` row with a matching email and `user_id IS NULL`, and links it — handling the case where a CRM record was created before the person ever signed up.

### 🟡 `is_suspended` is fetched but not actively enforced per-request
`layout.tsx` selects `profiles.is_suspended` but does not branch on it. Suspension appears to rely entirely on `admin.auth.admin.signOut(userId, "global")` being called at suspend-time (`api/admin/users` PATCH) to forcibly end the session — there's no redundant "if suspended, block" check on every subsequent request. If a session somehow survives the global sign-out (token refresh timing, edge-cache lag), nothing else stops it.

## 3.9 Known security gaps, in priority order

**A. 🔴 `GET /api/projects/[id]/comments` — confirmed IDOR (fix first)**
Admin client + `project_id` from URL + zero ownership/role check. Any logged-in user can read any project's comment thread and the commenters' resolved names/emails. **Fix**: add the same staff-or-owns-project check the `POST` handler in the same file already has, before the `SELECT`.

**B. `otp_codes` table missing from migrations** — write and check in `010_otp_codes.sql` from the live schema (§3.2).

**C. `user_sessions` never populated — dead feature** — add an insert at OTP-verify success and in the OAuth callback (§3.6).

**D. No password-reset flow** — build `resetPasswordForEmail` + recovery page, or document the manual admin process (§3.5).

**E. `GET`/`PATCH /api/files/requests` — no app-layer role/ownership check.** Currently *not* exploitable because this route uses the regular RLS-bound client, and migration 006's `staff_file_requests`/`customer_own_file_requests`/`customer_fulfill_file_requests` policies genuinely enforce the boundary at the database level. Still worth adding an explicit check for defense-in-depth — see §11.A in [02-database.md](./02-database.md) about why relying solely on RLS being correctly deployed is risky.

**F. `customer_fulfill_file_requests` RLS policy has no `WITH CHECK`** — a customer could theoretically update columns beyond `status` on their own file request row (minor hardening gap, database-level).

**G. No centralized `isStaff()`/`isAdmin()` helper** — duplicated role-array literals across ~40 files (§3.7).

**H. In-memory OTP rate limiter** — resets per server instance/restart, not a real distributed rate limit (§3.2).

**I. Migrations are entirely manual** — this is the single biggest structural risk in the whole security model, covered in depth in [02-database.md §"Operational risk"](./02-database.md). Every customer-facing RLS policy in this app (migrations 004, 006, 007, 008, 009) was added *after* the fact, retrofitting access that staff-only 001–003 policies didn't originally grant — a pattern that will very likely repeat for the next customer-facing feature (e.g. `quote_items`, `milestones`, `tasks`, `calendar_events`, `time_entries` currently have **zero** customer read access at all).
