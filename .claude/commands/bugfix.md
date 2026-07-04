---
description: Root-cause a bug and fix it with the smallest safe change, then review and QA the fix
argument-hint: [bug description or repro steps]
---

Bug report: $ARGUMENTS

1. **Analyze the bug directly** (do not delegate this step): read the relevant code path and confirm the actual observed behavior vs. the expected behavior. Reproduce it if a dev server/test is available.
2. **Find the root cause** — not just the symptom. State it precisely with the specific file/line responsible.
3. **Explain the issue to the user in plain terms** before changing any code: what's broken, why, and what the smallest safe fix looks like. For anything touching auth, payments, or a migration, wait for explicit confirmation before proceeding; otherwise proceed directly.
4. **Dispatch the appropriate engineer subagent for the fix** — `backend-engineer` for server-side bugs, `frontend-engineer` for UI/client bugs, `database-engineer` if the root cause is schema/RLS/migration-related. Instruct it explicitly: fix with the smallest safe change, do not refactor unrelated code, preserve all other existing behavior.
5. **Dispatch `code-reviewer`** to review the fix diff for correctness and any regressions it might introduce.
6. **Dispatch `qa-engineer`** to verify the fix actually resolves the original bug and check for regressions in adjacent functionality.
7. **Summarize**: root cause (file:line), what changed, what was verified, and any follow-up the user must still do (e.g. running a migration manually).
