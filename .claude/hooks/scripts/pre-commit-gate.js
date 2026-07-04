#!/usr/bin/env node
/**
 * PreToolUse hook (matcher: Bash, if: "Bash(git commit*)").
 * Blocks the raw `git commit` unless a sentinel file proves /review + /security already ran clean.
 * The sentinel is single-use: consumed (deleted) the moment it's found, so every commit needs a fresh pass.
 * This hook does not re-implement review logic itself — it only gates the shell command and delegates the
 * actual review to Claude running the existing /review and /security commands (see .claude/commands/).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SENTINEL_NAME = ".claude/.precommit-clear";

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch (e) {
    return "";
  }
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
}

function main() {
  readStdin(); // consumed for hygiene; this hook doesn't need any field from it — the `if` filter already scoped it to git commit*

  let repoRoot;
  try {
    repoRoot = execSync("git rev-parse --show-toplevel", { stdio: "pipe" }).toString().trim();
  } catch (e) {
    return; // not inside a git repo — nothing to gate
  }
  if (!repoRoot) return;

  const sentinel = path.join(repoRoot, SENTINEL_NAME);

  if (fs.existsSync(sentinel)) {
    try {
      fs.unlinkSync(sentinel);
    } catch (e) {
      // ignore — worst case the next commit re-consumes it
    }
    return; // allow this commit through
  }

  deny(
    "Blocked: no clean /review + /security pass on record for this commit. " +
      "Run /review and /security on the staged changes. If neither reports a Critical-severity finding, " +
      `create the file "${SENTINEL_NAME}" in this repo (e.g. touch it) and retry the commit. ` +
      "If a Critical finding exists, fix it first — do not create the sentinel to bypass this gate."
  );
}

main();
