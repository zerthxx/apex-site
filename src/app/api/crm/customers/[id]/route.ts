import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

async function getStaffUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, profile };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const [customerRes, quotesRes, projectsRes, invoicesRes] = await Promise.all([
    supabase.from("customers").select(`*, companies(id, name)`).eq("id", id).single(),
    supabase.from("quotes").select("id, title, status, amount, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("projects").select("id, name, status, progress_pct, deadline").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, invoice_number, status, amount, due_date").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (customerRes.error) return NextResponse.json({ error: "Asiakasta ei löydy" }, { status: 404 });

  return NextResponse.json({
    customer: customerRes.data,
    quotes: quotesRes.data ?? [],
    projects: projectsRes.data ?? [],
    invoices: invoicesRes.data ?? [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = await supabase
    .from("customers")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "customer_updated", { customer_id: id });
  return NextResponse.json({ customer: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "customer_deleted", { customer_id: id });
  return NextResponse.json({ success: true });
}
