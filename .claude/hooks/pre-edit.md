# pre-edit

**Event:** `PreToolUse`, matcher `Write|Edit`
**Script:** `.claude/hooks/scripts/pre-edit-guardrails.js`
**Wired in:** `.claude/settings.json` → `hooks.PreToolUse[0]`

## What it actually does

This file documents the hook — the enforcement itself lives in `.claude/settings.json` + the script above, since Claude Code hooks are real deterministic shell commands, not markdown. Everything below is what the script does today; read the script for the exact logic.

Runs on every `Write`/`Edit` tool call, before it's allowed to execute. Three checks, all deterministic (no LLM call — this fires on *every* edit, so it has to stay fast):

1. **Hard deny — never-edit paths.** Blocks edits to `node_modules/`, `.git/`, `.next/`, `dist/`, `build/`, `.expo/`, `ios/`/`android/` (generated native folders), `.env`/`.env.*` (except `.env.example`), and lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`). This is the literal, achievable version of "prevent editing unrelated files" — a hook has no way to know what's semantically "related" to the current task, but it can reliably know what should never be hand-edited at all.
2. **Soft warn — large diffs.** If the new content/replacement text exceeds ~8,000 characters, injects a reminder (via `additionalContext`, non-blocking) to consider `/refactor` instead of an inline large change — `/refactor` applies the plan-gate pattern in `.claude/shared/plan-gate.md`.
3. **Soft warn — architecture-sensitive paths.** If the file is a migration (`supabase/migrations/**`), `middleware.ts`, `src/lib/supabase/admin.ts`, a webhook handler, or `next.config.*`, injects the relevant convention from `.claude/templates/_foundations.md` / `CLAUDE.md` as a reminder (e.g. "migrations are manual-apply only," "middleware doesn't gate routes"). This is "verify architecture" reframed as *surface the documented rule instead of letting Claude forget it* — a hook cannot semantically verify an architecture decision, but it can reliably remind.

## Why it's scoped this way

An earlier design considered an LLM-judgment (`type: "prompt"`) hook here for genuine semantic scope-checking. Rejected: that would add a model call to *every single edit* in the session, which is a real latency/cost tax on ordinary iterative development. Deterministic pattern-matching covers the checks that are actually achievable without that cost.

## Reused, not duplicated

- Conventions referenced (not restated) from `.claude/templates/_foundations.md` and `CLAUDE.md`.
- Points to `/refactor` and `/database` rather than re-explaining what those commands do.

## Maintaining this hook

Edit `.claude/hooks/scripts/pre-edit-guardrails.js` directly — `NEVER_EDIT`, `ARCHITECTURE_SENSITIVE`, and `LARGE_DIFF_CHARS` are the three things you'd realistically tune. Review or disable via `/hooks`.
