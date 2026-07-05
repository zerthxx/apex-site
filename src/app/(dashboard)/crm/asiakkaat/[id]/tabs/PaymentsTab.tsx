"use client";

import { ExternalLink, Wallet } from "lucide-react";
import {
  StatusBadge,
  PAYMENT_STATUS_LABELS,
} from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Payment } from "../types";

export function PaymentsTab({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return <EmptyState icon={Wallet} title="Ei maksuja vielä" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {payments.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg"
        >
          <div>
            <p className="text-sm font-medium text-ink">
              {p.payment_method ?? "Maksu"}
            </p>
            <p className="text-xs text-ink-ghost">
              {new Date(p.created_at).toLocaleDateString("fi-FI")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {p.amount != null && (
              <span className="text-sm text-ink">
                {p.amount.toLocaleString("fi-FI")}{" "}
                {(p.currency ?? "eur").toUpperCase()}
              </span>
            )}
            <StatusBadge status={p.status} labels={PAYMENT_STATUS_LABELS} />
            {p.receipt_url && (
              <a
                href={p.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-ghost hover:text-copper transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
