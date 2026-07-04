# Severity Rubric

Shared by `/review`, `/security`, `/performance`, and `/deploy` — read this file rather than re-deriving a severity scale each time.

Produce findings as four sections, in this exact order, **omitting any section with no findings** (never write "None" as filler):

- `## Critical` — exploitable security holes, data loss, auth bypass, production-breaking bugs.
- `## High` — real bugs with clear user-facing impact, meaningful security weaknesses, serious performance regressions.
- `## Medium` — correctness edge cases, moderate performance concerns, notable clean-code violations likely to cause future bugs.
- `## Low` — style/naming, minor duplication, nice-to-have refactors.

Each finding is one line: `- **file:line** — one-sentence description of the defect and why it matters.`

End the report with a one-line summary: total finding count by severity (e.g., `2 Critical, 1 High, 3 Medium, 0 Low`).
