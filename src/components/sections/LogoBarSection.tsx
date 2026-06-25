import { cn } from "@/lib/utils";

const CLIENTS = [
  "Leinonen Group",
  "NordicTech Oy",
  "Virtanen Consulting",
  "Helsinki Digital",
  "Suomi Ventures",
  "Arctic Software",
  "Polar Systems",
  "Nordic Commerce",
];

const doubled = [...CLIENTS, ...CLIENTS];

function Dot() {
  return (
    <span aria-hidden className="w-1 h-1 rounded-full bg-copper/30 shrink-0 inline-block" />
  );
}

export function LogoBarSection() {
  return (
    <section className="py-12 border-y border-wire bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-ghost">
          Luottavat asiakkaamme
        </p>
      </div>

      {/* Ticker with fade edges */}
      <div
        className="ticker-wrapper ticker-fade overflow-hidden"
        aria-label="Asiakkaiden nimet"
      >
        <div className="ticker-track flex items-center gap-10 animate-ticker w-max">
          {doubled.map((name, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-10 shrink-0",
                "text-ink-ghost/70 hover:text-ink-ghost transition-colors duration-200",
                "font-heading font-medium text-xs tracking-[0.12em] uppercase"
              )}
            >
              <span>{name}</span>
              <Dot />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
