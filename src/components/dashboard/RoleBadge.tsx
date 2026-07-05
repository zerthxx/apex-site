import { cn } from "@/lib/utils";

const ROLE_CONFIG: Record<string, { label: string; classes: string }> = {
  owner: {
    label: "Omistaja",
    classes: "text-copper bg-copper/10 border-copper/20",
  },
  admin: {
    label: "Admin",
    classes: "text-teal-brand bg-teal-brand/10 border-teal-brand/20",
  },
  employee: { label: "Työntekijä", classes: "text-ok bg-ok/10 border-ok/20" },
  customer: {
    label: "Asiakas",
    classes: "text-ink-dim bg-surface border-wire",
  },
};

interface RoleBadgeProps {
  role?: string | null;
  size?: "xs" | "sm";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role ?? "customer"] ?? ROLE_CONFIG.customer;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium leading-none",
        size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
        config.classes,
      )}
    >
      {config.label}
    </span>
  );
}
