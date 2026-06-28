import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Meistä — Apex Site, suomalainen ohjelmistotalo",
  description:
    "Apex Site on suomalainen ohjelmistotalo, joka rakentaa laadukkaita digitaalisia tuotteita. Tutustumme tiimiin ja arvoihimme.",
  alternates: { canonical: "https://apexsite.fi/meista" },
};

const VALUES = [
  {
    title: "Laatu ennen nopeutta",
    description: "Emme leikkaa kulmia. Jokainen projekti tehdään niin hyvin, että voimme ylpeänä laittaa nimemme siihen.",
  },
  {
    title: "Pitkäaikaiset suhteet",
    description: "Haluamme olla kumppanisi vuosia — ei vain kertatoimittaja. Siksi jokainen projekti alkaa kuuntelemisella.",
  },
  {
    title: "Rehellinen viestintä",
    description: "Jos projekti ei sovi meille, sanomme sen suoraan. Jos löydämme paremman tavan, kerromme siitä heti.",
  },
  {
    title: "Moderni tekniikka",
    description: "Käytämme parhaita nykytyökaluja — ei vanhentunutta teknologiaa — jotta sivusi kestää ja kasvaa vuosia.",
  },
];

const STATS = [
  { value: "< 48h", label: "Tarjous toimitusaika" },
  { value: "100%", label: "Lähdekoodi sinulle" },
  { value: "6 kk", label: "Takuu julkaisun jälkeen" },
  { value: "0", label: "Piilokustannuksia" },
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

      {/* Main story */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <Badge variant="teal" className="mb-4">Meistä</Badge>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-6">
                Rakennamme digitaalisia ratkaisuja, jotka auttavat yrityksiä kasvamaan.
              </h2>
              <div className="space-y-4 text-ink-dim leading-relaxed">
                <p>
                  Emme usko valmiisiin malleihin tai yhden koon ratkaisuihin. Jokainen yritys on erilainen,
                  ja siksi suunnittelemme ja kehitämme jokaisen projektin asiakkaan tavoitteiden, tarpeiden
                  ja liiketoiminnan mukaan.
                </p>
                <p>
                  Olipa kyseessä moderni verkkosivusto, tehokas verkkokauppa, älykäs AI-ratkaisu tai
                  mobiilisovellus, tavoitteenamme on luoda ratkaisu, joka näyttää ammattimaiselta, toimii
                  nopeasti ja tuottaa todellista arvoa yrityksellesi.
                </p>
                <p>
                  Panostamme laatuun, suorituskykyyn, tietoturvaan ja selkeään käyttökokemukseen.
                  Käytämme moderneja teknologioita rakentaaksemme ratkaisuja, jotka ovat luotettavia,
                  helposti laajennettavia ja valmiita tukemaan yrityksesi kasvua myös tulevaisuudessa.
                </p>
                <p>
                  Meille yhteistyö ei pääty projektin julkaisuun. Olemme tukenasi myös sen jälkeen
                  tarjoamalla ylläpitoa, teknistä tukea ja jatkuvaa kehitystä, jotta digitaalinen
                  ratkaisusi pysyy ajan tasalla ja toimii parhaalla mahdollisella tavalla.
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

      {/* Location */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-6">Sijaintimme</h2>
          <p className="text-ink-dim leading-relaxed mb-4">
            Toimimme Helsingistä käsin, mutta palvelemme asiakkaita koko Suomessa.
            Useimmat projektit hoituvat etänä sujuvasti, mutta järjestämme mielellämme
            tapaamisia myös kasvotusten — kun se tuntuu oikealta.
          </p>
          <p className="text-ink-dim">
            <span className="text-ink font-medium">Osoite:</span> Helsinki, Suomi
          </p>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">
            Sinun ideasi. Meidän osaamisemme.{" "}
            <span className="text-copper">Yhteinen menestys.</span>
          </h2>
          <p className="text-ink-dim leading-relaxed mb-8">
            Varaa maksuton 30 minuutin kartoituspuhelu ja aloitetaan yhdessä digitaalinen ratkaisu,
            joka vie yrityksesi seuraavalle tasolle.
          </p>
          <Button size="lg" asChild>
            <Link href="/yhteystiedot">Varaa maksuton kartoitus</Link>
          </Button>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
