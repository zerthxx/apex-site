import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Vain admin voi viedä dataa" }, { status: 403 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = supabase
    .from("payments")
    .select("id, amount, currency, status, payment_method, type, created_at, paid_at, refunded_at, invoices(invoice_number), customers(first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const headers = ["ID", "Lasku", "Asiakas", "Sähköposti", "Summa (€)", "Valuutta", "Tila", "Maksutapa", "Luotu", "Maksettu", "Palautettu"];
  const csvRows = rows.map((p) => {
    const inv = p.invoices as any;
    const cus = p.customers as any;
    const cusName = [cus?.first_name, cus?.last_name].filter(Boolean).join(" ") || "";
    return [
      p.id,
      inv?.invoice_number ?? "",
      cusName,
      cus?.email ?? "",
      p.amount,
      p.currency.toUpperCase(),
      p.status,
      p.payment_method ?? "",
      p.created_at ? new Date(p.created_at).toLocaleDateString("fi-FI") : "",
      p.paid_at ? new Date(p.paid_at).toLocaleDateString("fi-FI") : "",
      p.refunded_at ? new Date(p.refunded_at).toLocaleDateString("fi-FI") : "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = [headers.join(","), ...csvRows].join("\n");
  const filename = `maksut_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
