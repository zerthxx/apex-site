---
description: Full feature workflow — architect plan, DB/API design, implementation, QA, and review, gated on plan approval
argument-hint: [feature description]
---

Feature request: $ARGUMENTS

Run this feature end-to-end using the following fixed pipeline. Apply the plan-gate pattern in `.claude/shared/plan-gate.md` for step 3 — do not write or edit any implementation code until the plan has been presented and explicitly approved.

1. Dispatch the `software-architect` subagent to analyze the feature request above. Give it full context: what the feature is, why it's being requested (ask the user if unclear), and point it at the relevant docs (`apex-site/docs/`, `CLAUDE.md`/`AGENTS.md` in whichever project this touches).
2. Have the `software-architect` subagent produce a single implementation plan that includes, as applicable:
   - A step-by-step implementation approach (files/modules touched, sequencing, risks).
   - **Database changes**, if needed: new/changed tables, columns, indexes, and — critically for this codebase — the RLS policy implications and the new migration file this will require (migrations here are manual-apply only, see CLAUDE.md). Hand off the detailed schema/migration/RLS design to `database-engineer` (same as `/database`) rather than having the architect improvise SQL.
   - **API endpoint design**, if needed: routes, methods, request/response shapes, auth/role requirements (`isStaff`/`isAdmin` conventions) — same scope as `/api`.
3. Present this plan to the user in full (not summarized) and stop, per the plan-gate pattern. If the user requests changes, revise the plan with the `software-architect` subagent and re-present it before proceeding.
4. Once approved, dispatch the `backend-engineer` subagent to implement the server-side pieces of the approved plan (API routes, business logic, migrations as designed).
5. Dispatch the `frontend-engineer` subagent to implement the client-side pieces of the approved plan (UI, components, client data fetching).
6. Dispatch the `qa-engineer` subagent to verify the implemented feature end-to-end against the plan (test plan, exploratory verification, regression check).
7. Dispatch the `code-reviewer` subagent to review the full diff produced by steps 4–6 for correctness, security, and maintainability.
8. Return a final summary to the user covering: what was built, any deviations from the approved plan (and why), outstanding issues raised by QA or code review, and any manual steps the user must still take (e.g. running a new migration in the Supabase SQL Editor).
