#!/usr/bin/env node
/**
 * PostToolUse hook (matcher: Write|Edit).
 * Formats the touched file with prettier and reports eslint findings back to Claude via additionalContext.
 * Fails open: any unexpected error here must never block the edit that already happened.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const FORMATTABLE = /\.(ts|tsx|js|jsx|mjs|cjs|json|css)$/;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch (e) {
    return "";
  }
}

function findNpmRoot(filePath) {
  // Walk up from the file to find the nearest package.json (apex-site vs apex-app have separate installs).
  let dir = path.dirname(filePath);
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    dir = path.dirname(dir);
  }
  return PROJECT_ROOT;
}

function main() {
  const raw = readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch (e) {
    return;
  }
  const rawFile = input.tool_input && (input.tool_input.file_path || input.tool_input.path);
  if (!rawFile) return;
  const file = path.resolve(rawFile);
  if (!FORMATTABLE.test(file) || !fs.existsSync(file)) return;

  const cwd = findNpmRoot(file);
  const quoted = `"${file}"`;

  try {
    execSync(`npx --no-install prettier --write ${quoted}`, { cwd, stdio: "ignore" });
  } catch (e) {
    // prettier missing/failed — don't block the edit over a formatting tool issue.
  }

  let lintOutput = "";
  try {
    execSync(`npx --no-install eslint ${quoted}`, { cwd, stdio: "pipe" });
  } catch (e) {
    lintOutput = ((e.stdout && e.stdout.toString()) || "") + ((e.stderr && e.stderr.toString()) || "");
  }

  if (lintOutput.trim()) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `ESLint found issues in ${file}:\n${lintOutput.trim()}`,
        },
      })
    );
  }
}

main();
