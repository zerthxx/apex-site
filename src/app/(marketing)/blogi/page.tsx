import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { BlogPostCard } from "@/components/shared/BlogPostCard";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { getBlogPosts } from "@/lib/sanity/fetch";
import type { SanityBlogPost, BlogPostPreview } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blogi — Apex Site",
  description:
    "Ajatuksia ja oppeja verkkosivuista, verkkokaupoista, mobiilisovelluksista ja AI-ratkaisuista.",
  alternates: { canonical: "https://apexsite.fi/blogi" },
};

function toPreview(post: SanityBlogPost): BlogPostPreview {
  return {
    slug: post.slug.current,
    title: post.title,
    excerpt: post.excerpt ?? "",
    coverImage: post.coverImage?.asset.url ?? "",
    publishedAt: post.publishedAt ?? "",
    categories: post.categories?.map((c) => c.title) ?? [],
    author: {
      name: post.author?.name ?? "Apex Site",
      avatar: post.author?.photo?.asset.url ?? "",
    },
  };
}

export default async function BlogiPage() {
  const posts = await getBlogPosts().catch(() => [] as SanityBlogPost[]);

  return (
    <>
      <PageHero
        eyebrow="Blogi"
        title="Ajatuksia ja oppeja."
        description="Kirjoituksia verkkosivuista, verkkokaupoista, mobiilisovelluksista ja AI-ratkaisuista."
        cta={{ label: "Ota yhteyttä", href: "/yhteystiedot" }}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post._id} post={toPreview(post)} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-elevated border border-wire text-ink-dim text-sm">
                <span className="text-2xl">🚧</span>
                <span>
                  Blogimme on rakenteilla — ensimmäiset kirjoitukset lisätään
                  pian.
                </span>
              </div>
              <p className="mt-8 text-ink-dim text-sm">
                Haluatko tietää lisää palveluistamme?{" "}
                <Link
                  href="/yhteystiedot"
                  className="text-copper hover:underline"
                >
                  Ota yhteyttä
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
