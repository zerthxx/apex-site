---
description: Design (and implement) a REST API endpoint via the backend-engineer subagent
argument-hint: [endpoint/feature description]
---

Endpoint(s): $ARGUMENTS

Dispatch the `backend-engineer` subagent to design — and, if asked, implement — the REST API endpoint(s), covering:

- **Request/response shape**: method, path, request body/query schema, response schema, matching this project's existing validation approach (e.g. Zod schemas in `src/lib/schemas/`).
- **Validation**: server-side validation of all external input — never trust client-supplied data, even values already validated client-side.
- **Error handling**: explicit, actionable error responses for invalid input, not-found, unauthorized, and upstream-failure cases.
- **Authentication/authorization**: exactly which callers can hit this endpoint and how that's enforced server-side (session check, `isStaff`/`isAdmin` role check, or the RLS-backed cookie-scoped Supabase client) — never rely on a UI-layer check alone.
- **Documentation**: a short, precise summary of the final contract (method, path, request/response shape, auth requirement) that a frontend engineer can build against without reading the implementation.

If this endpoint requires a schema change that doesn't exist yet, stop and hand off to `/database` rather than guessing at a schema. If a corresponding UI needs to consume it, hand off to `/frontend` with the finalized contract.
