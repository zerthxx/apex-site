import type { MetadataRoute } from "next";
import { getBlogPostSlugs, getCaseStudySlugs } from "@/lib/sanity/fetch";

const BASE_URL = "https://apexsite.fi";

const STATIC_ROUTES: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { url: "/", priority: 1.0, changeFrequency: "weekly" },
  { url: "/palvelut", priority: 0.9, changeFrequency: "monthly" },
  { url: "/palvelut/verkkosivut", priority: 0.9, changeFrequency: "monthly" },
  { url: "/palvelut/verkkokaupat", priority: 0.9, changeFrequency: "monthly" },
  { url: "/palvelut/mobiilisovellukset", priority: 0.9, changeFrequency: "monthly" },
  { url: "/palvelut/ai-ratkaisut", priority: 0.9, changeFrequency: "monthly" },
  { url: "/palvelut/ohjelmistot", priority: 0.9, changeFrequency: "monthly" },
  { url: "/portfolio", priority: 0.8, changeFrequency: "weekly" },
  { url: "/prosessi", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hinnoittelu", priority: 0.8, changeFrequency: "monthly" },
  { url: "/meista", priority: 0.7, changeFrequency: "monthly" },
  { url: "/ukk", priority: 0.7, changeFrequency: "monthly" },
  { url: "/yhteystiedot", priority: 0.8, changeFrequency: "monthly" },
  { url: "/blogi", priority: 0.8, changeFrequency: "daily" },
  { url: "/urat", priority: 0.5, changeFrequency: "weekly" },
  { url: "/tietosuoja", priority: 0.3, changeFrequency: "yearly" },
  { url: "/kayttoehdot", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogSlugs, caseStudySlugs] = await Promise.all([
    getBlogPostSlugs().catch(() => [] as string[]),
    getCaseStudySlugs().catch(() => [] as string[]),
  ]);

  const staticEntries = STATIC_ROUTES.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    priority,
    changeFrequency,
  }));

  const blogEntries = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blogi/${slug}`,
    lastModified: new Date(),
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  const portfolioEntries = caseStudySlugs.map((slug) => ({
    url: `${BASE_URL}/portfolio/${slug}`,
    lastModified: new Date(),
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...staticEntries, ...blogEntries, ...portfolioEntries];
}
