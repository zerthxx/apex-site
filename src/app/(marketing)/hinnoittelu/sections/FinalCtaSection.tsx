import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/shared/Container";

export function FinalCtaSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-elevated border-t border-wire">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-copper/10 blur-[120px]" />
      </div>
      <Container className="relative text-center max-w-3xl">
        <p className="text-ink-ghost text-sm mb-4">
          Etkö ole varma mikä ratkaisu sopii yrityksellesi?
        </p>
        <h2 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-5">
          Varaa maksuton{" "}
          <span className="text-copper">30 minuutin kartoitus.</span>
        </h2>
        <p className="text-ink-dim text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Käymme yhdessä läpi yrityksesi tarpeet ja suosittelemme juuri sinulle
          sopivan ratkaisun ilman sitoutumista.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Button asChild size="lg" className="group">
            <Link href="/yhteystiedot">
              Varaa maksuton kartoitus
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="tel:+358442455490" className="flex items-center gap-2">
              <Phone size={16} /> Soita meille
            </Link>
          </Button>
        </div>
        <p className="text-xs text-ink-ghost">
          Vastaamme 24 tunnissa · Ei sitoutumista · Ilmainen kartoitus
        </p>
      </Container>
    </section>
  );
}
