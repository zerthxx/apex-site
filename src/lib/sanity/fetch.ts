import { getClient, isSanityConfigured } from "./client";
import {
  blogPostsQuery,
  blogPostBySlugQuery,
  blogPostSlugsQuery,
  caseStudiesQuery,
  caseStudyBySlugQuery,
  caseStudySlugsQuery,
  teamMembersQuery,
  siteSettingsQuery,
  featuredBlogPostsQuery,
} from "./queries";
import type { SanityBlogPost, SanityCaseStudy } from "@/lib/types";

export async function getBlogPosts(preview = false): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return [];
  return getClient(preview).fetch(blogPostsQuery, {}, { next: { revalidate: 1800 } });
}

export async function getFeaturedBlogPosts(preview = false): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return [];
  return getClient(preview).fetch(featuredBlogPostsQuery, {}, { next: { revalidate: 1800 } });
}

export async function getBlogPostBySlug(slug: string, preview = false): Promise<SanityBlogPost | null> {
  if (!isSanityConfigured) return null;
  return getClient(preview).fetch(blogPostBySlugQuery, { slug }, { next: { revalidate: 3600 } });
}

export async function getBlogPostSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return [];
  return getClient().fetch(blogPostSlugsQuery, {}, { next: { revalidate: 3600 } });
}

export async function getCaseStudies(preview = false): Promise<SanityCaseStudy[]> {
  if (!isSanityConfigured) return [];
  return getClient(preview).fetch(caseStudiesQuery, {}, { next: { revalidate: 3600 } });
}

export async function getCaseStudyBySlug(slug: string, preview = false): Promise<SanityCaseStudy | null> {
  if (!isSanityConfigured) return null;
  return getClient(preview).fetch(caseStudyBySlugQuery, { slug }, { next: { revalidate: 3600 } });
}

export async function getCaseStudySlugs(): Promise<string[]> {
  if (!isSanityConfigured) return [];
  return getClient().fetch(caseStudySlugsQuery, {}, { next: { revalidate: 3600 } });
}

export async function getTeamMembers(preview = false) {
  if (!isSanityConfigured) return [];
  return getClient(preview).fetch(teamMembersQuery, {}, { next: { revalidate: 3600 } });
}

export async function getSiteSettings(preview = false) {
  if (!isSanityConfigured) return null;
  return getClient(preview).fetch(siteSettingsQuery, {}, { next: { revalidate: 86400 } });
}
