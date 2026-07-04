# Dashboard / Analytics Template

Read `.claude/templates/_foundations.md` first — this file only covers what's specific to a data/analytics dashboard: metric aggregation, widgets, and (optionally) real-time updates.

## Recommended architecture

- Prefer **server-computed aggregates over client-side aggregation** — a Server Component queries pre-aggregated or efficiently-queried data directly from Postgres; don't ship raw rows to the client and reduce them in JS.
- Two data-freshness tiers, chosen deliberately per widget: (a) computed on-demand at request time (fine for low-cardinality/cheap queries), or (b) precomputed on a schedule into a summary table (needed once raw data volume makes on-demand aggregation slow). Don't reach for (b) until (a) is actually measured as too slow.
- If real-time updates are required, use Supabase Realtime subscriptions scoped to exactly the rows the viewer is authorized to see (RLS applies to Realtime too) — not a client-side polling loop hitting a full-table query.

## Folder structure

```
src/app/(dashboard)/
├── dashboard/
│   ├── page.tsx           overview — top-line metrics, key widgets
│   └── [report]/page.tsx  drill-down report pages
src/components/dashboard/
├── widgets/                one component per widget type (stat tile, chart, table, sparkline)
src/lib/
├── analytics/               aggregation query functions, one per metric — reused by both the page and any export/API route
```

## Tech stack additions

- A charting library is the one addition likely needed beyond baseline (none is currently installed in this workspace) — pick one deliberately (e.g., a lightweight SVG-based library) rather than a heavy full dashboard-framework dependency; confirm with the user before adding a new dependency.
- If a `dataviz`-style skill/reference is available in the environment, use it for chart color/accessibility conventions rather than improvising a palette.

## Database design

- Prefer **views or materialized views** for common aggregates over duplicating aggregation logic in application code — a materialized view refreshed on a schedule is often simpler and more consistent than an app-level cache.
- If precomputing, a `[metric]_daily`/`[metric]_summary` table keyed on `(entity_id, date)` with a unique constraint, upserted by a scheduled job — never recomputed by a user-facing request.
- Index every column used in a `WHERE`/`GROUP BY` for a dashboard query; this is the archetype most likely to develop slow queries as data grows, so index deliberately from the start (see `database-engineer`).

## Authentication

Per foundations. Dashboards commonly show data scoped to "my organization" or "my team" — confirm the scoping column (`customer_id`/`organization_id`) is part of every aggregation query's `WHERE` clause and its RLS policy, not just applied at the top-level page fetch and assumed to propagate.

## API structure

- Dashboard pages should fetch directly (Server Component → Supabase), per foundations — only add `/api` routes for: (a) data export (CSV/PDF generation), (b) client-side interactive filtering that can't be a full page reload, or (c) a public/embeddable widget needing its own auth model.
- `GET /api/analytics/export` — staff/owner-only, respects the same RLS scoping as the dashboard itself.

## UI components

- Stat tiles (single metric + trend indicator), line/bar charts for time series, tables for detail/drill-down, sparklines for compact trend display.
- Loading state per widget (skeleton), not a single full-page spinner — widgets often load at different speeds.
- Empty state for "no data yet" (new account, no activity in period) distinct from "error loading this widget."
- Date-range/filter controls that are shared across widgets on the same page, not duplicated per widget.

## Security checklist

Per foundations, plus:
- [ ] Every aggregation query scopes by the viewer's authorized entity (organization/customer/team) — verified by testing as two different accounts.
- [ ] Export endpoints enforce the same authorization as the dashboard view, not a looser check.
- [ ] Realtime subscriptions (if used) are scoped by RLS, not broadcasting unfiltered table changes to every connected client.
- [ ] Run `/security` before shipping a new report that surfaces data across organizational/tenant boundaries (e.g., a staff-only cross-tenant report).

## Performance checklist

Per foundations, plus:
- [ ] Every dashboard query has been checked against `EXPLAIN` (or equivalent) for the expected data volume, not just tested against a near-empty dev database.
- [ ] Precomputed/materialized aggregates are in place for any metric whose on-demand query is O(all historical rows).
- [ ] Widgets fetch independently (parallelized), not as one large serial waterfall.
- [ ] Run `/performance` before launch and again once real production data volume is known.

## Deployment checklist

Run `/deploy`, plus confirm:
- [ ] Any scheduled aggregation job (cron/edge function) is actually deployed and running, not just written locally.
- [ ] Materialized views (if used) have a refresh schedule configured in production.

## Development phases

1. **Core metrics**: identify the 3–5 numbers that matter most; build their queries and stat-tile widgets first. → `/database`, `/frontend`
2. **Visualization**: charts/time-series for the core metrics, date-range filtering.
3. **Drill-down**: detail/report pages linked from summary widgets.
4. **Scale-out**: precomputed aggregates/materialized views once real data volume makes on-demand queries slow.
5. **Hardening**: `/security` (tenant scoping), `/performance` (query plans at real volume), `/deploy`.

## Best practices

- Compute aggregates in the database, not by shipping raw rows to the client.
- Don't precompute/cache prematurely — measure the on-demand query first, then optimize the ones that are actually slow.
- Every widget has its own loading and empty state; a dashboard that shows one global spinner for eight independent widgets is a regression, not a simplification.
- Reuse one shared date-range/filter mechanism across widgets rather than each widget managing its own.
