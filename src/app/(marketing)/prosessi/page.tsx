import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "Miten työskentelemme — Prosessimme askel askeleelta",
  description:
    "Selkeä, läpinäkyvä prosessi ideasta tuotantoon. Kartoitus, suunnittelu, toteutus ja julkaisu — joka askel yhdessä.",
  alternates: { canonical: "https://apexsite.fi/prosessi" },
};

const PHASES = [
  {
    phase: "Vaihe 1",
    title: "Kartoitus ja tavoitteet",
    steps: [
      { number: "01", title: "Ensimmäinen puhelu", description: "30 minuutin maksuton puhelu. Kuuntelemme yrityksesi, haasteesi ja tavoitteesi." },
      { number: "02", title: "Kirjallinen tarjous", description: "Toimitamme kirjallisen tarjouksen 48 tunnissa. Kiinteä hinta tai tuntipohja — sovitaan yhdessä." },
      { number: "03", title: "Sopimus ja aloitus", description: "Allekirjoitamme selkeän sopimuksen ja sovimme projektin aloituspäivän." },
    ],
  },
  {
    phase: "Vaihe 2",
    title: "Suunnittelu",
    steps: [
      { number: "04", title: "Vaatimusmäärittely", description: "Dokumentoimme yksityiskohtaisesti kaikki toiminnallisuudet, sivut ja integraatiot." },
      { number: "05", title: "Wireframet", description: "Luomme sivukartan ja rautalankamallinnukset Figmaan ennen yhtäkään koodiriviä." },
      { number: "06", title: "Visuaalinen design", description: "Suunnittelemme täyden designin hyväksyntääsi varten. Iteroimme kunnes olet tyytyväinen." },
    ],
  },
  {
    phase: "Vaihe 3",
    title: "Toteutus",
    steps: [
      { number: "07", title: "Kehitys sprinteissä", description: "Rakennamme 1–2 viikon sprinteissä. Näet konkreettista edistymistä joka viikko." },
      { number: "08", title: "Viikoittainen status", description: "Jokainen viikko alkaa lyhyellä puhelulla: mitä valmistui, mitä seuraavaksi." },
      { number: "09", title: "Testausympäristö", description: "Kaikki kehitetään ensin staging-ympäristöön, jossa pääset testaamaan ennen julkaisua." },
    ],
  },
  {
    phase: "Vaihe 4",
    title: "Julkaisu ja ylläpito",
    steps: [
      { number: "10", title: "Testaus", description: "Huolellinen testaus eri laitteilla, selaimilla ja käyttötapauksilla." },
      { number: "11", title: "Julkaisu", description: "Julkaisemme tuotantoon huolellisesti suunnitellusti. Olemme saatavilla koko prosessin ajan." },
      { number: "12", title: "Jälkihuolto", description: "2 viikon intensiivinen seurantajakso. Kaikki havaitut ongelmat korjataan välittömästi." },
    ],
  },
];

const PRINCIPLES = [
  { title: "Läpinäkyvyys ennen kaikkea", description: "Et koskaan joudu arvailemaan missä projektisi menee. Näet aina tilanteen ja seuraavat askeleet." },
  { title: "Kiinteät hinnat", description: "Tarjous on sitova. Emme lasku ylimääräistä ellei laajuus muutu — siitä sovitaan aina kirjallisesti." },
  { title: "Sinä omistat kaiken", description: "Kaikki koodi, design ja tekijänoikeudet siirtyvät sinulle. Et ole koskaan sidoksissa meihin." },
  { title: "Nopeat iteraatiot", description: "Palaute kiertää nopeasti. 24h vastausaika, muutokset toteutetaan saman viikon aikana." },
];

export default function ProsessiPage() {
  return (
    <>
      <PageHero
        eyebrow="Prosessimme"
        title="Selkeä prosessi. Ei yllätyksiä."
        description="Joka projekti etenee saman, hyväksi havaitun prosessin mukaan. Tiedät aina missä mennään, mitä maksaa ja milloin valmistuu."
        cta={{ label: "Aloita projekti", href: "/yhteystiedot" }}
        secondaryCta={{ label: "Katso hinnoittelu", href: "/hinnoittelu" }}
      />

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {PHASES.map((phase) => (
              <div key={phase.phase}>
                <div className="mb-8">
                  <span className="text-xs font-semibold uppercase tracking-widest text-copper">{phase.phase}</span>
                  <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mt-1">{phase.title}</h2>
                </div>
                <ProcessSteps steps={phase.steps} variant="vertical" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">Periaatteemme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="p-6 rounded-xl bg-elevated border border-wire">
                <h3 className="font-heading font-semibold text-ink mb-2">{p.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
