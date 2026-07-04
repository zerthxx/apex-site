import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { getBlogPostBySlug, getBlogPostSlugs } from "@/lib/sanity/fetch";
import { formatDate } from "@/lib/utils";

interface PortableTextSpan {
  _type: "span";
  text: string;
}

interface PortableTextBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: PortableTextSpan[];
}

function isPortableTextBlock(block: unknown): block is PortableTextBlock {
  return typeof block === "object" && block !== null && "_type" in block;
}

function blockText(block: PortableTextBlock): string {
  return (block.children ?? []).map((child) => child.text).join("");
}

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs().catch(() => [] as string[]);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) return {};

  return {
    title: post.seo?.title ?? `${post.title} — Apex Site`,
    description: post.seo?.description ?? post.excerpt,
    alternates: { canonical: `https://apexsite.fi/blogi/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);

  if (!post) notFound();

  return (
    <>
      <article className="pt-32 pb-20 md:pt-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Link
            href="/blogi"
            className="inline-flex items-center gap-2 text-ink-dim hover:text-ink text-sm mb-8 transition-colors duration-150"
          >
            <ArrowLeft size={16} /> Takaisin blogiin
          </Link>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.categories?.map((cat) => (
              <Badge key={cat.slug.current} variant="teal" size="sm">
                {cat.title}
              </Badge>
            ))}
          </div>

          <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-ink-ghost text-sm mb-10 pb-6 border-b border-wire">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-elevated flex items-center justify-center text-copper text-xs font-bold shrink-0">
              {post.author?.photo?.asset.url ? (
                <Image
                  src={post.author.photo.asset.url}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                (post.author?.name?.[0] ?? "A")
              )}
            </div>
            <span>{post.author?.name ?? "Apex Site"}</span>
            {post.publishedAt && (
              <>
                <span>·</span>
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </>
            )}
          </div>

          {post.coverImage?.asset.url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-elevated mb-10">
              <Image
                src={post.coverImage.asset.url}
                alt={post.coverImage.alt ?? post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          <div className="flex flex-col gap-4 text-ink-dim leading-relaxed">
            {(post.body ?? []).filter(isPortableTextBlock).map((block) => {
              const text = blockText(block);
              if (!text) return null;
              if (block.style === "h2") {
                return (
                  <h2
                    key={block._key}
                    className="font-heading font-semibold text-ink text-2xl mt-6"
                  >
                    {text}
                  </h2>
                );
              }
              if (block.style === "h3") {
                return (
                  <h3
                    key={block._key}
                    className="font-heading font-semibold text-ink text-xl mt-4"
                  >
                    {text}
                  </h3>
                );
              }
              return <p key={block._key}>{text}</p>;
            })}
          </div>
        </div>
      </article>

      <ContactCtaSection />
    </>
  );
}
