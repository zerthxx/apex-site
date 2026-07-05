"use client";

import { Trash2, Inbox } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { LeadRequest } from "../types";

export function LeadRequestsTab({
  leadRequests,
  onDelete,
}: {
  leadRequests: LeadRequest[];
  onDelete: (id: string) => void;
}) {
  if (leadRequests.length === 0) {
    return <EmptyState icon={Inbox} title="Ei tarjouspyyntöjä vielä" />;
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {leadRequests.map((r) => (
        <div
          key={r.id}
          className="bg-elevated border border-wire rounded-xl p-4"
        >
          <div className="flex items-start justify-between mb-3 gap-3">
            <p className="text-sm font-semibold text-ink">
              {r.service ?? "Tarjouspyyntö"}
              {r.solution ? ` — ${r.solution}` : ""}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-xs text-ink-ghost whitespace-nowrap">
                {new Date(r.created_at).toLocaleString("fi-FI")}
              </p>
              <button
                onClick={() => onDelete(r.id)}
                className="text-ink-ghost hover:text-bad transition-colors"
                aria-label="Poista tarjouspyyntö"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {(r.company ||
            r.phone ||
            r.budget ||
            r.timeline ||
            r.contact_preference) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-sm">
              {[
                { label: "Yritys", value: r.company },
                { label: "Puhelin", value: r.phone },
                { label: "Budjetti", value: r.budget },
                { label: "Toivottu aloitusajankohta", value: r.timeline },
                { label: "Yhteydenottotapa", value: r.contact_preference },
              ]
                .filter(({ value }) => value)
                .map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-ink-ghost">{label}</p>
                    <p className="text-ink mt-0.5">{value}</p>
                  </div>
                ))}
            </div>
          )}
          {r.message && (
            <div>
              <p className="text-xs text-ink-ghost mb-1">Projektin kuvaus</p>
              <p className="text-sm text-ink whitespace-pre-wrap">
                {r.message}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
