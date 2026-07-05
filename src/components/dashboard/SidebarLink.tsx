"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function SidebarLink({
  href,
  label,
  icon,
  exact = false,
  onClick,
  badge,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group",
        active ? "text-copper" : "text-ink-dim hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-copper/10 border border-copper/20"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      {!active && (
        <span className="absolute inset-0 rounded-lg border border-transparent group-hover:bg-surface transition-colors duration-150" />
      )}
      <span
        className={cn(
          "relative shrink-0 transition-colors",
          active ? "text-copper" : "text-ink-ghost group-hover:text-ink-dim",
        )}
      >
        {icon}
      </span>
      <span className="relative flex-1 leading-none">{label}</span>
      {badge != null && badge > 0 && (
        <span className="relative flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-copper text-[#0A0C10] text-[10px] font-bold leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
