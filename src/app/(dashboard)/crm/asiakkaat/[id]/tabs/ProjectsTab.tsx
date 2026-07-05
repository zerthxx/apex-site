"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Project } from "../types";

export function ProjectsTab({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Ei projekteja"
        description="Hyväksy tarjous luodaksesi projektin"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/portaali/projektit/${p.id}`}
          className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg hover:border-copper/30 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink group-hover:text-copper transition-colors">
              {p.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full bg-copper rounded-full"
                  style={{ width: `${p.progress_pct}%` }}
                />
              </div>
              <span className="text-xs text-ink-ghost">{p.progress_pct}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {p.deadline && (
              <span className="text-xs text-ink-ghost">
                {new Date(p.deadline).toLocaleDateString("fi-FI")}
              </span>
            )}
            <StatusBadge status={p.status} />
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
