#!/usr/bin/env node
/**
 * PreToolUse hook (matcher: Write|Edit).
 * Three deterministic checks — no LLM call, so this stays fast on every single edit:
 *   1. Hard deny: paths that should never be hand-edited (node_modules, .git, build output, lockfiles, .env).
 *   2. Soft warn: large diffs (via additionalContext, doesn't block — Claude decides whether to pause).
 *   3. Soft warn: architecture-sensitive paths, pointing at the relevant convention instead of re-deriving it.
 */
const fs = require("fs");
const path = require("path");

const NEVER_EDIT = [
  /[\\/]node_modules[\\/]/,
  /[\\/]\.git[\\/]/,
  /[\\/]\.next[\\/]/,
  /[\\/](dist|build)[\\/]/,
  /[\\/]\.expo[\\/]/,
  /[\\/](ios|android)[\\/]/,
  /(^|[\\/])\.env(\.[^.]+)?$/, // .env, .env.local, etc — NOT .env.example
  /(^|[\\/])(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/,
];
const ENV_EXAMPLE = /(^|[\\/])\.env\.example$/;

const ARCHITECTURE_SENSITIVE = [
  { pattern: /[\\/]supabase[\\/]migrations[\\/]/, note: "Migration file — must ship with its RLS policy in the same file, and still needs to be manually run in the Supabase SQL Editor (migrations here are never auto-applied). See .claude/templates/_foundations.md." },
  { pattern: /(^|[\\/])middleware\.ts$/, note: "middleware.ts only refreshes the Supabase session cookie — it does not gate routes. Don't assume it protects this route; the page/layout must check auth itself." },
  { pattern: /[\\/]lib[\\/]supabase[\\/]admin\.ts$/, note: "Service-role client — bypasses RLS entirely. Never import this into client-side code; every use needs its own explicit authorization check." },
  { pattern: /[\\/]api[\\/]webhooks?[\\/]/, note: "Webhook handler — verify signatures and make the handler idempotent (providers redeliver events)." },
  { pattern: /(^|[\\/])next\.config\.(ts|js|mjs)$/, note: "Framework config — this project pins a pre-release Next.js version; check node_modules/next/dist/docs/ before assuming standard conventions." },
];

const LARGE_DIFF_CHARS = 8000;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch (e) {
    return "";
  }
}

function deny(file, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `Blocked edit to ${file}: ${reason}`,
      },
    })
  );
}

function warn(notes) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: notes.join("\n"),
      },
    })
  );
}

function main() {
  const raw = readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch (e) {
    return;
  }
  const rawFile = input.tool_input && input.tool_input.file_path;
  if (!rawFile) return;
  const file = path.resolve(rawFile);

  if (!ENV_EXAMPLE.test(file) && NEVER_EDIT.some((re) => re.test(file))) {
    deny(file, "this path is generated/vendored/secret and should never be hand-edited. If this is genuinely necessary, ask the user directly instead of editing around this gate.");
    return;
  }

  const notes = [];

  const changedSize =
    typeof input.tool_input.content === "string"
      ? input.tool_input.content.length
      : typeof input.tool_input.new_string === "string"
      ? input.tool_input.new_string.length
      : 0;
  if (changedSize > LARGE_DIFF_CHARS) {
    notes.push(
      `Large edit (${changedSize} chars) to ${file}. If this is a broad refactor rather than a single focused change, consider /refactor (which applies the plan-gate pattern) instead of proceeding inline.`
    );
  }

  for (const { pattern, note } of ARCHITECTURE_SENSITIVE) {
    if (pattern.test(file)) notes.push(`${file}: ${note}`);
  }

  if (notes.length) warn(notes);
}

main();
