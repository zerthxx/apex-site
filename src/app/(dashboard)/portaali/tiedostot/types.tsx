import { File, FileImage, FileText, FileCode } from "lucide-react";

export interface ProjectFile {
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

export interface Project {
  id: string;
  name: string;
  customer_id: string | null;
}

export interface FileRequest {
  id: string;
  project_id: string;
  customer_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "pending" | "fulfilled" | "cancelled";
  created_at: string;
}

export function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fi-FI");
}

export function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <File size={15} className="text-ink-ghost" />;
  if (mime.startsWith("image/"))
    return <FileImage size={15} className="text-copper" />;
  if (mime === "application/pdf")
    return <FileText size={15} className="text-bad" />;
  if (mime.startsWith("text/") || mime.includes("json") || mime.includes("xml"))
    return <FileCode size={15} className="text-ok" />;
  return <File size={15} className="text-ink-ghost" />;
}
