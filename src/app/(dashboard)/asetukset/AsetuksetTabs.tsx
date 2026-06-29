"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/asetukset/profiili", label: "Profiili" },
  { href: "/asetukset/turvallisuus", label: "Turvallisuus" },
  { href: "/asetukset/ilmoitukset", label: "Ilmoitukset" },
  { href: "/asetukset/integraatiot", label: "Integraatiot" },
  { href: "/asetukset/api-avaimet", label: "API-avaimet" },
];

export function AsetuksetTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 bg-surface border border-wire rounded-xl p-1 mb-6 overflow-x-auto">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`shrink-0 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            pathname.startsWith(tab.href)
              ? "bg-elevated text-ink shadow-sm border border-wire"
              : "text-ink-ghost hover:text-ink-dim"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
