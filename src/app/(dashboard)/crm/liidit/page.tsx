import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomersClient } from "../asiakkaat/CustomersClient";

export const metadata = { title: "Liidit — Apex Site" };

interface LeadRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  companies: { id: string; name: string } | null;
}

function normalizeCompany(
  companies:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null
    | undefined,
): { id: string; name: string } | null {
  if (Array.isArray(companies)) return companies[0] ?? null;
  return companies ?? null;
}

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!["owner", "admin", "employee"].includes(profile?.role ?? ""))
    redirect("/dashboard");

  const { data: leads } = await supabase
    .from("customers")
    .select(
      `id, first_name, last_name, email, phone, status, created_at, companies(id, name)`,
    )
    .eq("status", "lead")
    .order("created_at", { ascending: false })
    .limit(100);

  // Every quote-request submission is also logged here (migration 012),
  // independent of the matched customer's real status — this is what makes a
  // new request from an already-"active" paying customer show up on this
  // page too, without relabeling them as an unconfirmed lead. Ignored (data
  // comes back empty) until migration 012 has been applied.
  const { data: requests } = await supabase
    .from("lead_requests")
    .select(
      "id, customer_id, first_name, last_name, email, phone, company, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const requestedCustomerIds = new Set(
    (requests ?? [])
      .map((r) => r.customer_id)
      .filter((id): id is string => !!id),
  );

  // A customer whose status is "lead" but who has no logged request (e.g.
  // added directly via the CRM rather than through the website form) still
  // needs to show up here.
  const manualLeadRows: LeadRow[] = (leads ?? [])
    .filter((c) => !requestedCustomerIds.has(c.id))
    .map((c) => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      created_at: c.created_at,
      companies: normalizeCompany(c.companies),
    }));

  // Collapse repeat requests from the same customer down to their most recent
  // one — requests are already ordered newest-first, so the first occurrence
  // per customer_id wins.
  const seenCustomerIds = new Set<string>();
  const requestRows: LeadRow[] = [];
  for (const r of requests ?? []) {
    if (r.customer_id) {
      if (seenCustomerIds.has(r.customer_id)) continue;
      seenCustomerIds.add(r.customer_id);
    }
    requestRows.push({
      id: r.customer_id ?? r.id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      phone: r.phone,
      status: "lead",
      created_at: r.created_at,
      companies: r.company ? { id: "", name: r.company } : null,
    });
  }

  const combined = [...requestRows, ...manualLeadRows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Liidit</h1>
        <p className="text-sm text-ink-ghost mt-1">
          Ei vielä vahvistetut asiakkaat ja uudet tarjouspyynnöt
        </p>
      </div>
      <CustomersClient
        initial={combined}
        initialStatusFilter="lead"
        title="Hae liidejä..."
        emptyText="Ei liidejä vielä"
      />
    </div>
  );
}
