import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytiikka — Apex Site" };

async function getStats() {
  const supabase = await createClient();
  const [
    { count: customers },
    { count: projects },
    { count: quotes },
    { count: tasks },
    { data: recentProjects },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("name, status, progress_pct, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("customers").select("full_name, email, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  return { customers: customers ?? 0, projects: projects ?? 0, quotes: quotes ?? 0, tasks: tasks ?? 0, recentProjects: recentProjects ?? [], recentCustomers: recentCustomers ?? [] };
}

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-ink-ghost", development: "bg-copper", testing: "bg-teal-400",
  review: "bg-amber-400", completed: "bg-ok", cancelled: "bg-bad",
  active: "bg-ok", inactive: "bg-ink-ghost", lead: "bg-copper",
};
const STATUS_FI: Record<string, string> = {
  planning: "Suunnittelu", development: "Kehitys", testing: "Testaus",
  review: "Arviointi", completed: "Valmis", cancelled: "Peruttu",
  active: "Aktiivinen", inactive: "Ei aktiivinen", lead: "Liidi",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-elevated border border-wire rounded-xl p-5">
      <p className="text-xs text-ink-ghost font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-ink mt-2">{value}</p>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-32 mt-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-ink-ghost">{d.value}</span>
          <div
            className={`w-full rounded-t-md transition-all ${d.color}`}
            style={{ height: `${Math.round((d.value / max) * 100)}%`, minHeight: d.value > 0 ? "4px" : "0" }}
          />
          <span className="text-[10px] text-ink-ghost text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AnalytiikkaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) redirect("/dashboard");

  const stats = await getStats();

  const barData = [
    { label: "Asiakkaat", value: stats.customers, color: "bg-copper" },
    { label: "Projektit", value: stats.projects, color: "bg-teal-400" },
    { label: "Tarjoukset", value: stats.quotes, color: "bg-amber-400" },
    { label: "Tehtävät", value: stats.tasks, color: "bg-ok" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Analytiikka</h1>
        <p className="text-sm text-ink-ghost mt-1">Yleiskatsaus alustan tilastotietoihin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Asiakkaat" value={stats.customers} />
        <StatCard label="Projektit" value={stats.projects} />
        <StatCard label="Tarjoukset" value={stats.quotes} />
        <StatCard label="Tehtävät" value={stats.tasks} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <p className="text-sm font-semibold text-ink">Yhteenveto (kaavio)</p>
          <BarChart data={barData} />
        </div>

        <div className="bg-elevated border border-wire rounded-xl p-5">
          <p className="text-sm font-semibold text-ink mb-4">Viimeisimmät projektit</p>
          <div className="flex flex-col gap-3">
            {stats.recentProjects.length === 0 && <p className="text-sm text-ink-ghost">Ei projekteja</p>}
            {stats.recentProjects.map((p: any) => (
              <div key={p.name + p.created_at} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[p.status] ?? "bg-ink-ghost"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{p.name}</p>
                  <p className="text-xs text-ink-ghost">{STATUS_FI[p.status] ?? p.status}</p>
                </div>
                <div className="w-16 shrink-0">
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-copper rounded-full" style={{ width: `${p.progress_pct ?? 0}%` }} />
                  </div>
                  <p className="text-[10px] text-ink-ghost text-right mt-0.5">{p.progress_pct ?? 0}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-elevated border border-wire rounded-xl p-5">
        <p className="text-sm font-semibold text-ink mb-4">Viimeisimmät asiakkaat</p>
        <div className="flex flex-col divide-y divide-wire/50">
          {stats.recentCustomers.length === 0 && <p className="text-sm text-ink-ghost py-2">Ei asiakkaita</p>}
          {stats.recentCustomers.map((c: any) => (
            <div key={c.email} className="flex items-center gap-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-copper/20 border border-copper/30 flex items-center justify-center shrink-0">
                <span className="text-copper text-xs font-bold leading-none">{c.full_name?.[0]?.toUpperCase() ?? "?"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{c.full_name}</p>
                <p className="text-xs text-ink-ghost">{c.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] === "bg-ok" ? "bg-ok/15 text-ok" : STATUS_COLORS[c.status] === "bg-copper" ? "bg-copper/15 text-copper" : "bg-wire text-ink-ghost"}`}>
                {STATUS_FI[c.status] ?? c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
