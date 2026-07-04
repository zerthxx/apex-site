#!/usr/bin/env node
/**
 * Stop hook.
 * Deterministically gathers what changed (git status + diffstat across both repos in this workspace)
 * and, the first time it sees a change set, blocks the stop once so Claude produces the human-facing
 * summary/suggestions itself — this hook only supplies facts, it never generates the summary text.
 * A hash of the current change set is cached so the same change set never re-blocks on a later Stop
 * (e.g. after Claude's summary turn, or across /clear, resume, compact — all of which also fire Stop).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..", "..");
const REPOS = ["apex-site", "apex-app"];
const STATE_FILE = path.join(WORKSPACE_ROOT, ".claude", ".last-stop-summary-hash");

function safeExec(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, stdio: "pipe" }).toString();
  } catch (e) {
    return "";
  }
}

function isGitRepo(dir) {
  return safeExec("git rev-parse --is-inside-work-tree", dir).trim() === "true";
}

function main() {
  const report = [];
  let combinedStatus = "";

  for (const repo of REPOS) {
    const dir = path.join(WORKSPACE_ROOT, repo);
    if (!fs.existsSync(dir) || !isGitRepo(dir)) continue;

    const status = safeExec("git status --porcelain", dir);
    if (!status.trim()) continue;

    combinedStatus += `# ${repo}\n${status}\n`;
    const diffstat = safeExec("git diff --stat HEAD", dir);
    report.push(`### ${repo}\nModified files:\n${status.trim()}\n\nDiffstat:\n${diffstat.trim() || "(no diffstat — check for untracked new files above)"}`);
  }

  if (!combinedStatus.trim()) return; // nothing changed anywhere — nothing to summarize, let it stop

  const currentHash = crypto.createHash("sha256").update(combinedStatus).digest("hex");
  let lastHash = "";
  try {
    lastHash = fs.readFileSync(STATE_FILE, "utf8").trim();
  } catch (e) {
    // no prior state — treat as first time
  }

  if (currentHash === lastHash) return; // this exact change set was already summarized — let it stop

  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, currentHash, "utf8");
  } catch (e) {
    // if we can't persist state, fail open rather than block forever
    return;
  }

  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        "Before stopping: summarize what changed this session, list the modified files below, and suggest " +
        "concrete improvements and refactoring opportunities you noticed while working (or state there are none). " +
        "Do not re-run this same summary again after this turn — it's a one-time close-out for this change set.\n\n" +
        report.join("\n\n"),
    })
  );
}

main();
