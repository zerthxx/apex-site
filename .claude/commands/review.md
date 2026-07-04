---
description: Full code review via the code-reviewer subagent — security, performance, clean code, and bugs, prioritized
argument-hint: [optional: PR number or scope]
---

Scope: $ARGUMENTS

**Scope note**: this is a general-purpose review across all four dimensions below. For a deeper, dedicated pass on just security or just performance, use `/security` or `/performance` instead.

Run a complete review of the current diff (uncommitted changes, or the most recent commit if the working tree is clean, or the PR/scope given above) using the `code-reviewer` subagent.

1. Determine the diff to review:
   - If a PR number or explicit scope was given above, review that.
   - Else if there are uncommitted changes, review those (`git diff` + `git diff --staged`).
   - Otherwise, review the most recent commit (`git show HEAD`).
2. Dispatch the review to the `code-reviewer` subagent. Give it the diff/commit scope and instruct it to evaluate across these four dimensions:
   - **Security**: injection (SQL/command/XSS), auth/authorization gaps, missing RLS or ownership checks, secrets handling, unsafe deserialization, SSRF, insecure defaults.
   - **Performance**: N+1 queries, unnecessary re-renders, unbounded loops/queries, missing indexes for new query patterns, blocking calls on hot paths.
   - **Clean code**: naming, dead code, duplicated logic, misplaced abstractions, violations of existing project conventions (see CLAUDE.md/AGENTS.md).
   - **Bugs**: incorrect logic, off-by-one errors, unhandled edge cases, race conditions, incorrect null/undefined handling.
3. Collect the subagent's findings and produce the final output yourself (do not just relay raw agent text), following the severity rubric and report format in `.claude/shared/severity-rubric.md`.
