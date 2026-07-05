"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ChevronDown,
  Globe,
  Cpu,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LightRays } from "@/components/ui/LightRays";
import { Container } from "@/components/shared/Container";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { fadeUp, staggerContainer } from "@/lib/animations";

const SERVICE_PILLS = [
  { icon: Globe, label: "Verkkosivut" },
  { icon: Cpu, label: "AI-ratkaisut" },
  { icon: ShoppingCart, label: "Verkkokaupat" },
  { icon: Smartphone, label: "Mobiilisovellukset" },
];

/* ── Light Rays hero background — subtle, mouse-reactive, reduced on mobile ── */
function HeroLightRays({ reduced }: { reduced: boolean | null }) {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen"
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#C8813A"
        raysSpeed={isMobile ? 0.3 : 0.5}
        lightSpread={0.85}
        rayLength={isMobile ? 1.0 : 1.5}
        pulsating={false}
        fadeDistance={1.1}
        saturation={1.15}
        followMouse={!isMobile}
        mouseInfluence={0.4}
        noiseAmount={0.05}
        distortion={0.0}
      />
    </div>
  );
}

/* ── Dashboard mock ─────────────────────────────────────────────────────── */
function HeroVisual({ reduced }: { reduced: boolean | null }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 35,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 35,
  });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`glow-ring relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto${!reduced ? " animate-float-slow" : ""}`}
      style={{ rotate: -2, perspective: 1000 }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl border border-white/8 bg-surface/60 backdrop-blur-xl shadow-modal overflow-hidden"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-copper/5 to-transparent pointer-events-none" />
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
              <div
                key={stat.label}
                className="bg-surface rounded-xl p-3 border border-wire"
              >
                <p className="text-xs text-ink-ghost mb-1">{stat.label}</p>
                <p className={`text-base font-bold font-heading ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          {/* Chart mock */}
          <div className="bg-surface rounded-xl p-3 border border-wire">
            <div className="flex items-end gap-1.5 h-16">
              {[40, 65, 45, 80, 55, 90, 75, 95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.6 + i * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex-1 rounded-sm bg-linear-to-t from-copper/60 to-copper/20"
                />
              ))}
            </div>
          </div>
          {/* List items */}
          <div className="space-y-2">
            {[
              {
                label: "Uusi verkkokauppa",
                status: "Valmis",
                color: "text-ok",
              },
              {
                label: "AI-chatbot integraatio",
                status: "Käynnissä",
                color: "text-copper",
              },
              {
                label: "Mobiilisovellus v2",
                status: "Suunnittelu",
                color: "text-teal-brand",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + i * 0.1 }}
                className="flex items-center justify-between"
              >
                <p className="text-xs text-ink-dim">{item.label}</p>
                <span className={`text-xs font-medium ${item.color}`}>
                  {item.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-4 -right-4 bg-elevated border border-wire rounded-xl px-3 py-2 flex items-center gap-2 shadow-card-hover"
      >
        <div className="w-2 h-2 rounded-full bg-ok animate-pulse" />
        <span className="text-xs text-ink font-medium">Projekti käynnissä</span>
      </motion.div>
    </motion.div>
  );
}

/* ── Word-by-word animated headline ─────────────────────────────────────── */
const HEADLINE_WORDS = ["Rakennamme", "ohjelmistoja,", "jotka"];

const wordVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: 0.1 + i * 0.08,
      ease: "easeOut" as const,
    },
  }),
};

/* ── Stats ───────────────────────────────────────────────────────────────── */
const STATS = [
  { to: 47, suffix: "+", label: "projektia toteutettu" },
  { to: 98, suffix: " %", label: "tyytyväisiä asiakkaita" },
  { to: 5, suffix: "★", label: "Google-arvosana" },
];

/* ── Main export ─────────────────────────────────────────────────────────── */
export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative min-h-[65dvh] md:min-h-[78dvh] flex flex-col overflow-hidden bg-base">
      {/* Light Rays shader background */}
      <HeroLightRays reduced={prefersReduced} />

      {/* Film grain */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] grain-texture pointer-events-none"
      />

      {/* Main content */}
      <Container className="relative z-10 flex-1 flex items-center pt-24 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center py-14 lg:py-0 w-full">
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4 md:gap-6"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="teal">Suomalainen ohjelmistotalo</Badge>
            </motion.div>

            {/* Word-by-word headline */}
            <h1 className="font-display font-bold text-ink text-4xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tighter">
              <span style={{ perspective: 600 }}>
                {HEADLINE_WORDS.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={i}
                    variants={wordVariant}
                    initial="hidden"
                    animate="visible"
                    className="inline-block mr-[0.22em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <motion.span
                custom={HEADLINE_WORDS.length}
                variants={wordVariant}
                initial="hidden"
                animate="visible"
                className="inline-block bg-gradient-to-r from-copper via-copper-light to-teal-brand bg-clip-text text-transparent"
              >
                kasvattavat
              </motion.span>
              <motion.span
                custom={HEADLINE_WORDS.length + 1}
                variants={wordVariant}
                initial="hidden"
                animate="visible"
                className="inline-block ml-[0.22em]"
              >
                liiketoimintaasi.
              </motion.span>
            </h1>

            <motion.p
              variants={fadeUp}
              className="text-ink-dim text-lg sm:text-xl leading-relaxed max-w-lg"
            >
              Verkkosivuista mobiilisovelluksiin ja AI-ratkaisuihin — Apex Site
              on täyspalvelun kumppanisi digitaalisessa kasvussa.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/yhteystiedot">Pyydä ilmainen tarjous</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/portfolio">Katso töitämme</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-3">
              <p className="text-ink-ghost text-sm leading-relaxed max-w-lg">
                Yksi kumppani kaikkiin digitaalisiin ratkaisuihin – verkkosivut,
                verkkokaupat, AI-ratkaisut ja mobiilisovellukset.
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_PILLS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-wire bg-surface/60 text-ink-dim hover:border-copper/30 hover:text-ink transition-all duration-150"
                  >
                    <Icon size={13} strokeWidth={1.5} />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Social proof avatars */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {["MK", "JL", "AT", "RV"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-base bg-copper/20 flex items-center justify-center text-copper text-[10px] font-bold"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-ink-ghost">
                <span className="text-ink font-semibold">47+</span> tyytyväistä
                asiakasta
              </p>
            </motion.div>
          </motion.div>

          {/* Right: visual */}
          <div className="flex items-center justify-center">
            <HeroVisual reduced={prefersReduced} />
          </div>
        </div>
      </Container>

      {/* Stats bar */}
      <div className="border-t border-wire bg-surface/50 backdrop-blur-sm">
        <Container>
          <div className="grid grid-cols-3 divide-x divide-wire py-5">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="flex flex-col items-center gap-0.5 px-4"
              >
                <span className="font-display font-bold text-copper text-2xl sm:text-3xl">
                  <AnimatedCounter
                    to={stat.to}
                    suffix={stat.suffix}
                    duration={1.8}
                  />
                </span>
                <span className="text-xs sm:text-sm text-ink-ghost text-center">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-ghost animate-scroll-hint">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}
