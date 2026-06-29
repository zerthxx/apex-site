"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, Settings } from "lucide-react";

interface TopbarProps {
  title?: string;
  unreadNotifications?: number;
  onMobileMenuOpen?: () => void;
}

export function Topbar({ title, unreadNotifications = 0, onMobileMenuOpen }: TopbarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-wire bg-elevated/50 flex items-center px-4 gap-3">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMobileMenuOpen}
        className="lg:hidden text-ink-ghost hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-surface"
        aria-label="Avaa valikko"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-sm font-semibold text-ink hidden sm:block">{title}</h1>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/ilmoitukset"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-ink-ghost hover:text-ink hover:bg-surface transition-all duration-150"
          aria-label="Ilmoitukset"
        >
          <Bell size={17} />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-copper" />
          )}
        </Link>
        <Link
          href="/asetukset"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-ink-ghost hover:text-ink hover:bg-surface transition-all duration-150"
          aria-label="Asetukset"
        >
          <Settings size={17} />
        </Link>
      </div>
    </header>
  );
}
