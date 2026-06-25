export interface NavItem {
  label: string;
  href: string;
}

export interface NavDropdownItem extends NavItem {
  description: string;
  icon?: string;
}

export interface NavLink {
  label: string;
  href: string;
  dropdown?: NavDropdownItem[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  href: string;
  startingPrice?: string;
}

export interface TechItem {
  name: string;
  logo: string;
  category: "Frontend" | "Backend" | "Mobile" | "Cloud" | "AI" | "CMS";
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface Differentiator {
  icon: string;
  title: string;
  proof: string;
  description: string;
}

export interface CaseStudyPreview {
  slug: string;
  client: string;
  title: string;
  service: string;
  coverImage: string;
  outcome: string;
}

export interface BlogPostPreview {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  categories: string[];
  author: { name: string; avatar: string };
  readTime?: number;
}

export interface SanityBlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  coverImage?: { asset: { url: string }; alt?: string };
  body?: unknown[];
  author?: { name: string; photo?: { asset: { url: string } } };
  publishedAt?: string;
  categories?: Array<{ title: string; slug: { current: string } }>;
  seo?: { title?: string; description?: string };
  featured?: boolean;
}

export interface SanityCaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  service?: string;
  coverImage?: { asset: { url: string }; alt?: string };
  gallery?: Array<{ asset: { url: string }; alt?: string }>;
  brief?: string;
  solution?: unknown[];
  results?: Array<{ label: string; value: string; description?: string }>;
  technologies?: string[];
  testimonial?: { quote: string; author: string; role: string };
  projectUrl?: string;
  completedAt?: string;
  featured?: boolean;
  seo?: { title?: string; description?: string };
}

export interface ToastMessage {
  id: string;
  variant: "success" | "error" | "info";
  title: string;
  description?: string;
  duration?: number;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg";
export type BadgeVariant = "default" | "accent" | "teal" | "success" | "error" | "outline";
