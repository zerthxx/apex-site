"use client";

import Link from "next/link";
import { Download, FileStack } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { CustomerFile } from "../types";

export function FilesTab({
  loaded,
  files,
}: {
  loaded: boolean;
  files: CustomerFile[];
}) {
  if (!loaded) {
    return (
      <p className="text-sm text-ink-ghost py-8 text-center">Ladataan...</p>
    );
  }

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileStack}
        title="Ei tiedostoja"
        description="Lataa tiedostoja asiakkaan projektin sisällä"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{f.name}</p>
            <p className="text-xs text-ink-ghost">
              {f.projects?.name ?? "—"} ·{" "}
              {new Date(f.created_at).toLocaleDateString("fi-FI")}
            </p>
          </div>
          {f.project_id && (
            <Link
              href={`/portaali/projektit/${f.project_id}`}
              className="text-ink-ghost hover:text-copper transition-colors shrink-0"
            >
              <Download size={14} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
