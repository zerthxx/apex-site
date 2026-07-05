"use client";

import { useState, useEffect } from "react";
import { X, File, Download } from "lucide-react";
import { FileIcon, type ProjectFile } from "./types";

export function PreviewModal({
  file,
  onClose,
}: {
  file: ProjectFile;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/files/download/${file.id}`)
      .then((r) => r.json())
      .then((d) => {
        setUrl(d.url);
        setLoading(false);
      })
      .catch(() => {
        setError("Esikatselu epäonnistui");
        setLoading(false);
      });
  }, [file.id]);

  const isImage = file.mime_type?.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl mx-4 max-h-[85vh] bg-elevated border border-wire rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-wire shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon mime={file.mime_type} />
            <span className="text-sm font-medium text-ink truncate">
              {file.name}
            </span>
            {file.version > 1 && (
              <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded shrink-0">
                v{file.version}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-ink-ghost hover:text-ink ml-3 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0">
          {loading && <p className="text-sm text-ink-ghost">Ladataan...</p>}
          {error && <p className="text-sm text-bad">{error}</p>}
          {url && isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded"
            />
          )}
          {url && isPdf && (
            <iframe
              src={url}
              className="w-full h-[60vh] rounded border border-wire"
              title={file.name}
            />
          )}
          {url && !isImage && !isPdf && (
            <div className="text-center">
              <File size={40} className="text-ink-ghost mx-auto mb-3" />
              <p className="text-sm text-ink-ghost mb-4">
                Esikatselu ei tueta tälle tiedostotyypille
              </p>
              <a
                href={url}
                download={file.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors"
              >
                <Download size={14} /> Lataa
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
