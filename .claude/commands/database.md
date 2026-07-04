---
description: Schema design, migrations, indexes, and RLS policies via the database-engineer subagent
argument-hint: [schema/migration change description]
---

Change: $ARGUMENTS

Dispatch the `database-engineer` subagent to:

1. **Design the schema change** (tables, columns, types, constraints, relationships) matching this project's existing conventions.
2. **Write the migration file** following the existing `supabase/migrations/NNN_*.sql` numbering/format — and state explicitly that it must be manually run in the Supabase SQL Editor, since migrations here are never auto-applied.
3. **Design/verify the RLS policy** for every touched table in the same change set — a new user-scoped table without a policy is an incomplete change, not a follow-up.
4. **Check indexes** against real query patterns, both new and existing.
5. **Verify relationships** (foreign keys, cascade behavior) and flag any schema drift: code referencing columns/tables absent from migrations, no-op `CREATE TABLE IF NOT EXISTS` migrations, or duplicate table definitions.

For any change beyond a small, contained addition, apply the plan-gate pattern in `.claude/shared/plan-gate.md`: present the schema design and migration before running anything destructive or before the user applies it.

Present the migration file and RLS policy to the user with the explicit manual-apply instruction — do not report this as done until that's either completed or clearly flagged as pending.
