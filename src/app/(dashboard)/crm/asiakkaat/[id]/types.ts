export interface Company {
  id: string;
  name: string;
  business_id?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  notes?: string | null;
  company_name?: string | null;
  y_tunnus?: string | null;
  toimiala?: string | null;
  lisatiedot?: string | null;
  companies?: Company | null;
}

export interface Quote {
  id: string;
  title: string;
  status: string;
  amount?: number | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  progress_pct: number;
  deadline?: string | null;
}

export interface Invoice {
  id: string;
  invoice_number?: string | null;
  status: string;
  amount?: number | null;
  due_date?: string | null;
}

export interface Payment {
  id: string;
  amount?: number | null;
  currency?: string | null;
  status: string;
  payment_method?: string | null;
  receipt_url?: string | null;
  created_at: string;
  paid_at?: string | null;
}

export interface CustomerNote {
  id: string;
  body: string;
  created_at: string;
}

export interface LeadRequest {
  id: string;
  service?: string | null;
  solution?: string | null;
  message?: string | null;
  budget?: string | null;
  timeline?: string | null;
  contact_preference?: string | null;
  company?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface CustomerFile {
  id: string;
  name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: string;
  project_id: string;
  projects?: { id: string; name: string } | null;
}

export interface CustomerTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string | null;
  project_id: string;
  projects?: { id: string; name: string } | null;
}

export const TASK_LABELS: Record<string, string> = {
  todo: "Tekemättä",
  in_progress: "Työn alla",
  review: "Katselmus",
  done: "Valmis",
};
