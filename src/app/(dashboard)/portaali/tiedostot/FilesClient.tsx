"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ChevronRight, Upload, Download, Trash2, Eye, X,
  File, FileImage, FileText, FileCode, FolderOpen, Folder,
  Bell, CheckCircle, Clock,
} from "lucide-react";

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
  customer_id: string | null;
}

interface FileRequest {
  id: string;
  project_id: string;
  customer_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "pending" | "fulfilled" | "cancelled";
  created_at: string;
}

interface FilesClientProps {
  projects: Project[];
  files: ProjectFile[];
  fileRequests: FileRequest[];
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

function RequestModal({
  project,
  onClose,
  onCreated,
}: {
  project: Project;
  onClose: () => void;
  onCreated: (req: FileRequest) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Otsikko vaaditaan"); return; }
    if (!project.customer_id) { setError("Projektilla ei ole asiakasta"); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/files/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.id,
        customer_id: project.customer_id,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Virhe"); setSaving(false); return; }
    onCreated(data.request);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Pyydä tiedostoja</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-ghost mb-1">Mitä tarvitset? *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="esim. Yrityksen logo PNG-muodossa"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-wire text-sm text-ink placeholder:text-ink-ghost focus:outline-none focus:border-copper/60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-ghost mb-1">Lisätiedot</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tarkemmat ohjeet tai vaatimukset..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-wire text-sm text-ink placeholder:text-ink-ghost focus:outline-none focus:border-copper/60 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-ghost mb-1">Määräpäivä</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-wire text-sm text-ink focus:outline-none focus:border-copper/60"
            />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">
              Peruuta
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 transition-colors disabled:opacity-50">
              {saving ? "Lähetetään..." : "Lähetä pyyntö"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FileRequestCard({
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
    <div className="mx-4 my-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
      <Bell size={15} className="text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{request.title}</p>
        {request.description && <p className="text-xs text-ink-ghost mt-0.5">{request.description}</p>}
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
          {open ? <FolderOpen size={16} className="text-copper" /> : <Folder size={16} className="text-copper" />}
          <span className="text-sm font-medium text-ink">{project?.name ?? "Yleiset tiedostot"}</span>
          <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded-full">{files.length}</span>
          {pendingRequests.length > 0 && (
            <span className="text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
              {pendingRequests.length} pyyntö
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStaff && project?.customer_id && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowRequest(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-wire text-ink-ghost hover:text-ink hover:border-ink/40 transition-colors"
            >
              <Bell size={12} /> Pyydä tiedostoja
            </button>
          )}
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
              Ei tiedostoja. <button onClick={() => setShowUpload(true)} className="text-copper hover:underline">Lataa ensimmäinen.</button>
            </div>
          ) : files.length === 0 ? null : (
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

export function FilesClient({ projects, files: initial, fileRequests: initialRequests, isStaff }: FilesClientProps) {
  const [files, setFiles] = useState(initial);
  const [fileRequests, setFileRequests] = useState(initialRequests);
  const [preview, setPreview] = useState<ProjectFile | null>(null);

  function handleUploaded(f: ProjectFile) {
    setFiles((prev) => [f, ...prev]);
  }

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleRequestCreated(r: FileRequest) {
    setFileRequests((prev) => [r, ...prev]);
  }

  function handleRequestFulfilled(id: string) {
    setFileRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "fulfilled" as const } : r));
  }

  const noProject = files.filter((f) => !f.project_id);
  const byProject = projects.map((p) => ({
    project: p,
    files: files.filter((f) => f.project_id === p.id),
    requests: fileRequests.filter((r) => r.project_id === p.id),
  }));

  return (
    <div className="flex flex-col gap-3">
      {byProject.map(({ project, files: pf, requests }) => (
        <ProjectFolder
          key={project.id}
          project={project}
          files={pf}
          requests={requests}
          onUploaded={handleUploaded}
          onDelete={handleDelete}
          onPreview={setPreview}
          onRequestCreated={handleRequestCreated}
          onRequestFulfilled={handleRequestFulfilled}
          isStaff={isStaff}
        />
      ))}

      {isStaff && (
        <ProjectFolder
          project={null}
          files={noProject}
          requests={[]}
          onUploaded={handleUploaded}
          onDelete={handleDelete}
          onPreview={setPreview}
          onRequestCreated={handleRequestCreated}
          onRequestFulfilled={handleRequestFulfilled}
          isStaff={isStaff}
        />
      )}

      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
