import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { BlogPostPreview } from "@/lib/types";

interface BlogPostCardProps {
  post: BlogPostPreview;
  featured?: boolean;
  className?: string;
}

export function BlogPostCard({ post, featured = false, className }: BlogPostCardProps) {
  return (
    <Link
      href={`/blogi/${post.slug}`}
      className={cn(
        "group flex overflow-hidden rounded-xl border border-wire bg-surface",
        "hover:border-copper/30 hover:shadow-card-hover transition-all duration-300",
        featured ? "flex-row" : "flex-col",
        className
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-elevated shrink-0",
          featured
            ? "w-1/2 aspect-auto min-h-[240px]"
            : "aspect-video w-full"
        )}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-copper/10 to-teal-brand/5" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-3 p-5", featured && "justify-center")}>
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {post.categories.map((cat) => (
            <Badge key={cat} variant="teal" size="sm">{cat}</Badge>
          ))}
        </div>

        <h3
          className={cn(
            "font-heading font-semibold text-ink leading-snug group-hover:text-copper transition-colors duration-150",
            featured ? "text-xl sm:text-2xl" : "text-base"
          )}
        >
          {post.title}
        </h3>

        <p className="text-ink-dim text-sm leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-ink-ghost text-xs mt-auto pt-3 border-t border-wire">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-elevated flex items-center justify-center text-copper text-xs font-bold">
              {post.author.avatar ? (
                <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" sizes="24px" />
              ) : (
                post.author.name[0]
              )}
            </div>
            <span>{post.author.name}</span>
          </div>
          <span>·</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.readTime && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readTime} min
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
