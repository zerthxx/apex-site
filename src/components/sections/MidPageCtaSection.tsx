"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TRUST = ["Maksuton kartoitus", "Tarjous 48 h", "Ei sitoutumista"];

export function MidPageCtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border border-wire/50 bg-copper/8 overflow-hidden px-8 py-12 sm:px-12 text-center backdrop-blur-sm"
          style={{ boxShadow: "inset 0 1px 0 rgba(200,129,58,0.15)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,129,58,0.10)_0%,_transparent_65%)]" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Aloitetaan
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4 max-w-2xl mx-auto">
              Onko sinulla projekti mielessä?
            </h2>
            <p className="text-ink-dim leading-relaxed mb-8 max-w-xl mx-auto">
              Varaa maksuton 30 minuutin kartoitus. Käymme ideasi läpi ja suosittelemme
              yrityksellesi sopivan ratkaisun ilman sitoutumista.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-7">
              <Button asChild size="lg" className="group">
                <Link href="/yhteystiedot">
                  Varaa kartoitus
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/yhteystiedot">Pyydä tarjous</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {TRUST.map((t) => (
                <span key={t} className="text-sm text-ink-dim flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-copper shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
