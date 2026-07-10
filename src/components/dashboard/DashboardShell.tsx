"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  role?: string;
  unreadNotifications?: number;
  forcePasswordReset?: boolean;
}

export function DashboardShell({
  children,
  firstName,
  lastName,
  email,
  role,
  unreadNotifications = 0,
  forcePasswordReset = false,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Admin-mandated password reset: block everything except the security
  // settings page (where the change clears the flag server-side).
  const passwordGate =
    forcePasswordReset && pathname !== "/asetukset/turvallisuus";

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar
        firstName={firstName}
        lastName={lastName}
        email={email}
        role={role}
        unreadNotifications={unreadNotifications}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          unreadNotifications={unreadNotifications}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">{children}</main>
      </div>

      {passwordGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/90 backdrop-blur-sm p-6">
          <div className="max-w-md w-full rounded-2xl bg-surface border border-wire p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-copper/10 border border-copper/30 flex items-center justify-center">
              <ShieldAlert size={22} className="text-copper" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                Salasanan vaihto vaaditaan
              </p>
              <p className="text-sm text-ink-ghost mt-1.5">
                Ylläpito on määrännyt tilillesi pakollisen salasanan vaihdon.
                Vaihda salasanasi jatkaaksesi palvelun käyttöä.
              </p>
            </div>
            <Link
              href="/asetukset/turvallisuus"
              className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors"
            >
              Vaihda salasana
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
