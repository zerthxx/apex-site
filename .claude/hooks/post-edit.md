# post-edit

**Event:** `PostToolUse`, matcher `Write|Edit`
**Scripts:** `.claude/hooks/scripts/post-edit-format-lint.js` (sync), `.claude/hooks/scripts/post-edit-typecheck.js` (async)
**Wired in:** `.claude/settings.json` → `hooks.PostToolUse[0]`

## What it actually does

Two separate scripts run after every `Write`/`Edit`, split by cost:

1. **Format + lint (synchronous).** Resolves the touched file's nearest `package.json` (so `apex-site` and `apex-app`, which have separate installs, each use their own local tooling), runs `prettier --write` on that one file, then runs `eslint` on it. Prettier fixes are silent (matches the existing "no formatting bikeshedding" workflow). ESLint findings are reported back via `hookSpecificOutput.additionalContext` — informational, not blocking, since a lint warning shouldn't halt an in-progress edit.
2. **Typecheck (asynchronous, `asyncRewake: true`).** Runs the project's actual typecheck — the same `npx tsc --noEmit` that `/deploy` already runs — but only for `.ts`/`.tsx` files, in the background. Whole-program type checking is too slow to run synchronously after *every* edit (it would make ordinary editing feel sluggish), so this never blocks. If it fails, exit code 2 wakes Claude with the real `tsc` error output; a clean pass produces nothing.

## Why it's split this way

Running full-project `tsc --noEmit` synchronously after every single edit was considered and rejected — for a project this size it's a multi-second tax per edit, which compounds badly across an editing session. `asyncRewake` was built for exactly this shape of problem: cheap checks block, expensive checks run in the background and only interrupt on a real failure.

## A real Windows gotcha this hook already hit (documented so it doesn't get "fixed" back into a bug)

`execFileSync("npx", [...])` fails with `ENOENT` on Windows — `npx` resolves to `npx.cmd`, which `execFileSync` won't find without a shell. The scripts use `execSync` with a manually double-quoted file path instead (`execFileSync(..., {shell:true})` was also tried and rejected — with `shell:true`, Node does *not* escape array arguments, which breaks on this workspace's own path containing a space, `apex site`).

## Reused, not duplicated

- The typecheck command is identical to what `/deploy` runs — this hook just runs it more often, it doesn't reimplement it.
- No new formatter/linter introduced — `prettier` (already resolvable via `npx`) and the project's existing `eslint.config.mjs` are used as-is.

## Maintaining this hook

`FORMATTABLE`/`RELEVANT` regexes in the two scripts control which extensions are touched. Both scripts fail open (any unexpected error is swallowed rather than blocking the edit) except the intentional `tsc` failure path. Review or disable via `/hooks`.
