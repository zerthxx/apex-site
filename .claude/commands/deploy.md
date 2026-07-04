---
description: Production-readiness checklist — env vars, build, lint, TypeScript, security, performance
argument-hint: [optional: which project — apex-site (default) or apex-app]
---

Target project: $ARGUMENTS (default `apex-site` if unspecified)

This command only produces a checklist and flags blockers — it does not deploy anything itself; the user decides when/how to actually ship.

1. **Environment variables**: grep actual `process.env.*` usages in the codebase and confirm each has a value available (`.env.local`/hosting provider config). Do not rely on `.env.example` — it's known to be out of date.
2. **Build**: run `npm run build` in the target project and report any failures verbatim.
3. **Lint**: run `npm run lint` and report errors/warnings.
4. **TypeScript**: run `npx tsc --noEmit` (there's no dedicated typecheck script) and report type errors.
5. **Security**: dispatch `code-reviewer` with the `/security` checklist (auth, authorization, SQL injection, XSS, CSRF, secrets) against the current diff/branch.
6. **Performance**: dispatch `code-reviewer` with the `/performance` checklist (rendering, database queries, bundle size) against the current diff/branch.
7. Produce a final deployment checklist with one line per check — `Build`, `Lint`, `TypeScript`, `Security`, `Performance` — each marked ✅ Pass / ⚠️ Warning / ❌ Blocker, using the severity rubric in `.claude/shared/severity-rubric.md` for the security/performance findings. Follow with an explicit list of any manual steps still required before shipping (e.g. pending migrations to run in the Supabase SQL Editor, env vars to set in the hosting provider, `otp_codes`/other live-only schema to double-check).
