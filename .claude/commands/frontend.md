---
description: Build clean, responsive, accessible UI via the frontend-engineer subagent
argument-hint: [UI/component/page description]
---

Task: $ARGUMENTS

Dispatch the `frontend-engineer` subagent to build the requested UI:

- Match existing design system and component conventions — no parallel styling approach or component library.
- Handle every state: loading, empty, error, success, and permission-denied — not just the happy path.
- Responsive across breakpoints; accessible by default (semantic HTML, keyboard navigation, ARIA where needed, color contrast).
- Reuse existing shared components (`src/components/{dashboard,layout,sections,shared,ui}/`) before creating new ones.
- Match existing UI copy conventions exactly — this project's user-facing strings are in Finnish.
- Self-test in the browser (golden path + at least one edge case) before reporting the task done; state plainly if browser verification wasn't possible.

If the required API/data contract doesn't exist yet or is ambiguous, stop and flag it — hand off to `/api` rather than building against assumptions or mocking around the gap.
