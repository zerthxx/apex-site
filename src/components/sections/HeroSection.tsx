"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { fadeUp, staggerContainer } from "@/lib/animations";

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotate: -2 }}
      className="relative w-full max-w-md mx-auto animate-float-slow"
    >
      {/* Dashboard mock card */}
      <div className="rounded-2xl border border-copper/30 bg-elevated shadow-glow overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-wire bg-surface/80">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-bad/60" />
            <div className="w-3 h-3 rounded-full bg-caution/60" />
            <div className="w-3 h-3 rounded-full bg-ok/60" />
          </div>
          <div className="flex-1 h-5 rounded bg-wire mx-8" />
        </div>
        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Myynti", value: "+47%", color: "text-ok" },
              { label: "Kävijät", value: "+2.3x", color: "text-copper" },
              { label: "Konversio", value: "8.2%", color: "text-teal-brand" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface rounded-xl p-3 border border-wire">
                <p className="text-xs text-ink-ghost mb-1">{stat.label}</p>
                <p className={`text-base font-bold font-heading ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          {/* Chart mock */}
          <div className="bg-surface rounded-xl p-3 border border-wire">
            <div className="flex items-end gap-1.5 h-16">
              {[40, 65, 45, 80, 55, 90, 75, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-linear-to-t from-copper/60 to-copper/20"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          {/* List items */}
          <div className="space-y-2">
            {[
              { label: "Uusi verkkokauppa", status: "Valmis", color: "text-ok" },
              { label: "AI-chatbot integraatio", status: "Käynnissä", color: "text-copper" },
              { label: "Mobiilisovellus v2", status: "Suunnittelu", color: "text-teal-brand" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <p className="text-xs text-ink-dim">{item.label}</p>
                <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const STATS = [
  { to: 47, suffix: "+", label: "projektia toteutettu" },
  { to: 98, suffix: " %", label: "tyytyväisiä asiakkaita" },
  { to: 5, suffix: "★", label: "Google-arvosana" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-dvh flex flex-col overflow-hidden">
      {/* Animated background orbs */}
      <div
        aria-hidden
        className="absolute -top-40 -right-20 w-[700px] h-[700px] rounded-full bg-copper/5 blur-[120px] animate-float-slow pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-teal-brand/5 blur-[100px] animate-float-fast pointer-events-none"
      />
      {/* Topographic texture */}
      <div aria-hidden className="absolute inset-0 topo-texture pointer-events-none" />

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-32 lg:py-0 w-full">
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="teal">🇫🇮 Suomalainen ohjelmistotalo</Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight"
            >
              Rakennamme ohjelmistoja, jotka{" "}
              <span className="text-copper">kasvattavat</span>{" "}
              liiketoimintaasi.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-ink-dim text-lg sm:text-xl leading-relaxed max-w-lg"
            >
              Verkkosivuista mobiilisovelluksiin ja AI-ratkaisuihin —
              Apex Site on täyspalvelun kumppanisi digitaalisessa kasvussa.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/yhteystiedot">Pyydä ilmainen tarjous</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild rightIcon={<ArrowRight size={18} />}>
                <Link href="/portfolio">Katso portfolio</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: visual */}
          <div className="hidden lg:flex items-center justify-center">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-wire bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-wire py-5">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5 px-4">
                <span className="font-display font-bold text-copper text-2xl sm:text-3xl">
                  <AnimatedCounter to={stat.to} suffix={stat.suffix} duration={1.8} />
                </span>
                <span className="text-xs sm:text-sm text-ink-ghost text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-ghost animate-bounce-soft">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}
