import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { BlogPostCard } from "@/components/shared/BlogPostCard";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import type { BlogPostPreview } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blogi — Ohjelmistokehitys, AI ja digitaaliset ratkaisut",
  description:
    "Artikkeleita ohjelmistokehityksestä, tekoälystä, verkkosivujen rakentamisesta ja digitaalisesta kasvusta.",
  alternates: { canonical: "https://apexsite.fi/blogi" },
};

const MOCK_POSTS: (BlogPostPreview & { _id: string })[] = [
  {
    _id: "1",
    title: "Next.js 15 vs Remix: Kumpi kannattaa valita vuonna 2025?",
    slug: "nextjs-vs-remix-2025",
    excerpt: "Vertailemme kahta suosittua React-frameworkia suorituskyvyn, developer experiencen ja ekosysteemin näkökulmasta.",
    coverImage: "",
    publishedAt: "2026-06-01T00:00:00Z",
    author: { name: "Apex Site", avatar: "" },
    categories: ["Frontend", "Next.js"],
    readTime: 8,
  },
  {
    _id: "2",
    title: "Miten AI-chatbot vähentää asiakaspalvelun kuormaa 60%?",
    slug: "ai-chatbot-asiakaspalvelu",
    excerpt: "Käytännön opas RAG-pohjaisen chatbotin rakentamiseen yrityksesi asiakaspalveluun.",
    coverImage: "",
    publishedAt: "2026-05-15T00:00:00Z",
    author: { name: "Apex Site", avatar: "" },
    categories: ["AI", "Automaatio"],
    readTime: 6,
  },
  {
    _id: "3",
    title: "Shopify vs WooCommerce 2025: Rehellinen vertailu",
    slug: "shopify-vs-woocommerce-2025",
    excerpt: "Kummassa alustan valinnassa on enemmän järkeä? Vertailimme molemmat suorituskyvyn, kustannusten ja laajennettavuuden suhteen.",
    coverImage: "",
    publishedAt: "2026-05-01T00:00:00Z",
    author: { name: "Apex Site", avatar: "" },
    categories: ["Verkkokauppa", "Shopify"],
    readTime: 10,
  },
];

export default function BlogiPage() {
  const [featured, ...rest] = MOCK_POSTS;

  return (
    <>
      <PageHero
        eyebrow="Blogi"
        title="Näkemyksiä digitaalisesta rakentamisesta."
        description="Artikkeleita verkkosivuista, mobiilisovelluksista, tekoälystä ja ohjelmistokehityksestä — suoraan rakentajilta."
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {featured && (
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-4">Viimeisin artikkeli</p>
              <BlogPostCard post={featured} featured />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
