# Plan-Gate Pattern

Shared by `/feature`, `/database`, and `/refactor` for any change with meaningful blast radius (new feature, schema/migration change, cross-module refactor).

1. Produce the full plan/design — not a summary — covering approach, files/modules touched, and risks.
2. Present it to the user in full and **stop**. Do not write or edit any implementation code until the user explicitly approves (e.g. "yes", "proceed") or asks for changes.
3. If changes are requested, revise the plan and re-present it before proceeding. Never start implementing a partially-approved plan.

Skip this gate only for genuinely small, contained changes (e.g. a single-file fix) where the command's own instructions say so explicitly.
