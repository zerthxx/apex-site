"use client";

import { useState } from "react";
import { Eye, Download, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FileIcon, formatBytes, formatDate, type ProjectFile } from "./types";

export function FileRow({
  file,
  onDelete,
  onPreview,
  isStaff,
}: {
  file: ProjectFile;
  onDelete: (id: string) => void;
  onPreview: (file: ProjectFile) => void;
  isStaff: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function download() {
    setDownloading(true);
    const res = await fetch(`/api/files/download/${file.id}`);
    const data = await res.json();
    if (data.url) {
      const a = document.createElement("a");
      a.href = data.url;
      a.download = data.name;
      a.click();
    }
    setDownloading(false);
  }

  async function remove() {
    setDeleting(true);
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: file.id }),
    });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    onDelete(file.id);
  }

  const canPreview =
    file.mime_type?.startsWith("image/") ||
    file.mime_type === "application/pdf";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface/30 transition-colors group">
      <FileIcon mime={file.mime_type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">{file.name}</p>
        <p className="text-xs text-ink-ghost">
          {file.mime_type ?? "—"} · {formatBytes(file.size_bytes)}
        </p>
      </div>
      {file.version > 1 && (
        <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded shrink-0">
          v{file.version}
        </span>
      )}
      <span className="text-xs text-ink-ghost shrink-0 hidden sm:block">
        {formatDate(file.created_at)}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            title="Esikatselu"
            className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-ink transition-colors"
          >
            <Eye size={14} />
          </button>
        )}
        <button
          onClick={download}
          disabled={downloading}
          title="Lataa"
          className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-ink transition-colors disabled:opacity-50"
        >
          <Download size={14} />
        </button>
        {isStaff && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            title="Poista"
            className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-bad transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Siirrä roskakoriin"
          message={`Tiedosto "${file.name}" siirretään roskakoriin. Vain omistaja voi palauttaa tai poistaa sen pysyvästi.`}
          confirmLabel="Siirrä roskakoriin"
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
