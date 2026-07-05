export interface ProjectQuote {
  id: string;
  title: string;
  status: string;
  amount?: number | null;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  progress_pct: number;
  deadline?: string | null;
  budget?: number | null;
  description?: string | null;
  created_at: string;
  assigned_to?: string | null;
  customers?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  quotes?: ProjectQuote[] | null;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string | null;
}

export interface ProjectFile {
  id: string;
  name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  version: number;
  created_at: string;
  uploaded_by?: string | null;
}

export interface AssignedProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface StaffMember {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author_name: string;
  is_own: boolean;
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planning: "Suunnittelu",
  development: "Kehitys",
  testing: "Testaus",
  review: "Katselmus",
  completed: "Valmis",
  cancelled: "Peruttu",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "Tekemättä",
  in_progress: "Työn alla",
  done: "Valmis",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "text-ink-ghost",
  medium: "text-copper",
  high: "text-caution",
  urgent: "text-bad",
};

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
