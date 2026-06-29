import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  FolderOpen, FileText, Bell, Monitor, Settings, ArrowRight, Receipt,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [
    profileResult,
    activityResult,
    notifResult,
    sessionResult,
    projectResult,
    quoteResult,
  ] = await Promise.all([
    supabase.from("profiles").select("first_name, role").eq("id", user.id).single(),
    supabase.from("activity_logs").select("id, event_type, event_data, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
    supabase.from("user_sessions").select("*", { count: "exact", head: true }).eq("user_id", user.id).is("logged_out_at", null),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "sent"),
  ]);

  const firstName = profileResult.data?.first_name ?? user.user_metadata?.first_name ?? "siellä";
  const activityLogs = activityResult.data ?? [];
  const unreadCount = notifResult.count ?? 0;
  const sessionCount = sessionResult.count ?? 0;
  const activeProjects = projectResult.count ?? 0;
  const openQuotes = quoteResult.count ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Hyvää huomenta" : hour < 18 ? "Hei" : "Hyvää iltaa";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          {greeting}, {firstName}
        </h1>
        <p className="text-ink-dim text-sm mt-1">
          {new Date().toLocaleDateString("fi-FI", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Projektit"
          value={activeProjects}
          icon={<FolderOpen size={15} />}
          description="Aktiiviset"
          accent="copper"
        />
        <StatCard
          label="Tarjoukset"
          value={openQuotes}
          icon={<FileText size={15} />}
          description="Avoimet"
        />
        <StatCard
          label="Ilmoitukset"
          value={unreadCount}
          icon={<Bell size={15} />}
          description="Lukemattomat"
          accent={unreadCount > 0 ? "copper" : "default"}
        />
        <StatCard
          label="Istunnot"
          value={sessionCount}
          icon={<Monitor size={15} />}
          description="Aktiiviset laitteet"
        />
      </div>

      {/* Two columns: activity + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 rounded-xl bg-elevated border border-wire p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink">Viimeisimmät tapahtumat</h2>
          </div>
          <ActivityFeed logs={activityLogs} emptyText="Kirjaudu sisään niin näet tapahtumahistorian." />
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-elevated border border-wire p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Pika-toiminnot</h2>
            <div className="flex flex-col gap-2">
              {[
                { href: "/portaali/tarjoukset", label: "Katso tarjoukset", icon: <FileText size={15} /> },
                { href: "/portaali/projektit", label: "Omat projektit", icon: <FolderOpen size={15} /> },
                { href: "/portaali/laskut", label: "Laskut", icon: <Receipt size={15} /> },
                { href: "/ilmoitukset", label: "Ilmoitukset", icon: <Bell size={15} /> },
                { href: "/istunnot", label: "Istuntojen hallinta", icon: <Monitor size={15} /> },
                { href: "/asetukset", label: "Tilin asetukset", icon: <Settings size={15} /> },
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-wire hover:bg-surface text-sm text-ink-dim hover:text-ink transition-all duration-150 group"
                >
                  <span className="text-ink-ghost group-hover:text-ink-dim transition-colors shrink-0">{icon}</span>
                  <span className="flex-1">{label}</span>
                  <ArrowRight size={13} className="text-ink-ghost group-hover:text-copper transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
