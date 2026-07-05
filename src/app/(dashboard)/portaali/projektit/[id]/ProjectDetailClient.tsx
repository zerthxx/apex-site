"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RevealSection } from "@/components/shared/RevealSection";
import { EditProjectModal } from "./EditProjectModal";
import { InfoTab } from "./tabs/InfoTab";
import { TasksTab } from "./tabs/TasksTab";
import { FilesTab } from "./tabs/FilesTab";
import { CommentsTab } from "./tabs/CommentsTab";
import type {
  Project,
  Task,
  ProjectFile,
  AssignedProfile,
  Comment,
} from "./types";

interface Props {
  project: Project;
  tasks: Task[];
  files: ProjectFile[];
  isStaff: boolean;
  canModerate: boolean;
  assignedProfile?: AssignedProfile | null;
}

export function ProjectDetailClient({
  project: initial,
  tasks,
  files: initialFiles,
  isStaff,
  canModerate,
  assignedProfile,
}: Props) {
  const [project, setProject] = useState(initial);
  const [progress, setProgress] = useState(initial.progress_pct);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"tasks" | "files" | "info" | "kommentit">(
    "info",
  );
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "kommentit" && !commentsLoaded) {
      fetch(`/api/projects/${project.id}/comments`)
        .then((r) => r.json())
        .then(({ comments: c }) => {
          setComments(c ?? []);
          setCommentsLoaded(true);
        });
    }
  }, [tab, commentsLoaded, project.id]);

  useEffect(() => {
    if (tab === "kommentit") {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, tab]);

  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  async function deleteComment(commentId: string) {
    const res = await fetch(`/api/projects/${project.id}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    const res = await fetch(`/api/projects/${project.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newComment }),
    });
    const data = await res.json();
    setSending(false);
    if (res.ok) {
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    }
  }

  async function saveProgress() {
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, progress_pct: progress }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProject({ ...project, progress_pct: data.project.progress_pct });
    }
  }

  async function handleUpload(file: File) {
    setUploadError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("project_id", project.id);
    const res = await fetch("/api/files/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setUploadError(data.error ?? "Lataus epäonnistui");
      return;
    }
    setFiles((prev) => [data.file, ...prev]);
  }

  async function downloadFile(fileId: string) {
    const res = await fetch(`/api/files/download/${fileId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  const customerName = project.customers
    ? [project.customers.first_name, project.customers.last_name]
        .filter(Boolean)
        .join(" ") || project.customers.email
    : null;

  const assigneeName = assignedProfile
    ? [assignedProfile.first_name, assignedProfile.last_name]
        .filter(Boolean)
        .join(" ") || "—"
    : null;

  return (
    <RevealSection className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={project.status} />
              {customerName &&
                (isStaff && project.customers?.id ? (
                  <Link
                    href={`/crm/asiakkaat/${project.customers.id}`}
                    className="text-sm text-copper hover:underline"
                  >
                    {customerName}
                  </Link>
                ) : (
                  <span className="text-sm text-ink-ghost">{customerName}</span>
                ))}
              {!customerName && isStaff && (
                <span className="text-sm text-ink-ghost">Ei asiakasta</span>
              )}
              {assigneeName && (
                <span className="text-xs px-2 py-0.5 rounded-md border border-wire bg-surface text-ink-ghost">
                  {assigneeName}
                </span>
              )}
            </div>
          </div>
          {isStaff && (
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-wire text-xs text-ink-ghost hover:text-ink hover:border-copper transition-colors shrink-0"
            >
              <Pencil size={13} />
              Muokkaa
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4 bg-elevated border border-wire rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Edistyminen</span>
            <span className="text-sm font-bold text-copper tabular-nums">
              {isStaff ? progress : project.progress_pct}%
            </span>
          </div>
          {isStaff ? (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="flex-1 accent-copper"
              />
              {progress !== project.progress_pct && (
                <button
                  onClick={saveProgress}
                  disabled={saving}
                  className="px-3 py-1 rounded-lg bg-copper text-white text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? "..." : "Tallenna"}
                </button>
              )}
            </div>
          ) : (
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full bg-copper rounded-full transition-all"
                style={{ width: `${project.progress_pct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-wire">
        {(["info", "tasks", "files", "kommentit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === t
                ? "border-copper text-copper"
                : "border-transparent text-ink-ghost hover:text-ink",
            )}
          >
            {t === "info"
              ? "Tiedot"
              : t === "tasks"
                ? `Tehtävät (${tasks.length})`
                : t === "files"
                  ? `Tiedostot (${files.length})`
                  : "Kommentit"}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <InfoTab
          project={project}
          isStaff={isStaff}
          customerName={customerName}
          assigneeName={assigneeName}
        />
      )}

      {tab === "tasks" && <TasksTab tasks={tasks} />}

      {tab === "files" && (
        <FilesTab
          files={files}
          isStaff={isStaff}
          uploading={uploading}
          uploadError={uploadError}
          onUpload={handleUpload}
          onDownload={downloadFile}
        />
      )}

      {tab === "kommentit" && (
        <CommentsTab
          commentsLoaded={commentsLoaded}
          comments={comments}
          canModerate={canModerate}
          onDeleteComment={(id) => setCommentToDelete(id)}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onSendComment={sendComment}
          sending={sending}
          commentsEndRef={commentsEndRef}
        />
      )}

      {showEdit && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSaved={() => window.location.reload()}
        />
      )}

      {commentToDelete && (
        <ConfirmDialog
          title="Siirrä roskakoriin"
          message="Kommentti siirretään roskakoriin. Vain omistaja voi palauttaa tai poistaa sen pysyvästi."
          confirmLabel="Siirrä roskakoriin"
          onClose={() => setCommentToDelete(null)}
          onConfirm={() => deleteComment(commentToDelete)}
        />
      )}
    </RevealSection>
  );
}
