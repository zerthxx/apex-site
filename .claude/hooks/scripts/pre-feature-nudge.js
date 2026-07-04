#!/usr/bin/env node
/**
 * UserPromptSubmit hook.
 * Best-effort, keyword-based detection of "this looks like a new feature request" — UserPromptSubmit
 * only supports command-type hooks (no LLM judgment here), so this is a heuristic nudge, not a gate.
 * The actual enforcement (architect plan + explicit approval before implementation) lives in the
 * /feature command and .claude/shared/plan-gate.md — this hook just surfaces the reminder at the
 * moment it's most useful, so it isn't skipped when a prompt looks like ad hoc feature work.
 */
const fs = require("fs");

const FEATURE_PATTERN =
  /\b(add|build|implement|create|ship)\b.{0,40}\b(feature|functionality|module|page|dashboard|integration|flow|workflow)\b|\bnew feature\b|\bcan (you|we) add\b/i;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch (e) {
    return "";
  }
}

function extractPrompt(input) {
  return input.prompt || input.message || input.user_prompt || input.text || "";
}

function main() {
  const raw = readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch (e) {
    return;
  }
  const prompt = extractPrompt(input);
  if (!prompt || !FEATURE_PATTERN.test(prompt)) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext:
          "This prompt reads like a new-feature request. Per this project's convention, prefer running " +
          "/feature for it: that dispatches software-architect to produce an implementation plan (including " +
          "DB/API design if needed), presents the plan, and requires explicit approval before any " +
          "implementation starts (see .claude/shared/plan-gate.md). This is a reminder, not a requirement — " +
          "use judgment for genuinely small, contained changes.",
      },
    })
  );
}

main();
