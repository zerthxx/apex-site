import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");
  if (!isStaff) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  const [customers, companies, projects, quotes, files] = await Promise.all([
    supabase
      .from("customers")
      .select("id, first_name, last_name, email")
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("companies")
      .select("id, name, email")
      .or(`name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("projects")
      .select("id, name, status")
      .ilike("name", pattern)
      .limit(5),
    supabase
      .from("quotes")
      .select("id, title, status")
      .ilike("title", pattern)
      .limit(5),
    supabase
      .from("project_files")
      .select("id, name, project_id")
      .ilike("name", pattern)
      .limit(5),
  ]);

  const STATUS_FI: Record<string, string> = {
    draft: "Luonnos", sent: "Lähetetty", accepted: "Hyväksytty", rejected: "Hylätty",
    planning: "Suunnittelu", development: "Kehitys", testing: "Testaus",
    review: "Katselmus", completed: "Valmis", cancelled: "Peruttu",
    active: "Aktiivinen", inactive: "Ei aktiivinen", lead: "Liidi",
  };

  const results = [
    ...(customers.data ?? []).map((c) => ({
      category: "customers",
      id: c.id,
      title: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.email,
      subtitle: c.email,
      href: `/crm/asiakkaat/${c.id}`,
    })),
    ...(companies.data ?? []).map((c) => ({
      category: "companies",
      id: c.id,
      title: c.name,
      subtitle: c.email,
      href: `/crm/yritykset/${c.id}`,
    })),
    ...(projects.data ?? []).map((p) => ({
      category: "projects",
      id: p.id,
      title: p.name,
      subtitle: STATUS_FI[p.status] ?? p.status,
      href: `/portaali/projektit/${p.id}`,
    })),
    ...(quotes.data ?? []).map((q) => ({
      category: "quotes",
      id: q.id,
      title: q.title,
      subtitle: STATUS_FI[q.status] ?? q.status,
      href: `/portaali/tarjoukset/${q.id}`,
    })),
    ...(files.data ?? []).map((f) => ({
      category: "files",
      id: f.id,
      title: f.name,
      subtitle: f.project_id ? "Projektin tiedosto" : undefined,
      href: `/portaali/tiedostot`,
    })),
  ];

  return NextResponse.json({ results });
}
