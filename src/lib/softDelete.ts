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
      console.error(`[cascadeSoftDelete] ${context}:`, r.error.message);
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
 * projects (via cascadeSoftDeleteProject). Restoring the customer does NOT
 * restore any of this; children are restored individually from the Trash.
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
