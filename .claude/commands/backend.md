---
description: Implement clean, validated, well-logged server-side logic via the backend-engineer subagent
argument-hint: [server-side task description]
---

Task: $ARGUMENTS

Dispatch the `backend-engineer` subagent to implement the requested server-side logic:

- **Clean architecture**: reuse existing patterns/helpers rather than introducing a second competing implementation of something the codebase already solves one way.
- **Validation**: validate all external input server-side (request bodies, query params, webhook payloads) regardless of any client-side validation already in place.
- **Error handling**: explicit handling for expected failure modes (invalid input, not found, unauthorized, upstream API failure) with clear, actionable responses — no silent failures.
- **Logging**: instrument meaningful server-side actions (mutations, payment events, auth events) using the project's existing activity-logging approach — prefer `src/lib/supabase/activityLog.ts` over `src/lib/activity.ts` for new code (both exist; that's duplication, not a deliberate choice).

If the task requires a schema change, stop and hand off to `/database` rather than writing queries against a schema that doesn't exist yet. If it defines a new or changed API contract already in use by the frontend, coordinate explicitly before changing it — see `/api`.
