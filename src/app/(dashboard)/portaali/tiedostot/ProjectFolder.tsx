"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  Bell,
  Upload,
} from "lucide-react";
import { FileRequestCard } from "./FileRequestCard";
import { FileRow } from "./FileRow";
import { UploadModal } from "./UploadModal";
import { RequestModal } from "./RequestModal";
import type { FileRequest, Project, ProjectFile } from "./types";

export function ProjectFolder({
  project,
  files,
  requests,
  onUploaded,
  onDelete,
  onPreview,
  onRequestCreated,
  onRequestFulfilled,
  isStaff,
}: {
  project: Project | null;
  files: ProjectFile[];
  requests: FileRequest[];
  onUploaded: (f: ProjectFile) => void;
  onDelete: (id: string) => void;
  onPreview: (f: ProjectFile) => void;
  onRequestCreated: (r: FileRequest) => void;
  onRequestFulfilled: (id: string) => void;
  isStaff: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2.5">
          {open ? (
            <FolderOpen size={16} className="text-copper" />
          ) : (
            <Folder size={16} className="text-copper" />
          )}
          <span className="text-sm font-medium text-ink">
            {project?.name ?? "Yleiset tiedostot"}
          </span>
          <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded-full">
            {files.length}
          </span>
          {pendingRequests.length > 0 && (
            <span className="text-xs font-medium bg-caution/20 text-caution border border-caution/30 px-1.5 py-0.5 rounded-full">
              {pendingRequests.length} pyyntö
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStaff && project?.customer_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRequest(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-wire text-ink-ghost hover:text-ink hover:border-ink/40 transition-colors"
            >
              <Bell size={12} /> Pyydä tiedostoja
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowUpload(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-copper text-white hover:bg-copper/90 transition-colors"
          >
            <Upload size={12} /> Lataa
          </button>
          {open ? (
            <ChevronDown size={15} className="text-ink-ghost" />
          ) : (
            <ChevronRight size={15} className="text-ink-ghost" />
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-wire">
          {pendingRequests.map((req) => (
            <FileRequestCard
              key={req.id}
              request={req}
              onFulfill={onRequestFulfilled}
              onUpload={() => setShowUpload(true)}
            />
          ))}
          {files.length === 0 && pendingRequests.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-ink-ghost">
              Ei tiedostoja.{" "}
              <button
                onClick={() => setShowUpload(true)}
                className="text-copper hover:underline"
              >
                Lataa ensimmäinen.
              </button>
            </div>
          ) : files.length === 0 ? null : (
            <div className="divide-y divide-wire/50">
              {files.map((f) => (
                <FileRow
                  key={f.id}
                  file={f}
                  onDelete={onDelete}
                  onPreview={onPreview}
                  isStaff={isStaff}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <UploadModal
          projectId={project?.id ?? null}
          onClose={() => setShowUpload(false)}
          onUploaded={(f) => {
            onUploaded(f);
            setOpen(true);
          }}
        />
      )}

      {showRequest && project && (
        <RequestModal
          project={project}
          onClose={() => setShowRequest(false)}
          onCreated={onRequestCreated}
        />
      )}
    </div>
  );
}
