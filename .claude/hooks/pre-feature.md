# pre-feature

**Event:** `UserPromptSubmit`
**Script:** `.claude/hooks/scripts/pre-feature-nudge.js`
**Wired in:** `.claude/settings.json` → `hooks.UserPromptSubmit[0]`

## What it actually does — and an important honesty note

The original ask was "automatically execute the software-architect subagent and require plan approval before implementation" as a **hook**. That enforcement already exists — as the `/feature` command (`.claude/commands/feature.md`), which dispatches `software-architect` and applies the plan-gate pattern in `.claude/shared/plan-gate.md` before any implementation. There's no need to duplicate that logic in a hook.

What a hook genuinely *can* add here: `UserPromptSubmit` only supports command-type hooks (no LLM judgment call — that's only available on `PreToolUse`/`PostToolUse`/`PermissionRequest`), so this hook does a best-effort **keyword match** on the submitted prompt text. If it looks like a feature request (`"add/build/implement/create/ship" + "feature/functionality/module/page/dashboard/integration/flow/workflow"`, or phrases like "new feature" / "can you add"), it injects a reminder via `additionalContext` pointing at `/feature` and the plan-gate — surfaced at the exact moment it's most useful, so the reminder isn't only available if someone thinks to ask for it.

**This is a nudge, not a gate.** It cannot block the prompt, cannot verify a plan was actually presented or approved, and will miss phrasings outside its keyword list (by design — false positives that hassle the user for legitimate small requests are worse than occasional misses). The real requirement — architect plan before implementation — is enforced by `/feature`'s own plan-gate, not by this hook.

## Why not a hard `UserPromptSubmit` block

`UserPromptSubmit` does support `decision: "block"`, which could refuse to process a prompt outright. Rejected: blocking a user's own prompt based on a regex guess is high-handed and risks false positives on ordinary requests that merely mention "feature." A reminder is proportionate; an outright block is not.

## Reused, not duplicated

- Doesn't reimplement the architect-plan-then-implement workflow — points at `/feature` and `.claude/shared/plan-gate.md` instead of restating them.

## Maintaining this hook

`FEATURE_PATTERN` in the script is the one thing worth tuning if it's too noisy or too quiet. It also defensively checks several possible field names (`prompt`/`message`/`user_prompt`/`text`) for the submitted text, since the exact `UserPromptSubmit` stdin shape wasn't confirmed against live documentation at the time this was written — if it never fires, check which field the actual payload uses and adjust `extractPrompt()`. Review or disable via `/hooks`.
