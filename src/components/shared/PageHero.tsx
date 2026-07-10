import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RequestQuoteLink } from "@/components/ui/RequestQuoteLink";
import { Container } from "@/components/shared/Container";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string; requiresAuth?: boolean };
  secondaryCta?: { label: string; href: string };
  backgroundVariant?: "default" | "service" | "minimal";
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
  secondaryCta,
  backgroundVariant = "default",
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28",
        className,
      )}
    >
      {/* Background decoration */}
      {backgroundVariant !== "minimal" && (
        <>
          <div
            aria-hidden
            className={cn(
              "absolute -top-40 right-0 w-[600px] h-[600px] rounded-full pointer-events-none",
              "bg-copper/5 blur-[120px]",
            )}
          />
          {backgroundVariant === "service" && (
            <div
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-copper/0 via-copper to-copper/0"
            />
          )}
        </>
      )}

      <Container className="relative">
        <div className="max-w-3xl">
          {eyebrow && (
            <Badge variant="teal" className="mb-6">
              {eyebrow}
            </Badge>
          )}
          <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
            {title}
          </h1>
          {description && (
            <p className="text-ink-dim text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              {description}
            </p>
          )}
          {(cta || secondaryCta) && (
            <div className="flex flex-wrap gap-4">
              {cta &&
                (cta.requiresAuth ? (
                  <Button size="lg" asChild>
                    <RequestQuoteLink href={cta.href}>
                      {cta.label}
                    </RequestQuoteLink>
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <Link href={cta.href}>{cta.label}</Link>
                  </Button>
                ))}
              {secondaryCta && (
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  rightIcon={<ArrowRight size={18} />}
                >
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
