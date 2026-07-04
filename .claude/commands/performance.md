---
description: Find and prioritize performance bottlenecks — rendering, database queries, and bundle size
argument-hint: [optional: specific file/area to focus on]
---

Scope: $ARGUMENTS (or the full app if unspecified)

**Scope note**: this is a dedicated, deeper performance pass than the performance section of `/review`. Use this when performance is the primary concern, not a side check.

Dispatch the `code-reviewer` subagent (bring in `database-engineer` too if the scope is query-heavy) for a focused performance audit. Instruct it to check:

- **Rendering**: unnecessary Client Component boundaries, missing memoization where it actually matters, waterfalled data fetching, avoidable large `"use client"` scope.
- **Database queries**: N+1 patterns, missing indexes for real query patterns, unbounded queries against growing tables (this codebase has no server-side pagination outside `/api/search`), queries done in an application-side loop that could be one join.
- **Bundle size**: large dependencies imported where a lighter alternative or subpath import would do, barrel-file imports pulling in unused code.

For every finding, suggest the concrete fix — not "this is slow" but the specific change (e.g. "add an index on `quotes.customer_id`", "convert this to a Server Component", "batch these N queries into one").

Produce the final output as a prioritized report following `.claude/shared/severity-rubric.md`.
