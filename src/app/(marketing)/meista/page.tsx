import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Meistä — Apex Site, suomalainen ohjelmistotalo",
  description:
    "Apex Site on suomalainen ohjelmistotalo, joka rakentaa laadukkaita digitaalisia tuotteita. Tutustumme tiimiin ja arvoihimme.",
  alternates: { canonical: "https://apexsite.fi/meista" },
};

const VALUES = [
  {
    title: "Laatu ennen nopeutta",
    description: "Emme leikkaa kulmia. Jokainen projekti tehdään niin hyvin, että olemme ylpeitä laittamaan nimemme siihen.",
  },
  {
    title: "Pitkäaikaiset kumppanuudet",
    description: "Haluamme olla kumppanisi vuosia — ei vain kertatoimittaja. Siksi jokainen projekti alkaa ymmärtämisellä.",
  },
  {
    title: "Avoimuus ja rehellisyys",
    description: "Jos projekti ei sovi meille, sanomme sen suoraan. Jos löydämme paremman tavan, kerromme siitä.",
  },
  {
    title: "Tekninen excellence",
    description: "Pysymme modernien teknologioiden kärjessä ja soveltamme parhaita käytäntöjä jokaisessa projektissa.",
  },
];

const STATS = [
  { value: "47+", label: "projektia toimitettu" },
  { value: "98%", label: "tyytyväisiä asiakkaita" },
  { value: "2.8v", label: "keskimääräinen asiakassuhde" },
  { value: "< 48h", label: "tarjous toimitusaika" },
];

export default function MeistaPage() {
  return (
    <>
      <PageHero
        eyebrow="Meistä"
        title="Ohjelmistotalo, joka välittää lopputuloksesta."
        description="Apex Site on helsinkiläinen ohjelmistotalo, joka rakentaa laadukkaita digitaalisia tuotteita pk-yrityksille ja kasvuyrityksille. Emme ole halvin vaihtoehto — olemme paras."
        cta={{ label: "Ota yhteyttä", href: "/yhteystiedot" }}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-xl bg-elevated border border-wire">
                <div className="font-display font-bold text-copper text-3xl sm:text-4xl mb-1">{stat.value}</div>
                <div className="text-ink-dim text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <Badge variant="teal" className="mb-4">Tarinaamme</Badge>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-6">
                Rakennettu kokemuksesta
              </h2>
              <div className="space-y-4 text-ink-dim leading-relaxed">
                <p>
                  Apex Site syntyi turhautumisesta. Perustajat olivat vuosia törmänneet samaan ongelmaan:
                  asiakkaat maksoivat paljon, mutta saivat vähän. Projektit viivästyivät, budjetti ylittyi,
                  koodi oli heikkoa.
                </p>
                <p>
                  Päätimme rakentaa toisenlaisen ohjelmistotalon. Sellaisen, jossa sovitut asiat pidetään.
                  Jossa asiakkaan liiketoiminta — ei teknologia — on lähtöpiste. Jossa koodi on niin hyvää,
                  että voit luovuttaa sen kenelle tahansa jatkokehitettäväksi.
                </p>
                <p>
                  Tänään Apex Sitellä on takana yli 47 projektia. 98 % asiakkaistamme on suositellut meitä
                  eteenpäin. Keskimääräinen asiakassuhteemme kestää 2.8 vuotta — koska tuloksemme puhuvat
                  puolestaan.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUES.map((v) => (
                <div key={v.title} className="p-5 rounded-xl bg-elevated border border-wire hover:border-copper/30 transition-colors">
                  <h3 className="font-heading font-semibold text-ink mb-2 text-sm">{v.title}</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-6">Sijaintimme</h2>
          <p className="text-ink-dim leading-relaxed mb-4">
            Pääkonttorimme on Helsingissä, mutta palvelemme asiakkaita koko Suomessa — ja kansainvälisesti
            tarpeen mukaan. Suurin osa asiakasyhteistyöstä tapahtuu etänä, mutta järjestämme tapaamisia
            myös kasvotusten.
          </p>
          <p className="text-ink-dim">
            <span className="text-ink font-medium">Osoite:</span> Helsinki, Suomi
          </p>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
