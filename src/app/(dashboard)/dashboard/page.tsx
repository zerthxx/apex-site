import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  FolderOpen,
  FileText,
  Bell,
  Monitor,
  Settings,
  ArrowRight,
  Receipt,
  Users,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Building2,
  UserPlus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", user.id)
    .single();
  const role = profileData?.role ?? "customer";
  const firstName =
    profileData?.first_name ?? user.user_metadata?.first_name ?? "siellä";
  const isStaff = ["owner", "admin", "employee"].includes(role);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Hyvää huomenta" : hour < 18 ? "Hei" : "Hyvää iltaa";

  if (isStaff) {
    const [
      activityResult,
      notifResult,
      sessionResult,
      activeCustomers,
      leadCount,
      activeProjects,
      pendingQuotes,
      pendingInvoices,
      revenueResult,
      overdueInvoices,
      openTasks,
      recentCustomersResult,
    ] = await Promise.all([
      supabase
        .from("activity_logs")
        .select("id, event_type, event_data, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
      supabase
        .from("user_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("logged_out_at", null),
      supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .is("deleted_at", null),
      supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("status", "lead")
        .is("deleted_at", null),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .not("status", "in", '("completed","cancelled")')
        .is("deleted_at", null),
      supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .is("deleted_at", null),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "sent"])
        .is("deleted_at", null),
      supabase
        .from("invoices")
        .select("amount")
        .eq("status", "paid")
        .is("deleted_at", null),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("status", "overdue")
        .is("deleted_at", null),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .not("status", "eq", "done")
        .is("deleted_at", null),
      supabase
        .from("customers")
        .select("id, first_name, last_name, email, status")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const revenue = (revenueResult.data ?? []).reduce(
      (sum, i) => sum + (i.amount ?? 0),
      0,
    );

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink">
            {greeting}, {firstName}
          </h1>
          <p className="text-ink-dim text-sm mt-1">
            {new Date().toLocaleDateString("fi-FI", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Staff stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Asiakkaat"
            value={activeCustomers.count ?? 0}
            icon={<Users size={15} />}
            description="Aktiiviset"
            accent="copper"
          />
          <StatCard
            label="Liidejä"
            value={leadCount.count ?? 0}
            icon={<Building2 size={15} />}
            description="Odottaa seurantaa"
            accent={leadCount.count ? "copper" : "default"}
          />
          <StatCard
            label="Projektit"
            value={activeProjects.count ?? 0}
            icon={<FolderOpen size={15} />}
            description="Käynnissä"
          />
          <StatCard
            label="Liikevaihto"
            value={`${revenue.toLocaleString("fi-FI")} €`}
            icon={<TrendingUp size={15} />}
            description="Maksettu"
            accent="copper"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Tarjoukset"
            value={pendingQuotes.count ?? 0}
            icon={<FileText size={15} />}
            description="Odottaa vastausta"
            accent={pendingQuotes.count ? "copper" : "default"}
          />
          <StatCard
            label="Avoimet laskut"
            value={pendingInvoices.count ?? 0}
            icon={<Receipt size={15} />}
            description="Odottaa maksua"
            accent={pendingInvoices.count ? "copper" : "default"}
          />
          <StatCard
            label="Myöhästyneet"
            value={overdueInvoices.count ?? 0}
            icon={<AlertCircle size={15} />}
            description="Laskut myöhässä"
            accent={overdueInvoices.count ? "copper" : "default"}
          />
          <StatCard
            label="Tehtävät"
            value={openTasks.count ?? 0}
            icon={<CheckSquare size={15} />}
            description="Avoimet tehtävät"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-elevated border border-wire p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">
              Viimeisimmät tapahtumat
            </h2>
            <ActivityFeed
              logs={activityResult.data ?? []}
              emptyText="Ei tapahtumahistoriaa."
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-elevated border border-wire p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-ink">
                  Viimeisimmät asiakkaat
                </h2>
                <Link
                  href="/crm/asiakkaat"
                  className="text-xs text-ink-ghost hover:text-copper transition-colors"
                >
                  Kaikki
                </Link>
              </div>
              <div className="flex flex-col gap-1">
                {(recentCustomersResult.data ?? []).length === 0 && (
                  <p className="text-sm text-ink-ghost py-4 text-center">
                    Ei asiakkaita vielä
                  </p>
                )}
                {(recentCustomersResult.data ?? []).map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/crm/asiakkaat/${c.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-wire hover:bg-surface text-sm text-ink-dim hover:text-ink transition-all duration-150 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0">
                      <span className="text-copper text-xs font-bold">
                        {(
                          c.first_name?.[0] ??
                          c.email?.[0] ??
                          "?"
                        ).toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 truncate">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                        c.email ||
                        "Asiakas"}
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-ink-ghost group-hover:text-copper transition-colors shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-elevated border border-wire p-5">
              <h2 className="text-sm font-semibold text-ink mb-4">
                Pikalinkit
              </h2>
              <div className="flex flex-col gap-2">
                {[
                  {
                    href: "/crm/liidit",
                    label: "Liidit",
                    icon: <UserPlus size={15} />,
                  },
                  {
                    href: "/crm/asiakkaat",
                    label: "Kaikki asiakkaat",
                    icon: <Users size={15} />,
                  },
                  {
                    href: "/tehtavat",
                    label: "Tehtävät",
                    icon: <CheckSquare size={15} />,
                  },
                  {
                    href: "/ilmoitukset",
                    label: "Ilmoitukset",
                    icon: <Bell size={15} />,
                  },
                ].map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-wire hover:bg-surface text-sm text-ink-dim hover:text-ink transition-all duration-150 group"
                  >
                    <span className="text-ink-ghost group-hover:text-ink-dim transition-colors shrink-0">
                      {icon}
                    </span>
                    <span className="flex-1">{label}</span>
                    <ArrowRight
                      size={13}
                      className="text-ink-ghost group-hover:text-copper transition-colors shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer dashboard
  const { data: customerRecord } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const cid = customerRecord?.id;

  const [
    activityResult,
    notifResult,
    sessionResult,
    myProjects,
    myQuotes,
    myInvoices,
  ] = await Promise.all([
    supabase
      .from("activity_logs")
      .select("id, event_type, event_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
    supabase
      .from("user_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("logged_out_at", null),
    cid
      ? supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", cid)
          .not("status", "eq", "cancelled")
          .is("deleted_at", null)
      : Promise.resolve({ count: 0 }),
    cid
      ? supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", cid)
          .is("deleted_at", null)
      : Promise.resolve({ count: 0 }),
    cid
      ? supabase
          .from("invoices")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", cid)
          .in("status", ["pending", "sent"])
          .is("deleted_at", null)
      : Promise.resolve({ count: 0 }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          {greeting}, {firstName}
        </h1>
        <p className="text-ink-dim text-sm mt-1">
          {new Date().toLocaleDateString("fi-FI", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Projektit"
          value={myProjects.count ?? 0}
          icon={<FolderOpen size={15} />}
          description="Käynnissä"
          accent="copper"
        />
        <StatCard
          label="Tarjoukset"
          value={myQuotes.count ?? 0}
          icon={<FileText size={15} />}
          description="Yhteensä"
        />
        <StatCard
          label="Avoimet laskut"
          value={myInvoices.count ?? 0}
          icon={<Receipt size={15} />}
          description="Odottaa maksua"
          accent={(myInvoices.count ?? 0) > 0 ? "copper" : "default"}
        />
        <StatCard
          label="Ilmoitukset"
          value={notifResult.count ?? 0}
          icon={<Bell size={15} />}
          description="Lukemattomat"
          accent={(notifResult.count ?? 0) > 0 ? "copper" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-elevated border border-wire p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Viimeisimmät tapahtumat
          </h2>
          <ActivityFeed
            logs={activityResult.data ?? []}
            emptyText="Kirjaudu sisään niin näet tapahtumahistorian."
          />
        </div>
        <div className="rounded-xl bg-elevated border border-wire p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">
            Pika-toiminnot
          </h2>
          <div className="flex flex-col gap-2">
            {[
              {
                href: "/portaali/tarjoukset",
                label: "Katso tarjoukset",
                icon: <FileText size={15} />,
              },
              {
                href: "/portaali/projektit",
                label: "Omat projektit",
                icon: <FolderOpen size={15} />,
              },
              {
                href: "/portaali/laskut",
                label: "Laskut",
                icon: <Receipt size={15} />,
              },
              {
                href: "/portaali/tiedostot",
                label: "Tiedostot",
                icon: <Monitor size={15} />,
              },
              {
                href: "/ilmoitukset",
                label: "Ilmoitukset",
                icon: <Bell size={15} />,
              },
              {
                href: "/asetukset/profiili",
                label: "Tilin asetukset",
                icon: <Settings size={15} />,
              },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-wire hover:bg-surface text-sm text-ink-dim hover:text-ink transition-all duration-150 group"
              >
                <span className="text-ink-ghost group-hover:text-ink-dim transition-colors shrink-0">
                  {icon}
                </span>
                <span className="flex-1">{label}</span>
                <ArrowRight
                  size={13}
                  className="text-ink-ghost group-hover:text-copper transition-colors shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
