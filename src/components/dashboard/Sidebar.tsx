"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, FolderOpen, Receipt, Paperclip,
  Bell, Monitor, Settings, Users, LogOut, X, ShieldCheck,
  Building2, Briefcase, CheckSquare, Calendar, BarChart2, CreditCard, Mail, Wrench,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SidebarLink } from "./SidebarLink";
import { RoleBadge } from "./RoleBadge";

interface SidebarProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  role?: string;
  unreadNotifications?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  firstName,
  lastName,
  email,
  role = "customer",
  unreadNotifications = 0,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const router = useRouter();
  const isAdmin = role === "owner" || role === "admin";
  const isStaff = role === "owner" || role === "admin" || role === "employee";

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("apex-session");
    router.push("/");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-wire shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Apex Site" width={30} height={30} className="h-7 w-auto" />
          <span className="font-display font-bold text-base text-ink">Apex Site</span>
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden text-ink-ghost hover:text-ink transition-colors p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        <SidebarLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} exact onClick={onMobileClose} />

        {isStaff && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-ghost px-3 pt-4 pb-1">Business</p>
            <SidebarLink href="/crm/asiakkaat" label="Asiakkaat" icon={<Building2 size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/crm/yritykset" label="Yritykset" icon={<Briefcase size={16} />} onClick={onMobileClose} />
          </>
        )}

        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-ghost px-3 pt-4 pb-1">Asiakasportaali</p>
        <SidebarLink href="/portaali" label="Yhteenveto" icon={<FolderOpen size={16} />} exact onClick={onMobileClose} />
        <SidebarLink href="/portaali/tarjoukset" label="Tarjoukset" icon={<FileText size={16} />} onClick={onMobileClose} />
        <SidebarLink href="/portaali/projektit" label="Projektit" icon={<FolderOpen size={16} />} onClick={onMobileClose} />
        <SidebarLink href="/portaali/laskut" label="Laskut" icon={<Receipt size={16} />} onClick={onMobileClose} />
        <SidebarLink href="/portaali/maksut" label="Maksut" icon={<CreditCard size={16} />} onClick={onMobileClose} />
        <SidebarLink href="/portaali/tiedostot" label="Tiedostot" icon={<Paperclip size={16} />} onClick={onMobileClose} />

        {isStaff && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-ghost px-3 pt-4 pb-1">Hallinta</p>
            <SidebarLink href="/tehtavat" label="Tehtävät" icon={<CheckSquare size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/kalenteri" label="Kalenteri" icon={<Calendar size={16} />} onClick={onMobileClose} />
          </>
        )}

        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-ghost px-3 pt-4 pb-1">Tili</p>
        <SidebarLink href="/ilmoitukset" label="Ilmoitukset" icon={<Bell size={16} />} badge={unreadNotifications} onClick={onMobileClose} />
        <SidebarLink href="/istunnot" label="Istunnot" icon={<Monitor size={16} />} onClick={onMobileClose} />
        <SidebarLink href="/asetukset/profiili" label="Asetukset" icon={<Settings size={16} />} onClick={onMobileClose} />

        {isAdmin && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-ghost px-3 pt-4 pb-1">Admin</p>
            <SidebarLink href="/admin/kayttajat" label="Käyttäjät" icon={<Users size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/admin/logi" label="Aktiviteettiloki" icon={<ShieldCheck size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/admin/analytiikka" label="Analytiikka" icon={<BarChart2 size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/admin/laskutus" label="Laskutus" icon={<Receipt size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/admin/maksut" label="Maksut" icon={<CreditCard size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/admin/sahkopostipohjat" label="Sähköpostipohjat" icon={<Mail size={16} />} onClick={onMobileClose} />
            <SidebarLink href="/admin/asetukset" label="Järjestelmä" icon={<Wrench size={16} />} onClick={onMobileClose} />
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-wire px-3 py-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-copper/20 border border-copper/30 flex items-center justify-center shrink-0">
            <span className="text-copper text-xs font-bold leading-none">
              {firstName?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink leading-none truncate">
              {firstName && lastName ? `${firstName} ${lastName}` : firstName ?? email ?? "Käyttäjä"}
            </p>
            <div className="mt-0.5">
              <RoleBadge role={role} size="xs" />
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-ghost hover:text-bad hover:bg-bad/5 border border-transparent hover:border-bad/10 transition-all duration-150"
        >
          <LogOut size={15} />
          Kirjaudu ulos
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-wire bg-elevated/50">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative z-10 flex flex-col w-60 h-full bg-elevated border-r border-wire shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
