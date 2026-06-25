import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Urat — Töihin Apex Siteen",
  description:
    "Haluatko rakentaa tulevaisuuden digitaalisia tuotteita? Katso avoimet paikat ja lähetä avoin hakemus.",
  alternates: { canonical: "https://apexsite.fi/urat" },
};

const OPEN_POSITIONS = [
  {
    title: "Senior Full-Stack Developer",
    type: "Kokopäiväinen",
    location: "Helsinki / Etätyö",
    description: "Etsimme kokenutta full-stack kehittäjää React/Next.js + Node.js/Python osaamisella. Haluamme tiimiin ihmisiä, jotka rakastavat koodin lisäksi myös asiakastyötä.",
    requirements: ["React/Next.js 3+ vuotta", "Node.js tai Python backend", "PostgreSQL tai MongoDB", "Git, CI/CD", "Suomen kielen taito"],
  },
  {
    title: "UI/UX Designer",
    type: "Kokopäiväinen / Osa-aikainen",
    location: "Helsinki / Etätyö",
    description: "Etsimme suunnittelijaa, joka ymmärtää sekä käyttäjäkokemuksen että liiketoiminnan. Figma-osaaminen on ehdoton, kokemus konversio-optimoinnista on etu.",
    requirements: ["Figma", "Käyttäjätutkimus", "Konversio-optimointi", "Design systems", "Suomen kielen taito"],
  },
  {
    title: "AI/ML Engineer",
    type: "Projektiluonteinen / Pysyvä",
    location: "Etätyö",
    description: "Etsimme AI-insinööriä rakentamaan yritysten AI-ratkaisuja: RAG-järjestelmiä, agentteja ja automaatioita. Python + LangChain/LlamaIndex kokemus on must.",
    requirements: ["Python", "OpenAI API tai Anthropic", "LangChain tai LlamaIndex", "Vector-tietokannat", "Englannin kielen taito"],
  },
];

const BENEFITS = [
  { title: "Kilpailukykyinen palkka", description: "Maksamme alan yläpäästä. Säännölliset palkkakatselmoinnit." },
  { title: "Etätyömahdollisuus", description: "Teet töitä sieltä mistä parhaiten sujuu. Toimisto Helsingissä." },
  { title: "Kehittyminen", description: "Konferenssit, kurssit ja sertifikaatit yrityksen kustantamana." },
  { title: "Laitteet", description: "Macbook Pro tai muu haluamasi laite. Oheislaitteet tarpeen mukaan." },
  { title: "Mielenkiintoiset projektit", description: "Ei tylsiä yritystietojärjestelmiä. Projekteissa on aina jotain uutta opittavaa." },
  { title: "Pieni tiimi", description: "Ei byrokratiaa, ei turhia palavereja. Työ näkyy ja vaikuttaa suoraan." },
];

export default function UratPage() {
  return (
    <>
      <PageHero
        eyebrow="Urat"
        title="Rakennamme tulevaisuuden ohjelmistoja — tule mukaan."
        description="Apex Site on pieni, kunnianhimoinen tiimi. Teemme laadukkaita projekteja vaativille asiakkaille. Etsimme ihmisiä, joille laatu on tärkeämpää kuin nopeus."
        cta={{ label: "Lähetä avoin hakemus", href: "mailto:rekry@apexsite.fi" }}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10">Avoimet paikat</h2>
          <div className="space-y-6">
            {OPEN_POSITIONS.map((pos) => (
              <div key={pos.title} className="p-6 sm:p-8 rounded-xl bg-elevated border border-wire hover:border-copper/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-ink text-xl mb-2">{pos.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">{pos.type}</Badge>
                      <Badge variant="outline">{pos.location}</Badge>
                    </div>
                  </div>
                  <a
                    href={`mailto:rekry@apexsite.fi?subject=Hakemus: ${pos.title}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors shrink-0"
                  >
                    Hae paikkaa <ArrowRight size={14} />
                  </a>
                </div>
                <p className="text-ink-dim text-sm leading-relaxed mb-4">{pos.description}</p>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-ghost mb-2">Vaatimukset</p>
                  <div className="flex flex-wrap gap-2">
                    {pos.requirements.map((r) => (
                      <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-subtle border border-wire text-ink-dim">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl border border-wire-bold bg-surface text-center">
            <p className="text-ink-dim mb-3">Sopivaa paikkaa ei listalla? Lähetä avoin hakemus.</p>
            <a
              href="mailto:rekry@apexsite.fi"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors"
            >
              rekry@apexsite.fi <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">Miksi Apex Site?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-5 rounded-xl bg-elevated border border-wire">
                <h3 className="font-heading font-semibold text-ink mb-2 text-sm">{b.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
