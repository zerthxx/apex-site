"use client";

import Link from "next/link";
import { Plus, ArrowRight, FileText } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Quote } from "../types";

export function QuotesTab({
  quotes,
  onNewQuote,
}: {
  quotes: Quote[];
  onNewQuote: () => void;
}) {
  if (quotes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Ei tarjouksia vielä"
        action={
          <button
            onClick={onNewQuote}
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors"
          >
            <Plus size={14} />
            Luo ensimmäinen tarjous
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {quotes.map((q) => (
        <Link
          key={q.id}
          href={`/portaali/tarjoukset/${q.id}`}
          className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg hover:border-copper/30 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium text-ink group-hover:text-copper transition-colors">
              {q.title}
            </p>
            <p className="text-xs text-ink-ghost">
              {new Date(q.created_at).toLocaleDateString("fi-FI")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {q.amount != null && (
              <span className="text-sm text-ink">
                {q.amount.toLocaleString("fi-FI")} €
              </span>
            )}
            <StatusBadge status={q.status} />
            <ArrowRight
              size={13}
              className="text-ink-ghost group-hover:text-copper transition-colors"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
