import type { Metadata } from "next";
import { CheckCircle2, Server, Wrench } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "Prosessi — Näin yhteistyö etenee",
  description:
    "Selkeä prosessi ideasta julkaisuun. Kartoituspuhelu, tarjous, suunnittelu, kehitys ja ylläpito — kaikki läpinäkyvästi.",
  alternates: { canonical: "https://apexsite.fi/prosessi" },
};

const STEPS = [
  {
    number: "01",
    title: "Ota yhteyttä",
    description: "Kerro meille projektistasi Live Chatissa, AI-chatbotissa, yhteydenottolomakkeella tai sähköpostitse.",
    items: [],
  },
  {
    number: "02",
    title: "Maksuton 30 minuutin kartoituspuhelu",
    description: "Sovimme maksuttoman puhelun, jossa käymme yhdessä läpi:",
    items: [
      "Yrityksesi tarpeet",
      "Projektin tavoitteet",
      "Toivotut ominaisuudet",
      "Budjetin ja aikataulun",
      "Mahdolliset lisätoiveet",
    ],
    note: "Puhelun aikana suosittelemme juuri sinulle sopivinta palvelua tai palvelupakettia.",
  },
  {
    number: "03",
    title: "Tarjous ja sopimus",
    description: "Saat selkeän tarjouksen ilman piilokuluja. Kun hyväksyt tarjouksen, aloitamme projektin.",
    items: [],
  },
  {
    number: "04",
    title: "Sisällön kerääminen",
    description: "Pyydämme tarvittavat materiaalit:",
    items: [
      "Logo",
      "Tekstit",
      "Kuvat",
      "Yrityksen tiedot",
      "Värit ja visuaalinen ilme",
      "Mahdolliset esimerkkisivustot",
      "Muut toiveet",
    ],
  },
  {
    number: "05",
    title: "Suunnittelu ja kehitys",
    description: "Suunnittelemme ja rakennamme verkkosivustosi moderniksi, nopeaksi ja mobiiliystävälliseksi.",
    items: [],
    extras: {
      label: "Tarvittaessa lisäämme myös:",
      list: [
        "SEO-optimoinnin",
        "AI-chatbotin",
        "Live Chatin",
        "Verkkokaupan",
        "Varausjärjestelmän",
        "Maksujärjestelmät",
        "Google Analyticsin",
        "Muut integraatiot",
      ],
    },
  },
  {
    number: "06",
    title: "Testaus ja hyväksyntä",
    description: "Testaamme verkkosivuston huolellisesti eri laitteilla ja selaimilla. Saat tarkistaa lopputuloksen ja pyytää tarvittavat muutokset ennen julkaisua.",
    items: [],
  },
  {
    number: "07",
    title: "Julkaisu",
    description: "Julkaisemme verkkosivustosi turvallisesti ja varmistamme, että kaikki toimii moitteettomasti.",
    items: [],
  },
];

const HOSTING_OPTIONS = [
  {
    icon: Wrench,
    label: "Vaihtoehto 1",
    title: "Oma hosting",
    description: "Jos käytät omaa hosting-palvelua, siirrämme verkkosivuston sinne.",
    subLabel: "Tämän jälkeen vastaat itse:",
    items: [
      "Hostingista",
      "Palvelimen hallinnasta",
      "Tietoturvasta",
      "Varmuuskopioista",
      "Päivityksistä",
    ],
    note: "Et maksa meille kuukausimaksua, ellet halua erillistä ylläpitosopimusta.",
    highlighted: false,
  },
  {
    icon: Server,
    label: "Vaihtoehto 2",
    title: "Meidän hosting",
    badge: "Suositeltu",
    description: "Voit jättää verkkosivuston teknisen ylläpidon kokonaan meidän vastuullemme kuukausimaksulla.",
    subLabel: "Palvelu sisältää:",
    items: [
      "Luotettavan hostingin",
      "Domainin hallinnan (tarvittaessa)",
      "SSL-sertifikaatin",
      "Tietoturvapäivitykset",
      "Automaattiset varmuuskopiot",
      "Palvelimen ylläpidon",
      "Nopeusoptimoinnin",
      "Jatkuvan valvonnan",
      "Teknisen tuen",
      "Pienet muutokset valitun ylläpitopaketin mukaisesti",
    ],
    note: "Näin sinun ei tarvitse huolehtia verkkosivuston teknisestä ylläpidosta, vaan voit keskittyä yrityksesi kasvattamiseen.",
    highlighted: true,
  },
];

const BENEFITS = [
  {
    title: "Projektin aikataulu",
    description: "Kun tarjous on hyväksytty, laadimme projektille selkeän aikataulun. Tiedät alusta asti, mitä tapahtuu ja milloin projekti valmistuu.",
  },
  {
    title: "Projektin seuranta",
    description: "Pidämme sinut ajan tasalla projektin etenemisestä koko työn ajan. Saat tarvittaessa päivityksiä ja voit seurata projektin eri vaiheita.",
  },
  {
    title: "Käyttöönotto ja opastus",
    description: "Projektin valmistuttua opastamme sinua verkkosivuston käytössä ja hallintapaneelissa, jotta voit käyttää sivustoasi helposti myös itse.",
  },
  {
    title: "Tietoturva",
    description: "Rakennamme verkkosivustot turvallisuus edellä. Käytämme suojattuja yhteyksiä (SSL) ja huolehdimme tietoturvasta sekä varmuuskopioista, jos valitset hosting- ja ylläpitopalvelumme.",
  },
  {
    title: "Takuu",
    description: "Tarjoamme valmistuneelle projektille takuun. Mahdolliset tekniset virheet korjataan veloituksetta takuuaikana.",
  },
  {
    title: "Tekninen tuki",
    description: "Tarvittaessa saat meiltä nopeasti apua teknisiin kysymyksiin ja ongelmatilanteisiin myös projektin valmistumisen jälkeen.",
  },
];

