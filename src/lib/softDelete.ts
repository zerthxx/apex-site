import type { SupabaseClient } from "@supabase/supabase-js";

interface CascadeStepResult {
  error: { message: string } | null;
}

/** Logs (doesn't throw) any failed step so a broken/missing RLS policy on a
 * child table surfaces loudly instead of silently leaving orphaned live
 * children under a "deleted" parent. */
function logCascadeErrors(context: string, results: CascadeStepResult[]) {
  for (const r of results) {
    if (r.error) {
      console.error(`[cascade] ${context}:`, r.error.message);
    }
  }
}

/**
 * Soft-deletes a single row. deleted_by is set server-side by the
 * guard_soft_delete/guard_own_soft_delete trigger from auth.uid() — never
 * passed from the client, so it can't be forged.
 */
export async function softDelete(
  supabase: SupabaseClient,
  table: string,
  id: string,
) {
  return supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
}

/**
 * Cascades a soft-delete to everything under a project: tasks, calendar
 * events, files, comments, quotes and invoices tied to it. Each step is
 * idempotent (guarded by deleted_at IS NULL), so it's safe to re-run if a
 * prior attempt partially failed.
 */
export async function cascadeSoftDeleteProject(
  supabase: SupabaseClient,
  projectId: string,
) {
  const now = new Date().toISOString();
  const results = await Promise.all([
    supabase
      .from("tasks")
      .update({ deleted_at: now })
      .eq("project_id", projectId)
      .is("deleted_at", null),
    supabase
      .from("calendar_events")
      .update({ deleted_at: now })
      .eq("related_project_id", projectId)
      .is("deleted_at", null),
    supabase
      .from("project_files")
      .update({ deleted_at: now })
      .eq("project_id", projectId)
      .is("deleted_at", null),
    supabase
      .from("project_comments")
      .update({ deleted_at: now })
      .eq("project_id", projectId)
      .is("deleted_at", null),
    supabase
      .from("invoices")
      .update({ deleted_at: now })
      .eq("project_id", projectId)
      .is("deleted_at", null),
    supabase
      .from("quotes")
      .update({ deleted_at: now })
      .eq("project_id", projectId)
      .is("deleted_at", null),
  ]);
  logCascadeErrors(`project ${projectId}`, results);
}

/**
 * Cascades a soft-delete to everything under a customer: their quotes,
 * invoices, payments, and project_files linked directly to the customer, plus
 * — transitively — each of their (live) projects and everything under those
 * projects (via cascadeSoftDeleteProject). Restoring the customer via
 * cascadeRestoreCustomer below undoes this cascade — see that function's
 * docstring for what "undoes" means when a child was independently trashed.
 */
export async function cascadeSoftDeleteCustomer(
  supabase: SupabaseClient,
  customerId: string,
) {
  const now = new Date().toISOString();

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("customer_id", customerId)
    .is("deleted_at", null);

  for (const project of projects ?? []) {
    await cascadeSoftDeleteProject(supabase, project.id);
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: now })
      .eq("id", project.id)
      .is("deleted_at", null);
    if (error)
      console.error(
        `[cascadeSoftDelete] customer ${customerId} -> project ${project.id}:`,
        error.message,
      );
  }

  const results = await Promise.all([
    supabase
      .from("quotes")
      .update({ deleted_at: now })
      .eq("customer_id", customerId)
      .is("deleted_at", null),
    supabase
      .from("invoices")
      .update({ deleted_at: now })
      .eq("customer_id", customerId)
      .is("deleted_at", null),
    supabase
      .from("payments")
      .update({ deleted_at: now })
      .eq("customer_id", customerId)
      .is("deleted_at", null),
    supabase
      .from("project_files")
      .update({ deleted_at: now })
      .eq("customer_id", customerId)
      .is("deleted_at", null),
    supabase
      .from("customer_notes")
      .update({ deleted_at: now })
      .eq("customer_id", customerId)
      .is("deleted_at", null),
    supabase
      .from("lead_requests")
      .update({ deleted_at: now })
      .eq("customer_id", customerId)
      .is("deleted_at", null),
  ]);
  logCascadeErrors(`customer ${customerId}`, results);
}

/**
 * Symmetric counterpart to cascadeSoftDeleteProject: restores every
 * currently-trashed child tied to this project. Mirrors the delete cascade
 * exactly (same tables, same FK columns), so a restore undoes what the
 * matching delete cascade did.
 */
export async function cascadeRestoreProject(
  supabase: SupabaseClient,
  projectId: string,
) {
  const results = await Promise.all([
    supabase
      .from("tasks")
      .update({ deleted_at: null })
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
    supabase
      .from("calendar_events")
      .update({ deleted_at: null })
      .eq("related_project_id", projectId)
      .not("deleted_at", "is", null),
    supabase
      .from("project_files")
      .update({ deleted_at: null })
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
    supabase
      .from("project_comments")
      .update({ deleted_at: null })
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
    supabase
      .from("invoices")
      .update({ deleted_at: null })
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
    supabase
      .from("quotes")
      .update({ deleted_at: null })
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
  ]);
  logCascadeErrors(`restore project ${projectId}`, results);
}

/**
 * Symmetric counterpart to cascadeSoftDeleteCustomer: restores every
 * currently-trashed child tied to this customer, including — transitively —
 * each of their trashed projects and everything under those projects (via
 * cascadeRestoreProject). Restoring a customer from the Trash undoes exactly
 * what trashing them cascaded, rather than leaving cascaded children stuck in
 * the Trash to be restored one by one.
 *
 * Caveat: this restores every row currently matching the FK, not only the
 * ones trashed in the same cascade — if a project was independently trashed
 * before its customer was, restoring the customer restores that project too.
 * There's no "trashed as part of this cascade" marker to distinguish the two
 * cases, so this mirrors cascadeSoftDelete*'s own "every live/trashed row
 * matching the FK" semantics rather than tracking cascade membership.
 */
export async function cascadeRestoreCustomer(
  supabase: SupabaseClient,
  customerId: string,
) {
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);

  for (const project of projects ?? []) {
    await cascadeRestoreProject(supabase, project.id);
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: null })
      .eq("id", project.id)
      .not("deleted_at", "is", null);
    if (error)
      console.error(
        `[cascadeRestore] customer ${customerId} -> project ${project.id}:`,
        error.message,
      );
  }

  const results = await Promise.all([
    supabase
      .from("quotes")
      .update({ deleted_at: null })
      .eq("customer_id", customerId)
      .not("deleted_at", "is", null),
    supabase
      .from("invoices")
      .update({ deleted_at: null })
      .eq("customer_id", customerId)
      .not("deleted_at", "is", null),
    supabase
      .from("payments")
      .update({ deleted_at: null })
      .eq("customer_id", customerId)
      .not("deleted_at", "is", null),
    supabase
      .from("project_files")
      .update({ deleted_at: null })
      .eq("customer_id", customerId)
      .not("deleted_at", "is", null),
    supabase
      .from("customer_notes")
      .update({ deleted_at: null })
      .eq("customer_id", customerId)
      .not("deleted_at", "is", null),
    supabase
      .from("lead_requests")
      .update({ deleted_at: null })
      .eq("customer_id", customerId)
      .not("deleted_at", "is", null),
  ]);
  logCascadeErrors(`restore customer ${customerId}`, results);
}
