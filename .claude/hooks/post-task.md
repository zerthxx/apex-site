# post-task

**Event:** `Stop` (fires on normal stop, `/clear`, resume, and compact)
**Script:** `.claude/hooks/scripts/post-task-summary-gate.js`
**Wired in:** `.claude/settings.json` → `hooks.Stop[0]`

## What it actually does

A hook is a shell command — it cannot itself generate a prose summary or judge what's worth refactoring. So this hook's job is narrow and deterministic: gather the facts, then force one summary turn out of Claude before letting the session actually stop.

1. Runs `git status --porcelain` and `git diff --stat HEAD` across both repos in this workspace (`apex-site`, `apex-app`).
2. If nothing changed anywhere, does nothing — lets the stop proceed silently.
3. If something changed, hashes the combined `git status` output and compares it to the last hash it recorded (`.claude/.last-stop-summary-hash`, workspace-level, not inside either repo).
4. **New/changed since last time:** returns `decision: "block"` with a `reason` containing the modified-file list and diffstat for both repos, instructing Claude to summarize the changes, list the modified files (already given), and suggest improvements/refactoring opportunities — then updates the stored hash so this exact change set won't re-block on the *next* Stop (e.g. immediately after Claude's own summary turn, or after `/clear`).
5. **Unchanged since last time:** does nothing, lets the stop proceed.

## Why the hash-gate exists

Without it, this hook would block *every single* Stop event forever once any file was ever touched — including the Stop that fires right after Claude finishes writing the summary the hook itself demanded. The hash comparison makes it a one-time close-out per change set instead of a permanent nag.

## Reused, not duplicated

- Doesn't reimplement `/review`'s diff analysis — this only surfaces `git status`/`git diff --stat`, the cheap facts. The actual "suggest improvements/refactoring" judgment is left to Claude's own reasoning in the forced summary turn, using the same lens as `/refactor` and `/review` rather than a separate rubric.

## Maintaining this hook

State file: `.claude/.last-stop-summary-hash` (not gitignored anywhere in particular — it lives in the outer workspace, which isn't itself a git repo). Delete it any time to force a fresh summary on the next Stop regardless of hash. Review or disable via `/hooks`.
