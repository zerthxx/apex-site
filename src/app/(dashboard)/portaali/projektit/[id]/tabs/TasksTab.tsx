"use client";

import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PRIORITY_COLORS, TASK_STATUS_LABELS, type Task } from "../types";

export function TasksTab({ tasks }: { tasks: Task[] }) {
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
          <div>
            <p className="text-sm font-medium text-ink">{t.title}</p>
            {t.due_date && (
              <p className="text-xs text-ink-ghost">
                {new Date(t.due_date).toLocaleDateString("fi-FI")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn("text-xs font-medium", PRIORITY_COLORS[t.priority])}
            >
              {t.priority.toUpperCase()}
            </span>
            <StatusBadge status={t.status} labels={TASK_STATUS_LABELS} />
          </div>
        </div>
      ))}
    </div>
  );
}
