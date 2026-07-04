---
description: Generate a test plan and verify a feature/fix end-to-end via the qa-engineer subagent
argument-hint: [feature/fix to test]
---

Target: $ARGUMENTS

Dispatch the `qa-engineer` subagent to:

1. **Generate a test plan**: golden path, edge cases (empty/null data, boundary values, concurrent actions, permission boundaries), and failure modes (network errors, third-party API failures, invalid input).
2. **Check regressions**: verify adjacent functionality sharing the same code path, component, or database table still works.
3. **Produce a validation checklist** covering the above, and actually execute it — run the dev server/browser (or mobile simulator) for anything user-facing rather than only reading the code.
4. **Report results**: what was tested, what passed, what failed (with exact reproduction steps for failures), and — explicitly — what was *not* tested and why (e.g. no sandbox available for a given third-party integration).
