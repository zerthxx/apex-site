import { cn } from "@/lib/utils";

export const STATUS_LABELS: Record<string, string> = {
  // customers
  active: "Aktiivinen",
  inactive: "Ei aktiivinen",
  lead: "Liidi",
  // quotes
  draft: "Luonnos",
  sent: "Lähetetty",
  accepted: "Hyväksytty",
  rejected: "Hylätty",
  // projects
  planning: "Suunnittelu",
  development: "Kehitys",
  testing: "Testaus",
  review: "Katselmus",
  completed: "Valmis",
  cancelled: "Peruttu",
  // invoices
  pending: "Odottaa",
  paid: "Maksettu",
  overdue: "Myöhässä",
  // payments (see PAYMENT_STATUS_LABELS for the "completed" override)
  failed: "Epäonnistui",
  refunded: "Palautettu",
  // tasks
  todo: "Tekemättä",
  in_progress: "Työn alla",
  done: "Valmis",
  // file requests
  fulfilled: "Täytetty",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-ok/10 text-ok border-ok/20",
  inactive: "bg-surface text-ink-ghost border-wire",
  lead: "bg-copper/10 text-copper border-copper/20",
  draft: "bg-surface text-ink-ghost border-wire",
  sent: "bg-copper/10 text-copper border-copper/20",
  accepted: "bg-ok/10 text-ok border-ok/20",
  rejected: "bg-bad/10 text-bad border-bad/20",
  planning: "bg-surface text-ink-ghost border-wire",
  development: "bg-copper/10 text-copper border-copper/20",
  testing: "bg-teal-brand/10 text-teal-brand border-teal-brand/20",
  review: "bg-caution/10 text-caution border-caution/20",
  completed: "bg-ok/10 text-ok border-ok/20",
  cancelled: "bg-bad/10 text-bad border-bad/20",
  pending: "bg-surface text-ink-ghost border-wire",
  paid: "bg-ok/10 text-ok border-ok/20",
  overdue: "bg-bad/10 text-bad border-bad/20",
  failed: "bg-bad/10 text-bad border-bad/20",
  refunded: "bg-teal-brand/10 text-teal-brand border-teal-brand/20",
  todo: "bg-surface text-ink-ghost border-wire",
  in_progress: "bg-copper/10 text-copper border-copper/20",
  done: "bg-ok/10 text-ok border-ok/20",
  fulfilled: "bg-ok/10 text-ok border-ok/20",
};

// The "completed" key is shared with project status ("Valmis"); payments need
// their own label ("Suoritettu") for the same status string, while reusing
// the same green success color from STATUS_COLORS.
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  ...STATUS_LABELS,
  completed: "Suoritettu",
  cancelled: "Peruutettu",
};

interface StatusBadgeProps {
  status: string;
  labels?: Record<string, string>;
  colors?: Record<string, string>;
  className?: string;
}

export function StatusBadge({
  status,
  labels,
  colors,
  className,
}: StatusBadgeProps) {
  const label = (labels ?? STATUS_LABELS)[status] ?? status;
  const color =
    (colors ?? STATUS_COLORS)[status] ??
    "bg-surface text-ink-ghost border-wire";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        color,
        className,
      )}
    >
      {label}
    </span>
  );
}
