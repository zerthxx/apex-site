# pre-commit

**Event:** `PreToolUse`, matcher `Bash`, filtered with `"if": "Bash(git commit*)"`
**Script:** `.claude/hooks/scripts/pre-commit-gate.js`
**Wired in:** `.claude/settings.json` → `hooks.PreToolUse[1]`

## What it actually does

A hook is a shell command — it cannot itself invoke `/review` or `/security` (those are conversation-level slash commands that dispatch the `code-reviewer` subagent). So this hook doesn't try to reimplement their logic. Instead it gates the literal `git commit` shell command behind proof that a review actually happened:

1. On every `git commit*` attempt, checks for a sentinel file: `<repo-root>/.claude/.precommit-clear`.
2. **If absent:** denies the commit (`hookSpecificOutput.permissionDecision: "deny"`) with a reason telling Claude to run `/review` and `/security` on the staged changes, and — only if neither reports a Critical-severity finding — create the sentinel file and retry.
3. **If present:** deletes it (single-use) and allows the commit through.

This makes "block commit if Critical issues exist" a real, working gate rather than an unenforceable suggestion — the raw `git commit` genuinely cannot succeed without the sentinel, and the sentinel is consumed the instant it's used, so the *next* commit attempt requires a fresh pass again.

Repo root is resolved via `git rev-parse --show-toplevel`, so this works correctly whether the commit happens in `apex-site` or `apex-app` (independent repos, independent sentinels). `.claude/.precommit-clear` is gitignored in both.

## Why it's designed this way, not as an `agent`-type hook

Claude Code hooks support an `agent` hook type (a lightweight sub-agent that can itself judge pass/fail) that could have run a Critical-only check inline. Rejected in favor of the sentinel-gate design because the user's request was specifically "**Run** /review, **Run** /security" — those are this project's existing, thorough (`code-reviewer` subagent, full severity rubric) commands. Re-implementing a lighter version inside the hook would be the exact duplication the user asked to avoid; delegating to the real commands and gating on their result is the non-duplicating version of the same requirement.

## Reused, not duplicated

- Severity definitions ("what counts as Critical") live in `.claude/shared/severity-rubric.md` — this hook's reason text points there rather than restating it.
- The actual review work is `/review` and `/security`, run as-is.

## Maintaining this hook

If you ever want this less strict (e.g., skip the gate for trivial commits), that's a conversation-level judgment call, not something to bolt onto the hook — the hook's whole value is that it doesn't make judgment calls. Review or disable via `/hooks`.
