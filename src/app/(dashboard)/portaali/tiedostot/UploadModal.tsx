"use client";

import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import type { ProjectFile } from "./types";

export function UploadModal({
  projectId,
  onClose,
  onUploaded,
}: {
  projectId: string | null;
  onClose: () => void;
  onUploaded: (file: ProjectFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    let hasError = false;

    for (const file of Array.from(files)) {
      setProgress(`Ladataan "${file.name}"...`);
      const fd = new FormData();
      fd.append("file", file);
      if (projectId) fd.append("project_id", projectId);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lataus epäonnistui");
        hasError = true;
        break;
      }
      onUploaded(data.file);
    }

    setUploading(false);
    setProgress(null);
    if (!hasError) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Lataa tiedostoja</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <div
          className="border-2 border-dashed border-wire rounded-xl p-8 text-center cursor-pointer hover:border-copper/50 hover:bg-surface/30 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload size={28} className="text-ink-ghost mx-auto mb-2" />
          <p className="text-sm text-ink-ghost">
            Vedä tiedostoja tähän tai{" "}
            <span className="text-copper">valitse tiedostoja</span>
          </p>
          <p className="text-xs text-ink-ghost mt-1">
            Kaikki tiedostotyypit tuettu
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading && (
          <p className="text-xs text-ink-ghost mt-3 text-center">
            {progress ?? "Ladataan..."}
          </p>
        )}
        {error && <p className="text-xs text-bad mt-3">{error}</p>}

        <button
          onClick={onClose}
          disabled={uploading}
          className="mt-4 w-full py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors disabled:opacity-50"
        >
          Sulje
        </button>
      </div>
    </div>
  );
}
