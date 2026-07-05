"use client";

import { useRef } from "react";
import { Upload, Download, Eye, File, FileStack } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatBytes, type ProjectFile } from "../types";

export function FilesTab({
  files,
  isStaff,
  uploading,
  uploadError,
  onUpload,
  onDownload,
}: {
  files: ProjectFile[];
  isStaff: boolean;
  uploading: boolean;
  uploadError: string;
  onUpload: (file: File) => void;
  onDownload: (fileId: string, fileName: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      {isStaff && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
            uploading
              ? "border-copper/40 bg-copper/5"
              : "border-wire hover:border-copper/40 hover:bg-copper/5",
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) onUpload(f);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
          <Upload
            size={20}
            className={cn(
              "mx-auto mb-2",
              uploading ? "text-copper animate-pulse" : "text-ink-ghost",
            )}
          />
          <p className="text-sm font-medium text-ink">
            {uploading ? "Ladataan..." : "Lataa tiedosto"}
          </p>
          <p className="text-xs text-ink-ghost mt-0.5">
            Klikkaa tai raahaa tiedosto tähän
          </p>
          {uploadError && (
            <p className="text-xs text-bad mt-2">{uploadError}</p>
          )}
        </div>
      )}

      {files.length === 0 ? (
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          <EmptyState icon={FileStack} title="Ei tiedostoja" />
        </div>
      ) : (
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          {files.map((f, i) => {
            const isImage = f.mime_type?.startsWith("image/");
            const isPDF = f.mime_type === "application/pdf";
            return (
              <div
                key={f.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-surface/30 transition-colors",
                  i > 0 && "border-t border-wire/50",
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-surface border border-wire flex items-center justify-center shrink-0">
                  <File size={14} className="text-ink-ghost" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-ink-ghost">
                    {formatBytes(f.size_bytes)} · v{f.version} ·{" "}
                    {new Date(f.created_at).toLocaleDateString("fi-FI")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {(isImage || isPDF) && (
                    <button
                      onClick={() => onDownload(f.id, f.name)}
                      className="p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-wire text-ink-ghost hover:text-ink transition-colors"
                      title="Esikatsele"
                    >
                      <Eye size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => onDownload(f.id, f.name)}
                    className="p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-wire text-ink-ghost hover:text-ink transition-colors"
                    title="Lataa"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
