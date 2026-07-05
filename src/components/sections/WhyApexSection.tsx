"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import {
  Wand2,
  Code2,
  TrendingUp,
  Headphones,
  HeartHandshake,
  Timer,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TiltCard } from "@/components/ui/TiltCard";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useRevealInView } from "@/lib/useRevealInView";

const WHY_CARDS = [
  {
    icon: Wand2,
    title: "Räätälöity kehitys",
    proof: "100% räätälöity",
    text: "Ei valmiita teemoja tai WordPress-sivustoja. Jokainen ratkaisu rakennetaan juuri sinun tarpeisiisi.",
  },
  {
    icon: Code2,
    title: "Modernit teknologiat",
    proof: "Next.js, React Native, OpenAI",
    text: "Käytämme teknologioita, jotka ovat nopeita, turvallisia ja helposti laajennettavissa.",
  },
  {
    icon: TrendingUp,
    title: "Nopeat ja turvalliset ratkaisut",
    proof: "Lighthouse 95+",
    text: "Jokainen ratkaisu on optimoitu suorituskyvylle, tietoturvalle ja hakukonenäkyvyydelle.",
  },
  {
    icon: Headphones,
    title: "Jatkuva tuki",
    proof: "Aina saatavilla",
    text: "Emme katoa julkaisun jälkeen. Ylläpito, päivitykset ja tuki kuuluvat kumppanuuteemme.",
  },
  {
    icon: HeartHandshake,
    title: "Pitkäaikainen kumppani",
    proof: "Asiakkaat palaavat",
    text: "Rakentamiemme suhteiden perusta on luottamus — asiakkaistamme tulee pitkäaikaisia kumppaneita.",
  },
  {
    icon: Timer,
    title: "Aikataulussa ja budjetissa",
    proof: "Ei yllätyksiä",
    text: "Selkeä prosessi, läpinäkyvä hinnoittelu. Sovittu hinta pysyy eikä projekti veny.",
  },
];

export function WhyApexSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref);

  return (
    <section className="py-10 md:py-20 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Miksi Apex Site"
          heading="Kuusi syytä valita meidät"
          subheading="Emme ole vain toinen toimisto. Tässä on mitä erottaa meidät."
          className="mb-12"
        />

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {WHY_CARDS.map(({ icon: Icon, title, proof, text }, i) => (
            <motion.div key={title} variants={fadeUp}>
              <TiltCard className="relative flex flex-col gap-3 p-6 rounded-xl border border-wire bg-elevated overflow-hidden h-full">
                <span
                  aria-hidden
                  className="absolute top-2 right-4 font-display text-7xl font-bold text-copper/[0.06] select-none leading-none pointer-events-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-11 h-11 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-ink text-base mb-1">
                    {title}
                  </h3>
                  <p className="text-copper text-sm font-semibold mb-2">
                    {proof}
                  </p>
                  <p className="text-ink-ghost text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
