"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TECH_STACK } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useRevealInView } from "@/lib/useRevealInView";

const CATEGORIES = [
  "Frontend",
  "Backend",
  "Mobile",
  "Cloud",
  "AI",
  "CMS",
] as const;

const TECH_LOGO_URLS: Record<string, string> = {
  React: "https://cdn.simpleicons.org/react/61DAFB",
  "Next.js": "https://cdn.simpleicons.org/nextdotjs/ffffff",
  TypeScript: "https://cdn.simpleicons.org/typescript/3178C6",
  "Node.js": "https://cdn.simpleicons.org/nodedotjs/339933",
  Python: "https://cdn.simpleicons.org/python/3776AB",
  PostgreSQL: "https://cdn.simpleicons.org/postgresql/4169E1",
  MongoDB: "https://cdn.simpleicons.org/mongodb/47A248",
  Swift: "https://cdn.simpleicons.org/swift/F05138",
  Kotlin: "https://cdn.simpleicons.org/kotlin/7F52FF",
  AWS: "https://cdn.simpleicons.org/amazonaws/FF9900",
  Vercel: "https://cdn.simpleicons.org/vercel/ffffff",
  Supabase: "https://cdn.simpleicons.org/supabase/3ECF8E",
  OpenAI: "https://cdn.simpleicons.org/openai/ffffff",
  Stripe: "https://cdn.simpleicons.org/stripe/635BFF",
  Shopify: "https://cdn.simpleicons.org/shopify/96BF48",
  WordPress: "https://cdn.simpleicons.org/wordpress/21759B",
  Sanity: "https://cdn.simpleicons.org/sanity/F03E2F",
  Redis: "https://cdn.simpleicons.org/redis/DC382D",
};

export function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref);

  return (
    <section className="py-10 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Teknologia"
          heading="Teknologiat, joita käytämme"
          subheading="Valitsemme aina oikean teknologian kullekin projektille."
          className="mb-12"
        />

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-8"
        >
          {CATEGORIES.map((category) => {
            const items = TECH_STACK.filter((t) => t.category === category);
            if (!items.length) return null;
            return (
              <motion.div
                key={category}
                variants={fadeUp}
                className="flex flex-col gap-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-ghost">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((tech) => (
                    <div
                      key={tech.name}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg",
                        "border border-wire bg-surface",
                        "hover:border-copper/30 hover:bg-elevated",
                        "transition-all duration-200 group",
                      )}
                    >
                      {TECH_LOGO_URLS[tech.name] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={TECH_LOGO_URLS[tech.name]}
                          alt=""
                          width={18}
                          height={18}
                          className="shrink-0 opacity-75 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      <span className="text-sm font-medium text-ink-dim group-hover:text-ink transition-colors duration-150">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-ink-ghost text-sm text-center mt-10 max-w-2xl mx-auto leading-relaxed"
        >
          Käytämme moderneja ja pitkäikäisiä teknologioita, jotta ratkaisusi on
          turvallinen, nopea ja helposti laajennettava myös tulevaisuudessa.
        </motion.p>
      </div>
    </section>
  );
}
