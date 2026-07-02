import { cn } from "@/lib/utils";

export const STATUS_LABELS: Record<string, string> = {
  // customers
  active: "Aktiivinen", inactive: "Ei aktiivinen", lead: "Liidi",
  // quotes
  draft: "Luonnos", sent: "Lähetetty", accepted: "Hyväksytty", rejected: "Hylätty",
  // projects
  planning: "Suunnittelu", development: "Kehitys", testing: "Testaus",
  review: "Katselmus", completed: "Valmis", cancelled: "Peruttu",
  // invoices
  pending: "Odottaa", paid: "Maksettu", overdue: "Myöhässä",
  // payments
  completed_payment: "Suoritettu", failed: "Epäonnistui", refunded: "Palautettu",
  // tasks
  todo: "Tekemättä", in_progress: "Työn alla", done: "Valmis",
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
  testing: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  review: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  completed: "bg-ok/10 text-ok border-ok/20",
  cancelled: "bg-bad/10 text-bad border-bad/20",
  pending: "bg-surface text-ink-ghost border-wire",
  paid: "bg-ok/10 text-ok border-ok/20",
  overdue: "bg-bad/10 text-bad border-bad/20",
  completed_payment: "bg-ok/10 text-ok border-ok/20",
  failed: "bg-bad/10 text-bad border-bad/20",
  refunded: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  todo: "bg-surface text-ink-ghost border-wire",
  in_progress: "bg-copper/10 text-copper border-copper/20",
  done: "bg-ok/10 text-ok border-ok/20",
  fulfilled: "bg-ok/10 text-ok border-ok/20",
};

interface BadgeProps {
  status: string;
  labels?: Record<string, string>;
  colors?: Record<string, string>;
}

export function Badge({ status, labels, colors }: BadgeProps) {
  const label = (labels ?? STATUS_LABELS)[status] ?? status;
  const color = (colors ?? STATUS_COLORS)[status] ?? "bg-surface text-ink-ghost border-wire";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", color)}>
      {label}
    </span>
  );
}
