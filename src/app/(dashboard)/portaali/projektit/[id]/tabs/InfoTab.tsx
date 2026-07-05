"use client";

import Link from "next/link";
import type { Project } from "../types";

export function InfoTab({
  project,
  isStaff,
  customerName,
  assigneeName,
}: {
  project: Project;
  isStaff: boolean;
  customerName: string | null | undefined;
  assigneeName: string | null | undefined;
}) {
  const rows = [
    {
      label: "Asiakas",
      value: customerName,
      link:
        isStaff && project.customers?.id
          ? `/crm/asiakkaat/${project.customers.id}`
          : null,
      alwaysShow: true,
    },
    {
      label: "Vastuuhenkilö",
      value: isStaff ? assigneeName : null,
      link: null,
      alwaysShow: isStaff,
    },
    {
      label: "Budjetti",
      value:
        project.budget != null
          ? `${project.budget.toLocaleString("fi-FI")} €`
          : null,
      link: null,
      alwaysShow: true,
    },
    {
      label: "Deadline",
      value: project.deadline
        ? new Date(project.deadline).toLocaleDateString("fi-FI")
        : null,
      link: null,
      alwaysShow: true,
    },
    {
      label: "Luotu",
      value: new Date(project.created_at).toLocaleDateString("fi-FI"),
      link: null,
      alwaysShow: true,
    },
  ].filter(({ value, alwaysShow }) => alwaysShow || value);

  return (
    <div className="bg-elevated border border-wire rounded-xl p-5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
        {rows.map(({ label, value, link }) => (
          <div key={label}>
            <dt className="text-xs text-ink-ghost">{label}</dt>
            <dd className="text-ink mt-0.5">
              {value ? (
                link ? (
                  <Link href={link} className="text-copper hover:underline">
                    {value}
                  </Link>
                ) : (
                  value
                )
              ) : (
                "—"
              )}
            </dd>
          </div>
        ))}
      </dl>
      {project.description && (
        <div className="mt-4 pt-4 border-t border-wire">
          <p className="text-xs text-ink-ghost mb-1">Kuvaus</p>
          <p className="text-sm text-ink">{project.description}</p>
        </div>
      )}
      {project.quotes && project.quotes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-wire">
          <p className="text-xs text-ink-ghost mb-2">Liitetty tarjous</p>
          {project.quotes.map((q) => (
            <div key={q.id} className="flex items-center justify-between">
              <Link
                href={`/portaali/tarjoukset/${q.id}`}
                className="text-sm text-copper hover:underline"
              >
                {q.title}
              </Link>
              {q.amount != null && (
                <span className="text-sm text-ink-dim">
                  {q.amount.toLocaleString("fi-FI")} €
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
