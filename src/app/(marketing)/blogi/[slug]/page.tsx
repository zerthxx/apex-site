import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getBlogPostSlugs } from "@/lib/sanity/fetch";
import { formatDate } from "@/lib/utils";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Badge } from "@/components/ui/Badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    alternates: { canonical: `https://apexsite.fi/blogi/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <div className="pt-28 pb-8 bg-surface/30 border-b border-wire">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Link href="/blogi" className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink transition-colors mb-6">
            <ArrowLeft size={14} /> Takaisin blogiin
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories?.map((cat: { title: string; slug: { current: string }; color?: string }) => (
              <Badge key={cat.slug.current} variant={cat.color === "teal" ? "teal" : "default"}>
                {cat.title}
              </Badge>
            ))}
          </div>

          <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && <p className="text-ink-dim text-lg leading-relaxed mb-6">{post.excerpt}</p>}

          <div className="flex items-center gap-3 pt-4 border-t border-wire">
            <div className="w-9 h-9 rounded-full bg-copper/20 flex items-center justify-center text-copper font-bold text-sm">
              {post.author?.name?.[0] ?? "A"}
            </div>
            <div>
              <p className="text-ink text-sm font-medium">{post.author?.name}</p>
              <p className="text-ink-ghost text-xs">
                {post.publishedAt ? formatDate(post.publishedAt) : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-ink-dim text-base leading-relaxed">
              Artikkelin sisältö ladataan Sanity CMS:stä. Lisää artikkeleita Sanity Studiossa osoitteessa <code>/studio</code>.
            </p>
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
