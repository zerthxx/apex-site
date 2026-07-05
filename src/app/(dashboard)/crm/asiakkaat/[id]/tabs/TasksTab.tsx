"use client";

import { CheckSquare } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TASK_LABELS, type CustomerTask } from "../types";

export function TasksTab({
  loaded,
  tasks,
}: {
  loaded: boolean;
  tasks: CustomerTask[];
}) {
  if (!loaded) {
    return (
      <p className="text-sm text-ink-ghost py-8 text-center">Ladataan...</p>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState icon={CheckSquare} title="Ei tehtäviä" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{t.title}</p>
            <p className="text-xs text-ink-ghost">
              {t.projects?.name ?? "—"}
              {t.due_date
                ? ` · ${new Date(t.due_date).toLocaleDateString("fi-FI")}`
                : ""}
            </p>
          </div>
          <StatusBadge status={t.status} labels={TASK_LABELS} />
        </div>
      ))}
    </div>
  );
}
