"use client";

import { useState } from "react";
import { Bell, Clock, Upload, CheckCircle } from "lucide-react";
import { formatDate, type FileRequest } from "./types";

export function FileRequestCard({
  request,
  onFulfill,
  onUpload,
}: {
  request: FileRequest;
  onFulfill: (id: string) => void;
  onUpload: () => void;
}) {
  const [fulfilling, setFulfilling] = useState(false);

  async function markFulfilled() {
    setFulfilling(true);
    const res = await fetch("/api/files/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: request.id, status: "fulfilled" }),
    });
    if (res.ok) onFulfill(request.id);
    setFulfilling(false);
  }

  return (
    <div className="mx-4 my-3 p-3 rounded-lg bg-caution/10 border border-caution/30 flex items-start gap-3">
      <Bell size={15} className="text-caution shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{request.title}</p>
        {request.description && (
          <p className="text-xs text-ink-ghost mt-0.5">{request.description}</p>
        )}
        {request.due_date && (
          <p className="text-xs text-ink-ghost mt-1 flex items-center gap-1">
            <Clock size={11} /> Määräpäivä: {formatDate(request.due_date)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-copper text-white hover:bg-copper/90 transition-colors"
        >
          <Upload size={11} /> Lataa
        </button>
        <button
          onClick={markFulfilled}
          disabled={fulfilling}
          title="Merkitse toimitetuksi"
          className="p-1 rounded hover:bg-surface text-ink-ghost hover:text-ok transition-colors disabled:opacity-50"
        >
          <CheckCircle size={15} />
        </button>
      </div>
    </div>
  );
}
