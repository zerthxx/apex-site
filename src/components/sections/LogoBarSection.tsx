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

export function LogoBarSection() {
  return (
    <section className="py-12 border-y border-wire bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-ghost">
          Luottavat asiakkaamme
        </p>
      </div>

      {/* Ticker */}
      <div
        className="ticker-wrapper overflow-hidden"
        aria-label="Asiakkaiden nimet"
      >
        <div className="ticker-track flex gap-16 animate-ticker w-max">
          {doubled.map((name, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center shrink-0",
                "text-ink-ghost hover:text-ink-dim transition-colors duration-200",
                "font-heading font-semibold text-sm tracking-wide uppercase"
              )}
            >
              <span className="mr-16">{name}</span>
              <span aria-hidden className="text-copper/40 -ml-14">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
