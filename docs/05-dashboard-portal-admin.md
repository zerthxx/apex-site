# 5. Dashboard, Customer Portal & Admin Panel

Every page under `src/app/(dashboard)/`. **Common access pattern**: every `page.tsx` is a Server Component that calls `createClient()` → `supabase.auth.getUser()` → `redirect("/")` if absent → fetches `profiles.role` → gates content with `isStaff = ["owner","admin","employee"].includes(role)` and `canModerate`/`isAdmin = ["owner","admin"].includes(role)`.

## 5.1 Dashboard home — `/dashboard`

Fully server-rendered (`dynamic = "force-dynamic"`), no client component. Greeting header (time-of-day aware) plus role-branched stats:
- **Staff**: 8 `StatCard`s (active customers, leads, active projects, revenue = sum of paid invoices, pending quotes, pending/overdue invoices, open tasks) + global `ActivityFeed` + quick-links panel.
- **Customer**: 4 `StatCard`s scoped to their own data + `ActivityFeed` filtered to `user_id`.

Queries `profiles`, `activity_logs`, `notifications`, `user_sessions`, `customers`, and (staff only) `quotes`, `projects`, `invoices`, `tasks` — all via `Promise.all`.

## 5.2 CRM — `/crm/asiakkaat`, `/crm/yritykset`

Staff-only throughout (redirect to `/dashboard` otherwise).

- **`/crm/asiakkaat`** (Customers list): `customers` joined to `companies`, limit 100. Client-side search/status filter. "Uusi asiakas" modal → `POST /api/crm/customers`.
- **`/crm/asiakkaat/[id]`** (detail): parallel-fetches customer + their quotes/projects/invoices. Inline edit → `PATCH`; delete → `DELETE` + route back. Tabbed sub-panel (Tarjoukset/Projektit/Laskut), client-side tab switching only. "Uusi tarjous" modal creates a quote scoped to this customer.
- **`/crm/yritykset`** (Companies list): `companies` + a separately-computed contact-count map. Create/edit share one `CompanyModal`; delete has a confirm modal + auto-clearing success toast.
- **`/crm/yritykset/[id]`** (detail): read-only — no client component, no edit/delete actions on this page (editing happens via the list modal).

## 5.3 Customer Portal — `/portaali/*`

The same route tree serves both staff and customers; content branches by role inside each `page.tsx`.

### `/portaali` (overview)
No client component, `force-dynamic`. **Staff**: 2×2 grid of module cards with aggregate counts, purely navigational. **Customer**: up to 3 recent projects/quotes/invoices each, plus a file-count card.

### `/portaali/tarjoukset` + `/[id]`
List: staff see all (joined to customers+companies), customers see own only. Client-side search+status filter. Staff "Uusi tarjous" modal fetches `/api/crm/customers` for the picker. `canModerate` sees a delete button (added this session). Detail page: staff get an edit modal + quick status-transition buttons; customers with a `sent` quote get **Hyväksy/Hylkää** buttons that PATCH status directly (fixed this session, see [02-database.md](./02-database.md) migration 009).

### `/portaali/projektit` + `/[id]`
List: same staff/customer split, plus a **Poista** delete button for `canModerate` (added this session) alongside the pre-existing **Avaa** button (added earlier this session — the project name used to be an invisible link). Detail page — the richest page in the portal, 4 tabs:
- **Tiedot**: read-only detail list.
- **Tehtävät**: read-only task list for this project.
- **Tiedostot**: staff-only drag-and-drop upload, image/PDF preview via signed URL, download.
- **Kommentit**: lazy-loaded, post/delete (canModerate can delete any comment — the feature built earlier this session). Ctrl+Enter submits.
- Progress: staff drag a slider, "Tallenna" appears only on change → `PATCH {progress_pct}`. Customers see a static bar.
- Edit modal: staff only, saves via `PATCH`, then does a **full `window.location.reload()`** — the one place in the app that hard-reloads instead of merging local state.

### `/portaali/laskut` (Invoices)
Staff: summary stats (revenue, pending count, total count), full CRUD (edit modal, "Maksettu" quick-mark, owner/admin-only delete). Customer: "Maksa" button on `sent`/`overdue` invoices → `POST /api/payments/checkout` → redirect to Stripe.

### `/portaali/maksut` + `/success` + `/cancel`
Staff see all payments, customers their own. Stat cards computed client-side from the full fetched array (no separate aggregate query). `/success`: server-only, confirms the Stripe session via the Stripe SDK directly, shows a receipt link. `/cancel`: uses the admin client to flip a `pending` payment to `failed` if a `payment_id` is present.

### `/portaali/tiedostot` (Files)
Files grouped into collapsible per-project folders (`ProjectFolder`), plus a staff-only "Yleiset tiedostot" (general/no-project) folder. Upload (drag-drop or click), preview modal for image/PDF, download, staff-only delete. **File requests**: staff can request files from a project folder (`POST /api/files/requests`); pending requests render as an amber alert card; either party can mark fulfilled.

### `/portaali/viestit`
A stub — immediately `redirect("/portaali")`. Messaging was consolidated into project comments; this route exists only so old links don't 404.

## 5.4 Account — `/ilmoitukset`, `/istunnot`, `/asetukset/*`

