"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ChevronRight, Upload, Download, Trash2, Eye, X,
  File, FileImage, FileText, FileCode, FolderOpen, Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectFile {
  id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  version: number;
  uploaded_by: string | null;
  created_at: string;
  project_id: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface FilesClientProps {
  projects: Project[];
  files: ProjectFile[];
  isStaff: boolean;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fi-FI");
}

function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <File size={15} className="text-ink-ghost" />;
  if (mime.startsWith("image/")) return <FileImage size={15} className="text-copper" />;
  if (mime === "application/pdf") return <FileText size={15} className="text-bad" />;
  if (mime.startsWith("text/") || mime.includes("json") || mime.includes("xml"))
    return <FileCode size={15} className="text-ok" />;
  return <File size={15} className="text-ink-ghost" />;
}

function PreviewModal({ file, onClose }: { file: ProjectFile; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/files/download/${file.id}`)
      .then((r) => r.json())
      .then((d) => { setUrl(d.url); setLoading(false); })
      .catch(() => { setError("Esikatselu epäonnistui"); setLoading(false); });
  }, [file.id]);

  const isImage = file.mime_type?.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 max-h-[85vh] bg-elevated border border-wire rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-wire shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon mime={file.mime_type} />
            <span className="text-sm font-medium text-ink truncate">{file.name}</span>
            {file.version > 1 && (
              <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded shrink-0">v{file.version}</span>
            )}
          </div>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink ml-3 shrink-0"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0">
          {loading && <p className="text-sm text-ink-ghost">Ladataan...</p>}
          {error && <p className="text-sm text-bad">{error}</p>}
          {url && isImage && <img src={url} alt={file.name} className="max-w-full max-h-full object-contain rounded" />}
          {url && isPdf && <iframe src={url} className="w-full h-[60vh] rounded border border-wire" title={file.name} />}
          {url && !isImage && !isPdf && (
            <div className="text-center">
              <File size={40} className="text-ink-ghost mx-auto mb-3" />
              <p className="text-sm text-ink-ghost mb-4">Esikatselu ei tueta tälle tiedostotyypille</p>
              <a href={url} download={file.name} className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors">
                <Download size={14} /> Lataa
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadModal({
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

    for (const file of Array.from(files)) {
      setProgress(`Ladataan "${file.name}"...`);
      const fd = new FormData();
      fd.append("file", file);
      if (projectId) fd.append("project_id", projectId);

      const res = await fetch("/api/files/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Lataus epäonnistui"); break; }
      onUploaded(data.file);
    }

    setUploading(false);
    setProgress(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Lataa tiedostoja</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={16} /></button>
        </div>

        <div
          className="border-2 border-dashed border-wire rounded-xl p-8 text-center cursor-pointer hover:border-copper/50 hover:bg-surface/30 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <Upload size={28} className="text-ink-ghost mx-auto mb-2" />
          <p className="text-sm text-ink-ghost">Vedä tiedostoja tähän tai <span className="text-copper">valitse tiedostoja</span></p>
          <p className="text-xs text-ink-ghost mt-1">Kaikki tiedostotyypit tuettu</p>
        </div>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        {uploading && <p className="text-xs text-ink-ghost mt-3 text-center">{progress ?? "Ladataan..."}</p>}
        {error && <p className="text-xs text-bad mt-3">{error}</p>}

        <button onClick={onClose} disabled={uploading} className="mt-4 w-full py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors disabled:opacity-50">
          Sulje
        </button>
      </div>
    </div>
  );
}

function FileRow({
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
    if (!confirm(`Poista "${file.name}"?`)) return;
    setDeleting(true);
    const res = await fetch("/api/files", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: file.id }) });
    if (res.ok) onDelete(file.id);
    setDeleting(false);
  }

  const canPreview = file.mime_type?.startsWith("image/") || file.mime_type === "application/pdf";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface/30 transition-colors group">
      <FileIcon mime={file.mime_type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">{file.name}</p>
        <p className="text-xs text-ink-ghost">{file.mime_type ?? "—"} · {formatBytes(file.size_bytes)}</p>
      </div>
      {file.version > 1 && (
        <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded shrink-0">v{file.version}</span>
      )}
      <span className="text-xs text-ink-ghost shrink-0 hidden sm:block">{formatDate(file.created_at)}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {canPreview && (
          <button onClick={() => onPreview(file)} title="Esikatselu" className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-ink transition-colors">
            <Eye size={14} />
          </button>
        )}
        <button onClick={download} disabled={downloading} title="Lataa" className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-ink transition-colors disabled:opacity-50">
          <Download size={14} />
        </button>
        {isStaff && (
          <button onClick={remove} disabled={deleting} title="Poista" className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-bad transition-colors disabled:opacity-50">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ProjectFolder({
  project,
  files,
  onUploaded,
  onDelete,
  onPreview,
  isStaff,
}: {
  project: Project | null;
  files: ProjectFile[];
  onUploaded: (f: ProjectFile) => void;
  onDelete: (id: string) => void;
  onPreview: (f: ProjectFile) => void;
  isStaff: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2.5">
          {open ? <FolderOpen size={16} className="text-copper" /> : <Folder size={16} className="text-copper" />}
          <span className="text-sm font-medium text-ink">{project?.name ?? "Yleiset tiedostot"}</span>
          <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded-full">{files.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-copper text-white hover:bg-copper/90 transition-colors"
          >
            <Upload size={12} /> Lataa
          </button>
          {open ? <ChevronDown size={15} className="text-ink-ghost" /> : <ChevronRight size={15} className="text-ink-ghost" />}
        </div>
      </div>

      {open && (
        <div className="border-t border-wire">
          {files.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-ink-ghost">
              Ei tiedostoja. <button onClick={() => setShowUpload(true)} className="text-copper hover:underline">Lataa ensimmäinen.</button>
            </div>
          ) : (
            <div className="divide-y divide-wire/50">
              {files.map((f) => (
                <FileRow key={f.id} file={f} onDelete={onDelete} onPreview={onPreview} isStaff={isStaff} />
              ))}
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <UploadModal
          projectId={project?.id ?? null}
          onClose={() => setShowUpload(false)}
          onUploaded={(f) => { onUploaded(f); setOpen(true); }}
        />
      )}
    </div>
  );
}

export function FilesClient({ projects, files: initial, isStaff }: FilesClientProps) {
  const [files, setFiles] = useState(initial);
  const [preview, setPreview] = useState<ProjectFile | null>(null);

  function handleUploaded(f: ProjectFile) {
    setFiles((prev) => [f, ...prev]);
  }

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const noProject = files.filter((f) => !f.project_id);
  const byProject = projects.map((p) => ({
    project: p,
    files: files.filter((f) => f.project_id === p.id),
  }));

  return (
    <div className="flex flex-col gap-3">
      {byProject.map(({ project, files: pf }) => (
        <ProjectFolder
          key={project.id}
          project={project}
          files={pf}
          onUploaded={handleUploaded}
          onDelete={handleDelete}
          onPreview={setPreview}
          isStaff={isStaff}
        />
      ))}

      {isStaff && (
        <ProjectFolder
          project={null}
          files={noProject}
          onUploaded={handleUploaded}
          onDelete={handleDelete}
          onPreview={setPreview}
          isStaff={isStaff}
        />
      )}

      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
