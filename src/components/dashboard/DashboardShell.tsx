"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  role?: string;
  unreadNotifications?: number;
}

export function DashboardShell({
  children,
  firstName,
  lastName,
  email,
  role,
  unreadNotifications = 0,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