- **`/ilmoitukset`**: own notifications, type-based icon/accent, "mark all read" — fixed this session to call `router.refresh()` after marking read so the sidebar badge updates (previously stale until a full navigation).
- **`/istunnot`**: own `user_sessions`, first item always treated as "this device" (no revoke button). **Note**: per [03-authentication-security.md §3.6](./03-authentication-security.md#36-sessions), nothing currently inserts into `user_sessions`, so this page is very likely always empty in production despite being fully built.
- **`/asetukset/*`**: shared layout with 6 tabs (Profiili/Yritystiedot/Turvallisuus/Ilmoitukset/Integraatiot/API-avaimet). **Profiili** and **Yritystiedot** are unusual — single client-only page files (no separate server `page.tsx`/`*Client.tsx` split like everywhere else). Profiili reads/writes `user_metadata` directly via client-side `supabase.auth.updateUser()` (no API route); Yritystiedot goes through `GET`/`PATCH /api/account/company-info`.

## 5.5 Staff-only — `/tehtavat`, `/kalenteri`

- **`/tehtavat`**: 4-column Kanban (Tekemättä/Työn alla/Katselmus/Valmis) over all `tasks` (not filtered by assignee by default — global board). "Vain omat tehtävät" filters client-side, though note it checks `assigned_to` truthiness rather than equality to the current user. Status-advance button applies optimistically before the PATCH resolves.
- **`/kalenteri`**: month grid or list view. **UX gap**: only the initially-loaded month's events are server-fetched; Prev/Next month navigation changes the displayed month client-side **without re-fetching** — navigating to a different month shows it empty unless those events happened to already be in the loaded array.

## 5.6 Admin panel — `/admin/*`

`/admin` itself is just `redirect("/admin/kayttajat")`.

- **`/admin/kayttajat`**: owner/admin only. Uses `createAdminClient()` to call `auth.admin.listUsers({perPage:1000})` — the only page reading the full `auth.users` table directly. `UserTable` component: search, sortable columns, per-row role dropdown (owner can grant any role; non-owner admin cannot grant/target owner), suspend/unsuspend. A user cannot change their own role; non-owners cannot change an owner's role.
- **`/admin/logi`**: owner/admin only. Read-only `ActivityFeed` over the latest 100 `activity_logs` rows, all users.
- **`/admin/analytiikka`**: owner/admin only, fully server-rendered. Parallel counts (customers/projects/quotes/tasks) + 5 most recent projects/customers + a server-computed CSS-bar chart. No client fetches, no filters.
- **`/admin/laskutus`**: owner/admin only. Totals computed from only the **latest 10** invoices (not a true global aggregate, unlike `/admin/maksut` which pulls 500) — a real limitation if used for actual financial reporting.
- **`/admin/maksut`**: owner/admin only (redirects to `/portaali`, notably **not** `/dashboard` like every other admin page — a minor inconsistency). Superset of the customer-portal payments view: refund action (with an irreversible-action confirm modal), delete, CSV export via `GET /api/payments/export`.
- **`/admin/sahkopostipohjat`**: owner/admin only. CRUD over `email_templates`, one shared `TemplateModal` for create/edit.
- **`/admin/asetukset`**: owner/admin only. Each of the 3 known settings (`company_name`, `support_email`, `maintenance_mode`) saves **independently** via its own `PATCH /api/admin/settings` call — not a single bulk save.

## 5.7 Layout / shell

- **`(dashboard)/layout.tsx`**: the auth guard for the entire route group, plus the customer-auto-link self-heal and unread-notification count fetch — see [03-authentication-security.md §3.8](./03-authentication-security.md#38-middleware--session-refresh-only-not-route-protection).
- **`DashboardShell.tsx`**: pure composition — manages mobile sidebar drawer state, renders `Sidebar` + `Topbar` + scrollable `main`.
- **`Sidebar.tsx`**: computes `isAdmin`/`isStaff` from the `role` prop and conditionally renders nav sections (Business, Hallinta, Admin are staff/admin-gated; Asiakasportaali and Tili are always visible to everyone — customers and staff share the same portal nav, with the underlying pages branching content instead of hiding the link). **This is UI visibility only** — hiding a link doesn't grant or deny access; the real check is server-side on the destination page.
- **`Topbar.tsx`**: mobile hamburger, page title, global `SearchBar`, `NotificationDropdown`, settings gear.

## 5.8 Cross-cutting observations

- **Role gating is duplicated per-page**, not centralized in middleware — every server page repeats the same `getUser()` → `profiles.role` → `redirect()` pattern (see [01-architecture.md §1.5](./01-architecture.md#15-other-recurring-patterns) and [03-authentication-security.md §3.7](./03-authentication-security.md#37-roles)).
- **Client-side filtering dominates.** Every list page (customers, companies, quotes, projects, invoices, payments, tasks) fetches its full dataset once (capped 100–500 rows) and filters/searches entirely in the browser. No server-side pagination or search API exists for these lists — the one exception is the dedicated `/api/search` command palette.
- **"Optimistic-ish" state, not true optimistic UI**: most mutations wait for the API response, then merge the returned object into local state. Real optimistic updates (before the request resolves) exist in exactly two places: the task Kanban drag-forward, and notification read-marking.
- **`isStaff`/`canModerate` naming is consistent app-wide** — once you know the convention, you can predict a new page's authorization shape without reading it.
