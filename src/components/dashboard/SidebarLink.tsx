"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function SidebarLink({ href, label, icon, exact = false, onClick, badge }: SidebarLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative",
        active
          ? "bg-copper/10 text-copper border border-copper/20"
          : "text-ink-dim hover:text-ink hover:bg-surface border border-transparent"
      )}
    >
      <span className={cn("shrink-0 transition-colors", active ? "text-copper" : "text-ink-ghost group-hover:text-ink-dim")}>
        {icon}
      </span>
      <span className="flex-1 leading-none">{label}</span>
      {badge != null && badge > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-copper text-[#0A0C10] text-[10px] font-bold leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
