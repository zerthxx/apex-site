"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRevealInView } from "@/lib/useRevealInView";

const PROJECTS = [
  {
    id: "ecommerce",
    name: "Verkkokauppa — Muotiala",
    service: "Verkkokauppa",
    description:
      "Täysin räätälöity Shopify-verkkokauppa muotialan yritykselle. Integroitiin Klarna, Stripe ja varastonhallinta.",
    techs: ["Shopify", "Stripe", "Klarna"],
    emoji: "🛒",
    gradient: "from-copper/20 to-copper/5",
  },
  {
    id: "ai-chatbot",
    name: "AI Chatbot — Asiakaspalvelu",
    service: "AI-ratkaisu",
    description:
      "24/7 asiakaspalveluautomaatio OpenAI:lla. Vähensi tukipyyntöjä 60 % ja nopeutti vasteaikaa.",
    techs: ["OpenAI", "Node.js", "React"],
    emoji: "🤖",
    gradient: "from-copper/15 to-transparent",
  },
  {
    id: "mobile-app",
    name: "Mobiilisovellus — Ravintola",
    service: "Mobiilisovellus",
    description:
      "React Native -sovellus iOS ja Android. Push-ilmoitukset, kanta-asiakasjärjestelmä ja tilaukset.",
    techs: ["React Native", "Firebase", "Stripe"],
    emoji: "📱",
    gradient: "from-copper/12 to-transparent",
  },
  {
    id: "website",
    name: "Verkkosivut — Konsultointi",
    service: "Verkkosivut",
    description:
      "Next.js-verkkosivusto SEO-optimoituna. Latausaika alle 1 s, Google Lighthouse 98/100.",
    techs: ["Next.js", "TypeScript", "Vercel"],
    emoji: "🌐",
    gradient: "from-copper/8 to-transparent",
  },
];

export function RecentProjectsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRevealInView(ref);

  return (
    <section ref={ref} className="py-20 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            Viimeisimmät projektit
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Katso mitä olemme rakentaneet.
            </h2>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-copper text-sm font-medium hover:gap-3 transition-all duration-150 shrink-0"
            >
              Kaikki projektit
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROJECTS.map(
            ({ id, name, service, description, techs, emoji, gradient }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-xl border border-wire bg-elevated overflow-hidden hover:-translate-y-1 hover:shadow-glow hover:border-copper/30 transition-all duration-200"
              >
                {/* Placeholder image area */}
                <div
                  className={`h-44 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,129,58,0.12)_0%,_transparent_70%)]" />
                  <span className="text-5xl select-none">{emoji}</span>
                  <div className="absolute top-3 right-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-surface/70 border border-wire text-ink-dim backdrop-blur-sm">
                      {service}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                  <h3 className="font-heading font-semibold text-ink text-sm leading-snug">
                    {name}
                  </h3>
                  <p className="text-ink-ghost text-xs leading-relaxed flex-1">
                    {description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {techs.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] border border-wire bg-surface text-ink-ghost"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-1.5 text-copper text-xs font-medium mt-1 group-hover:gap-2.5 transition-all duration-150"
                  >
                    Katso projekti
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
