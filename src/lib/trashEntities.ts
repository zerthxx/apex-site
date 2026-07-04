import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export interface TrashRow {
  id: string;
  [key: string]: unknown;
}

export interface TrashEntityConfig {
  table: string;
  label: string;
  selectColumns: string;
  searchColumns: string[];
  getLabel: (row: TrashRow) => string;
  getEntityLabel?: (row: TrashRow) => string;
}

export const TRASH_ENTITIES: Record<string, TrashEntityConfig> = {
  customers: {
    table: "customers",
    label: "Asiakas",
    selectColumns:
      "id, first_name, last_name, email, status, deleted_at, deleted_by",
    searchColumns: ["first_name", "last_name", "email"],
    getLabel: (r) =>
      [r.first_name, r.last_name].filter(Boolean).join(" ") ||
      (r.email as string) ||
      "Asiakas",
    getEntityLabel: (r) => (r.status === "lead" ? "Liidi" : "Asiakas"),
  },
  companies: {
    table: "companies",
    label: "Yritys",
    selectColumns: "id, name, email, deleted_at, deleted_by",
    searchColumns: ["name", "email"],
    getLabel: (r) => (r.name as string) ?? "Yritys",
  },
  quotes: {
    table: "quotes",
    label: "Tarjous",
    selectColumns: "id, title, amount, status, deleted_at, deleted_by",
    searchColumns: ["title"],
    getLabel: (r) => (r.title as string) ?? "Tarjous",
  },
  projects: {
    table: "projects",
    label: "Projekti",
    selectColumns: "id, name, status, deleted_at, deleted_by",
    searchColumns: ["name"],
    getLabel: (r) => (r.name as string) ?? "Projekti",
  },
  invoices: {
    table: "invoices",
    label: "Lasku",
    selectColumns: "id, invoice_number, amount, deleted_at, deleted_by",
    searchColumns: ["invoice_number"],
    getLabel: (r) => (r.invoice_number as string) ?? "Lasku",
  },
  payments: {
    table: "payments",
    label: "Maksu",
    selectColumns: "id, amount, payment_method, deleted_at, deleted_by",
    searchColumns: ["payment_method"],
    getLabel: (r) =>
      r.amount != null
        ? `${Number(r.amount).toLocaleString("fi-FI")} € ${r.payment_method ? `(${r.payment_method})` : ""}`.trim()
        : "Maksu",
  },
  tasks: {
    table: "tasks",
    label: "Tehtävä",
    selectColumns: "id, title, deleted_at, deleted_by",
    searchColumns: ["title"],
    getLabel: (r) => (r.title as string) ?? "Tehtävä",
  },
  calendar_events: {
    table: "calendar_events",
    label: "Kalenteritapahtuma",
    selectColumns: "id, title, deleted_at, deleted_by",
    searchColumns: ["title"],
    getLabel: (r) => (r.title as string) ?? "Tapahtuma",
  },
  project_files: {
    table: "project_files",
    label: "Tiedosto",
    selectColumns: "id, name, deleted_at, deleted_by",
    searchColumns: ["name"],
    getLabel: (r) => (r.name as string) ?? "Tiedosto",
  },
  project_comments: {
    table: "project_comments",
    label: "Kommentti",
    selectColumns: "id, body, deleted_at, deleted_by",
    searchColumns: ["body"],
    getLabel: (r) => {
      const body = (r.body as string) ?? "";
      return body.length > 60 ? body.slice(0, 60) + "…" : body || "Kommentti";
    },
  },
  notifications: {
    table: "notifications",
    label: "Ilmoitus",
    selectColumns: "id, title, body, deleted_at, deleted_by",
    searchColumns: ["title", "body"],
    getLabel: (r) => (r.title as string) ?? "Ilmoitus",
  },
  lead_requests: {
    table: "lead_requests",
    label: "Tarjouspyyntö",
    selectColumns:
      "id, first_name, last_name, email, service, deleted_at, deleted_by",
    searchColumns: ["first_name", "last_name", "email", "service"],
    getLabel: (r) => {
      const name =
        [r.first_name, r.last_name].filter(Boolean).join(" ") ||
        (r.email as string);
      return r.service ? `${name} — ${r.service}` : (name ?? "Tarjouspyyntö");
    },
  },
  customer_notes: {
    table: "customer_notes",
    label: "Muistiinpano",
    selectColumns: "id, body, deleted_at, deleted_by",
    searchColumns: ["body"],
    getLabel: (r) => {
      const body = (r.body as string) ?? "";
      return body.length > 60
        ? body.slice(0, 60) + "…"
        : body || "Muistiinpano";
    },
  },
};

/**
 * Bottom-up hard-delete of a project's already-trashed children only. Never
 * touches a live (non-trashed) child — if one exists, the caller's own
 * project delete will hit the still-RESTRICT FK naturally, which is the
 * intended safety backstop, not a bug.
 */
