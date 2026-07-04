---
description: Dedicated deep security audit — auth, authorization, injection, XSS, CSRF, secrets — prioritized report
argument-hint: [optional: specific file/area to focus on]
---

Scope: $ARGUMENTS (or the current diff / recent changes if unspecified)

**Scope note**: this is a dedicated, deeper security pass than the security section of `/review`. Use this when security is the primary concern, not a side check.

Dispatch the `code-reviewer` subagent for a focused security audit. Instruct it to specifically check:

- **Authentication**: session/token handling, the OTP/2FA flow's correctness (email+password then emailed OTP code; Google OAuth skips OTP), password handling.
- **Authorization**: ownership checks (IDOR — an ID trusted without verifying the caller owns it), role checks (`isStaff` = owner|admin|employee, `isAdmin`/`canModerate` = owner|admin only), and RLS policy correctness for every touched table.
- **SQL injection**: any raw/interpolated query construction instead of parameterized queries or the Supabase client's query builder.
- **XSS**: unescaped user input rendered into HTML/JSX, any `dangerouslySetInnerHTML` usage.
- **CSRF**: state-changing routes reachable without proper origin/session verification.
- **Secrets**: hardcoded credentials/API keys, secrets echoed in logs or API responses, server-only env vars leaking into the client bundle.

Produce the final output as a prioritized report following `.claude/shared/severity-rubric.md`.
