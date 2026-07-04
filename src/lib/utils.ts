import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale = "fi-FI"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

export function readingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/** Escapes characters meaningful to PostgREST's .or() filter grammar (`,` `(` `)`)
 * and to ILIKE's own pattern syntax (`%` `_`), so free-text search input is
 * treated as a literal string instead of breaking the filter or matching
 * unintentionally broadly. */
export function sanitizeIlikeTerm(term: string): string {
  return term.replace(/[,()%_\\]/g, "\\$&");
}