async function purgeProjectChildren(
  supabase: SupabaseClient,
  projectId: string,
): Promise<{ quoteIds: string[] }> {
  const { data: trashedInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("project_id", projectId)
    .not("deleted_at", "is", null);
  const invoiceIds = (trashedInvoices ?? []).map((r) => r.id);

  const { data: trashedQuotes } = await supabase
    .from("quotes")
    .select("id")
    .eq("project_id", projectId)
    .not("deleted_at", "is", null);
  const quoteIds = (trashedQuotes ?? []).map((r) => r.id);

  if (invoiceIds.length) {
    await supabase
      .from("payments")
      .delete()
      .in("invoice_id", invoiceIds)
      .not("deleted_at", "is", null);
    await supabase
      .from("project_files")
      .delete()
      .in("invoice_id", invoiceIds)
      .not("deleted_at", "is", null);
  }
  if (quoteIds.length) {
    await supabase
      .from("project_files")
      .delete()
      .in("quote_id", quoteIds)
      .not("deleted_at", "is", null);
  }

  await supabase
    .from("project_files")
    .delete()
    .eq("project_id", projectId)
    .not("deleted_at", "is", null);
  await supabase
    .from("project_comments")
    .delete()
    .eq("project_id", projectId)
    .not("deleted_at", "is", null);
  await supabase
    .from("tasks")
    .delete()
    .eq("project_id", projectId)
    .not("deleted_at", "is", null);
  await supabase
    .from("calendar_events")
    .delete()
    .eq("related_project_id", projectId)
    .not("deleted_at", "is", null);

  if (invoiceIds.length) {
    await supabase.from("invoices").delete().in("id", invoiceIds);
  }

  // projects.quote_id and quotes.project_id reference each other (an accepted
  // quote auto-creates its project, and the two stay cross-linked) — neither
  // row can be hard-deleted while the other still points at it. Break the
  // cycle before the caller deletes either side.
  if (quoteIds.length) {
    await supabase
      .from("quotes")
      .update({ project_id: null })
      .in("id", quoteIds);
  }
  await supabase
    .from("projects")
    .update({ quote_id: null })
    .eq("id", projectId);

  return { quoteIds };
}

async function purgeCustomerChildren(
  supabase: SupabaseClient,
  customerId: string,
) {
  await supabase
    .from("payments")
    .delete()
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);
  await supabase
    .from("project_files")
    .delete()
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);

  const { data: trashedProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);

  for (const project of trashedProjects ?? []) {
    const { quoteIds } = await purgeProjectChildren(supabase, project.id);
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) throw error;
    if (quoteIds.length)
      await supabase.from("quotes").delete().in("id", quoteIds);
  }

  await supabase
    .from("invoices")
    .delete()
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);
  await supabase
    .from("quotes")
    .delete()
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);
  await supabase
    .from("customer_notes")
    .delete()
    .eq("customer_id", customerId)
    .not("deleted_at", "is", null);
  // lead_requests.customer_id is ON DELETE CASCADE — cleaned up automatically
  // when the customer row itself is deleted below.
}

/**
 * Permanently deletes an already-trashed row. For customers/projects this
 * first purges their already-trashed children (bottom-up); for every other
 * entity it's a direct single-row delete. If a LIVE (never-trashed) child
 * still references the row, the final DELETE fails with a Postgres FK
 * violation (23503) — surfaced by the caller as "still has active related
 * records" rather than partially succeeding.
 */
export async function permanentlyDeleteEntity(
  supabase: SupabaseClient,
  entityType: string,
  id: string,
): Promise<{ error: { message: string; code?: string } | null }> {
  const cfg = TRASH_ENTITIES[entityType];
  if (!cfg) return { error: { message: "Tuntematon tyyppi" } };

  try {
    if (entityType === "projects") {
      const { quoteIds } = await purgeProjectChildren(supabase, id);
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .not("deleted_at", "is", null);
      if (error) return { error };
      if (quoteIds.length)
        await supabase.from("quotes").delete().in("id", quoteIds);
      return { error: null };
    }

    if (entityType === "customers") {
      await purgeCustomerChildren(supabase, id);
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .not("deleted_at", "is", null);
      return { error };
    }

    if (entityType === "invoices") {
      // payments.invoice_id is ON DELETE SET NULL, not RESTRICT, so a live
      // (never-trashed) payment wouldn't naturally block this delete — it
      // would just get silently detached from its invoice. Check explicitly
      // so this behaves the same as every other "still has active related
      // records" case instead of quietly eroding data integrity.
      const { data: livePayment } = await supabase
        .from("payments")
        .select("id")
        .eq("invoice_id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (livePayment) {
        return {
          error: { message: "Invoice has an active payment", code: "23503" },
        };
      }
    }

    if (entityType === "project_files") {
      // The DB row is only one half of "the file" — permanent delete must
      // also remove the underlying Storage object, or it survives forever
      // even though the Owner was told it was destroyed.
      const { data: file } = await supabase
        .from("project_files")
        .select("storage_path")
        .eq("id", id)
        .single();
      const { error } = await supabase
        .from("project_files")
        .delete()
        .eq("id", id)
        .not("deleted_at", "is", null);
      if (error) return { error };
      if (file?.storage_path) {
        // The bucket is private — removal needs the service-role client, the
        // same as the existing download/upload routes (a normal session
        // can't reach Storage directly for this bucket).
        await createAdminClient()
          .storage.from("project-files")
          .remove([file.storage_path]);
      }
      return { error: null };
    }

    const { error } = await supabase
      .from(cfg.table)
      .delete()
      .eq("id", id)
      .not("deleted_at", "is", null);
    return { error };
  } catch (e) {
    const err = e as { message?: string; code?: string };
    return { error: { message: err.message ?? "Virhe", code: err.code } };
  }
}
