import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");
  const status = req.nextUrl.searchParams.get("status");
  const customerId = req.nextUrl.searchParams.get("customer_id");

  let query = supabase
    .from("invoices")
    .select(`
      id, invoice_number, amount, status, due_date, paid_at, created_at,
      customers(id, first_name, last_name, email),
      projects(id, name)
    `)
    .order("created_at", { ascending: false });

  if (!isStaff) {
    const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).single();
    if (!customer) return NextResponse.json({ invoices: [] });
    query = query.eq("customer_id", customer.id);
  }

  if (status) query = query.eq("status", status);
  if (customerId && isStaff) query = query.eq("customer_id", customerId);

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.customer_id) return NextResponse.json({ error: "Asiakas vaaditaan" }, { status: 400 });

  // Auto-generate invoice number: INV-YYYYMM-NNN
  const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true });
  const month = new Date().toISOString().slice(0, 7).replace("-", "");
  const invoiceNumber = `INV-${month}-${String((count ?? 0) + 1).padStart(3, "0")}`;

  const { data, error } = await supabase
    .from("invoices")
    .insert({ ...body, invoice_number: body.invoice_number ?? invoiceNumber, status: body.status ?? "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify customer when invoice is sent
  if (data.status === "sent" && data.customer_id) {
    const { data: customer } = await supabase.from("customers").select("user_id").eq("id", data.customer_id).single();
    if (customer?.user_id) {
      await supabase.from("notifications").insert({
        user_id: customer.user_id,
        type: "invoice",
        title: "Uusi lasku",
        body: `Lasku ${data.invoice_number}${data.amount ? ` — ${data.amount.toLocaleString("fi-FI")} €` : ""}`,
        href: `/portaali/laskut`,
      });
    }
  }

  return NextResponse.json({ invoice: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  if (updates.status === "paid") updates.paid_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice: data });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
