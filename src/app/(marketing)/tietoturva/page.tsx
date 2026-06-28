import type { Metadata } from "next";
import { Shield, Lock, Database, Server, Flame, FileCheck } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Tietoturva — Turvallinen verkkosivusto",
  description:
    "Rakennamme verkkosivustot turvallisuus edellä — SSL, GDPR, varmuuskopiot, palomuuri ja turvallinen hosting joka projektissa.",
  alternates: { canonical: "https://apexsite.fi/tietoturva" },
};

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "SSL-sertifikaatti",
    description:
      "Kaikilla rakentamillamme verkkosivustoilla on SSL-sertifikaatti, joka salaa selaimen ja palvelimen välisen tiedonsiirron. HTTPS-yhteys suojaa käyttäjiesi tiedot ja parantaa hakukonenäkyvyyttä.",
  },
  {
    icon: FileCheck,
    title: "GDPR-vaatimustenmukaisuus",
    description:
      "Rakennamme sivustot EU:n tietosuoja-asetuksen (GDPR) mukaisesti. Käsittelemme henkilötiedot lainmukaisesti, minimoimme tietojen keräämisen ja toteutamme tarvittavat evästeasetukset.",
  },
  {
    icon: Database,
    title: "Automaattiset varmuuskopiot",
    description:
      "Hosting-paketteihimme sisältyy automaattiset varmuuskopiot. Sivuston tiedot ja tietokanta varmuuskopioidaan säännöllisesti, joten tietoja ei menetetä missään tilanteessa.",
  },
  {
    icon: Server,
    title: "Turvallinen hosting",
    description:
      "Käytämme luotettavia hosting-palveluita, joissa palvelimet sijaitsevat suojatuissa konesaleissa. Palvelimet pidetään ajan tasalla tietoturvapäivityksillä.",
  },
  {
    icon: Flame,
    title: "Palomuurit ja valvonta",
    description:
      "Hosting-paketteihimme sisältyy palomuurisuojaus, joka estää luvattoman pääsyn palvelimelle. Valvomme palvelinten toimintaa ja reagoimme poikkeamiin nopeasti.",
  },
  {
    icon: Shield,
    title: "Suojatut lomakkeet",
    description:
      "Kaikki yhteydenottolomakkeet on suojattu roskapostisuodatuksella ja palvelimella tapahtuvalla validoinnilla. Asiakkaiden lähettämät tiedot kulkevat aina salattua yhteyttä pitkin.",
  },
];

export default function TietoturvaPage() {
  return (
    <>
      <PageHero
        eyebrow="Tietoturva"
        title="Rakennamme verkkosivustot turvallisuus edellä."
        description="Tietoturva ei ole lisäominaisuus — se on perusvaatimus. Näin suojaamme asiakkaidemme verkkosivustot ja käyttäjien tiedot."
        cta={{ label: "Pyydä tarjous", href: "/yhteystiedot" }}
        backgroundVariant="service"
      />

      {/* Security features grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SECURITY_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-elevated border border-wire hover:border-copper/30 transition-colors"
                >
                  <div className="mb-4 inline-flex p-2.5 rounded-lg bg-copper/10">
                    <Icon size={20} className="text-copper" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink mb-2">{feature.title}</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary banner */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <div className="inline-flex p-3 rounded-full bg-copper/10 mb-6">
            <Shield size={28} className="text-copper" />
          </div>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">
            Tietoturva sisältyy jokaiseen projektiin
          </h2>
          <p className="text-ink-dim leading-relaxed mb-8 max-w-xl mx-auto">
            Emme veloita tietoturvasta erikseen. SSL, suojattu koodi ja tietosuojamyönteinen
            rakenne kuuluvat jokaisen projektin toimitukseen — oli kyse verkkosivustosta,
            verkkokaupasta tai sovelluksesta.
          </p>
          <Button size="lg" asChild>
            <Link href="/yhteystiedot">Aloita turvallinen projekti</Link>
          </Button>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