const WHY_US = [
  "Räätälöidyt ratkaisut ilman valmiita teemoja",
  "Modernit, nopeat ja mobiiliystävälliset verkkosivustot",
  "Selkeä hinnoittelu ilman piilokuluja",
  "Suora yhteys kehittäjiin koko projektin ajan",
  "Luotettava tekninen tuki ja ylläpito",
  "Turvalliset ja laadukkaat ratkaisut",
];

export default function ProsessiPage() {
  return (
    <>
      <PageHero
        eyebrow="Prosessimme"
        title="Näin yhteistyö etenee."
        description="Selkeä, läpinäkyvä prosessi alusta loppuun. Tiedät aina missä mennään, mitä maksaa ja milloin valmistuu."
        cta={{ label: "Aloita projekti", href: "/yhteystiedot" }}
        secondaryCta={{ label: "Katso hinnoittelu", href: "/hinnoittelu" }}
      />

      {/* Intro */}
      <section className="py-10 border-b border-wire">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl mb-3">
            Läpinäkyvä prosessi alusta loppuun
          </h2>
          <p className="text-ink-dim leading-relaxed">
            Haluamme tehdä yhteistyöstä mahdollisimman helppoa ja selkeää. Tiedät jokaisessa vaiheessa,
            mitä tapahtuu seuraavaksi, mitä tarvitsemme sinulta ja milloin projekti etenee seuraavaan vaiheeseen.
          </p>
        </div>
      </section>

      {/* Main steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex gap-6">
                {/* Timeline column */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-copper bg-copper/10 text-copper font-heading font-bold text-base shrink-0">
                    {step.number}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-linear-to-b from-copper/40 to-wire my-2" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-12">
                  <h2 className="font-heading font-semibold text-ink text-xl mb-2 mt-3">
                    {step.title}
                  </h2>
                  <p className="text-ink-dim leading-relaxed">{step.description}</p>
                  {step.items.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-ink-dim">
                          <CheckCircle2 size={14} className="text-copper shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.note && (
                    <p className="mt-3 text-sm text-ink-dim italic">{step.note}</p>
                  )}
                  {step.extras && (
                    <div className="mt-4 p-4 rounded-xl bg-elevated border border-wire">
                      <p className="text-sm font-medium text-ink mb-2">{step.extras.label}</p>
                      <ul className="grid grid-cols-2 gap-1.5">
                        {step.extras.list.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-ink-dim">
                            <CheckCircle2 size={13} className="text-copper shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">
            Mitä saat joka projektissa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-xl bg-elevated border border-wire hover:border-copper/30 transition-colors">
                <h3 className="font-heading font-semibold text-ink mb-2">{b.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post-launch hosting options */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper">Julkaisun jälkeen</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
              Valitse sinulle sopiva vaihtoehto
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {HOSTING_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.title}
                  className={`p-6 rounded-2xl border ${
                    opt.highlighted
                      ? "border-copper/40 bg-copper/5"
                      : "border-wire bg-elevated"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-copper/10">
                      <Icon size={18} className="text-copper" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost">{opt.label}</p>
                      <h3 className="font-heading font-semibold text-ink text-lg leading-tight">
                        {opt.title}
                        {opt.badge && (
                          <span className="ml-2 text-xs font-medium text-copper bg-copper/10 px-2 py-0.5 rounded-full">
                            {opt.badge}
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  <p className="text-ink-dim text-sm leading-relaxed mb-3">{opt.description}</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-2">{opt.subLabel}</p>
                  <ul className="space-y-1.5 mb-4">
                    {opt.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-ink-dim">
                        <CheckCircle2 size={13} className="text-copper shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-ink-dim italic border-t border-wire pt-3">{opt.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grow with us */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-copper">Jatkuva yhteistyö</span>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-4">
            Kasvamme yrityksesi mukana
          </h2>
          <p className="text-ink-dim leading-relaxed mb-8">
            Verkkosivustoa voidaan laajentaa myöhemmin esimerkiksi verkkokaupalla, AI-ratkaisuilla,
            mobiilisovelluksella tai uusilla ominaisuuksilla yrityksesi kasvaessa.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Verkkokauppa", "AI-ratkaisut", "Mobiilisovellus", "Uudet ominaisuudet", "SEO", "Ylläpito ja tuki"].map((service) => (
              <span
                key={service}
                className="px-4 py-2 rounded-full border border-wire bg-elevated text-ink-dim text-sm"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8 text-center">
            Miksi valita meidät?
          </h2>
          <ul className="space-y-3">
            {WHY_US.map((item) => (
              <li key={item} className="flex items-center gap-3 text-ink-dim">
                <CheckCircle2 size={18} className="text-copper shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}
