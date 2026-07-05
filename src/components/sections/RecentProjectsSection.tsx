"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Globe, Cpu, ShoppingCart, Smartphone } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";

const EXAMPLES = [
  {
    id: "ecommerce",
    name: "Verkkokauppa",
    servicePath: "/palvelut/verkkokaupat",
    description:
      "Räätälöity verkkokauppa maksuintegraatioilla (Stripe, Klarna) ja automatisoidulla varastonhallinnalla.",
    techs: ["Shopify", "Stripe", "Klarna"],
    icon: ShoppingCart,
  },
  {
    id: "ai-chatbot",
    name: "AI-asiakaspalvelu",
    servicePath: "/palvelut/ai-ratkaisut",
    description:
      "24/7 asiakaspalveluautomaatio OpenAI:n päällä — vähentää tukipyyntöjen määrää ja nopeuttaa vasteaikaa.",
    techs: ["OpenAI", "Node.js", "React"],
    icon: Cpu,
  },
  {
    id: "mobile-app",
    name: "Mobiilisovellus",
    servicePath: "/palvelut/mobiilisovellukset",
    description:
      "Natiivi React Native -sovellus iOS:lle ja Androidille — push-ilmoitukset, kanta-asiakasjärjestelmä ja tilaukset.",
    techs: ["React Native", "Firebase", "Stripe"],
    icon: Smartphone,
  },
  {
    id: "website",
    name: "Verkkosivut",
    servicePath: "/palvelut/verkkosivut",
    description:
      "SEO-optimoitu Next.js-verkkosivusto — nopea latausaika ja huippuluokan Google Lighthouse -pisteet.",
    techs: ["Next.js", "TypeScript", "Vercel"],
    icon: Globe,
  },
];

export function RecentProjectsSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-surface/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            Osaamisemme
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Esimerkkejä siitä, mitä rakennamme.
            </h2>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-copper text-sm font-medium hover:gap-3 transition-all duration-150 shrink-0"
            >
              Katso portfolio
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {EXAMPLES.map(
            ({ id, name, servicePath, description, techs, icon: Icon }) => (
              <motion.div
                key={id}
                variants={fadeUp}
                className="group rounded-xl border border-wire bg-elevated overflow-hidden hover:-translate-y-1 hover:shadow-glow hover:border-copper/30 transition-all duration-200"
              >
                <div className="h-44 bg-gradient-to-br from-copper/10 to-transparent flex items-center justify-center relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,129,58,0.12)_0%,_transparent_70%)]" />
                  <div className="w-14 h-14 rounded-2xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper">
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-surface/70 border border-wire text-ink-dim backdrop-blur-sm">
                      {name}
                    </span>
                  </div>
                </div>

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
                    href={servicePath}
                    className="inline-flex items-center gap-1.5 text-copper text-xs font-medium mt-1 group-hover:gap-2.5 transition-all duration-150"
                  >
                    Lue lisää
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ),
          )}
        </RevealGroup>
      </Container>
    </section>
  );
}
