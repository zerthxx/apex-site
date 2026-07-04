#!/usr/bin/env node
/**
 * PostToolUse hook (matcher: Write|Edit), run with asyncRewake: true.
 * Runs the project's actual typecheck (same command /deploy uses: `npx tsc --noEmit`) in the background
 * and wakes Claude only if it fails. Whole-program typecheck is too slow to run synchronously after
 * every single edit, so this never blocks the edit itself.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const RELEVANT = /\.(ts|tsx)$/;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch (e) {
    return "";
  }
}

function findTsRoot(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "tsconfig.json"))) return dir;
    dir = path.dirname(dir);
  }
  return null;
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
  if (!RELEVANT.test(file)) return;

  const tsRoot = findTsRoot(file);
  if (!tsRoot) return;

  try {
    execSync("npx --no-install tsc --noEmit", { cwd: tsRoot, stdio: "pipe" });
    // Clean typecheck — exit 0, nothing to report.
  } catch (e) {
    const output = ((e.stdout && e.stdout.toString()) || "") + ((e.stderr && e.stderr.toString()) || "");
    process.stderr.write(`TypeScript errors in ${tsRoot}:\n${output}`);
    process.exit(2); // asyncRewake wakes Claude on exit code 2
  }
}

main();
