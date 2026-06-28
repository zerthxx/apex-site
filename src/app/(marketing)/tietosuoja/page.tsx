import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = {
  title: "Tietosuojaseloste — Apex Site",
  description: "Apex Siten tietosuojaseloste. Miten keräämme, käytämme ja suojaamme henkilötietojasi.",
  alternates: { canonical: "https://apexsite.fi/tietosuoja" },
};

export default function TietosuojaPage() {
  return (
    <>
      <PageHero
        eyebrow="Tietosuoja"
        title="Tietosuojaseloste"
        description="Päivitetty 25.6.2026. Tämä seloste kertoo miten keräämme ja käytämme henkilötietojasi."
        backgroundVariant="minimal"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="prose prose-invert prose-sm max-w-none space-y-10">

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">1. Rekisterinpitäjä</h2>
              <p className="text-ink-dim leading-relaxed">
                Apex Site<br />
                Osoite: Helsinki, Suomi<br />
                Sähköposti: info@apexsite.fi
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">2. Henkilötietojen käsittelyn tarkoitus</h2>
              <p className="text-ink-dim leading-relaxed mb-3">Käsittelemme henkilötietojasi seuraaviin tarkoituksiin:</p>
              <ul className="list-disc list-inside text-ink-dim space-y-1.5 text-sm leading-relaxed">
                <li>Yhteydenottopyyntöihin vastaaminen ja tarjousten toimittaminen</li>
                <li>Sopimusten tekeminen ja täyttäminen</li>
                <li>Asiakassuhteiden hoitaminen</li>
                <li>Palveluidemme kehittäminen analytiikan avulla</li>
                <li>Lakisääteisten velvollisuuksien täyttäminen</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">3. Käsiteltävät henkilötiedot</h2>
              <p className="text-ink-dim leading-relaxed mb-3">Voimme käsitellä seuraavia tietoja:</p>
              <ul className="list-disc list-inside text-ink-dim space-y-1.5 text-sm leading-relaxed">
                <li>Nimi ja yhteystiedot (sähköposti, puhelin)</li>
                <li>Yritys- ja organisaatiotiedot</li>
                <li>Viestintähistoria kanssamme</li>
                <li>Verkkosivuston käyttötiedot (analytiikka, evästeet)</li>
                <li>Sopimusasiakirjojen tiedot</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">4. Oikeusperuste</h2>
              <p className="text-ink-dim leading-relaxed">
                Käsittelemme henkilötietoja seuraavien oikeusperusteiden nojalla: sopimuksen täyttäminen,
                oikeutettu etu (asiakassuhteen hoitaminen), lakisääteinen velvollisuus sekä suostumus
                (uutiskirje ja analytiikka).
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">5. Tietojen säilytysaika</h2>
              <p className="text-ink-dim leading-relaxed">
                Säilytämme henkilötietoja niin kauan kuin se on tarpeen käsittelyn tarkoituksen kannalta.
                Asiakastietoja säilytetään asiakassuhteen ajan ja sen jälkeen lakisääteisten vaatimusten
                mukaisesti (tyypillisesti 6 vuotta kirjanpitovelvollisuuden perusteella).
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">6. Tietojen luovuttaminen</h2>
              <p className="text-ink-dim leading-relaxed">
                Emme myy tai luovuta henkilötietojasi kolmansille osapuolille. Voimme jakaa tietoja
                alihankkijoidemme kanssa palvelun toimittamiseksi (esim. sähköpostipalveluiden tarjoajat).
                Kaikki alihankkijat käsittelevät tietoja tietosuojasopimuksen nojalla.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">7. Rekisteröidyn oikeudet</h2>
              <p className="text-ink-dim leading-relaxed mb-3">Sinulla on oikeus:</p>
              <ul className="list-disc list-inside text-ink-dim space-y-1.5 text-sm leading-relaxed">
                <li>Saada tieto henkilötietojesi käsittelystä (tarkastusoikeus)</li>
                <li>Vaatia virheellisten tietojen oikaisua</li>
                <li>Pyytää tietojesi poistamista ("oikeus tulla unohdetuksi")</li>
                <li>Vastustaa tietojesi käsittelyä tietyissä tilanteissa</li>
                <li>Pyytää tietojesi siirtämistä toiselle rekisterinpitäjälle</li>
                <li>Peruuttaa suostumuksesi milloin tahansa</li>
              </ul>
              <p className="text-ink-dim leading-relaxed mt-3">
                Voit käyttää oikeuksiasi ottamalla yhteyttä: info@apexsite.fi
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">8. Evästeet</h2>
              <p className="text-ink-dim leading-relaxed">
                Käytämme välttämättömiä evästeitä sivuston toiminnan varmistamiseksi sekä analytiikkaevästeitä
                (Google Analytics 4) palvelun kehittämiseksi. Analytiikkaevästeiden käyttö perustuu
                suostumukseesi.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">9. Tietoturva</h2>
              <p className="text-ink-dim leading-relaxed">
                Suojaamme henkilötietosi asianmukaisilla teknisillä ja organisatorisilla toimenpiteillä.
                Kaikki tiedonsiirto tapahtuu salatulla HTTPS-yhteydellä.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">10. Valitusoikeus</h2>
              <p className="text-ink-dim leading-relaxed">
                Sinulla on oikeus tehdä valitus tietosuojaviranomaiselle (Tietosuojavaltuutetun toimisto,
                tietosuoja.fi) jos katsot, että henkilötietojesi käsittely rikkoo tietosuojalainsäädäntöä.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">11. Selosteen muuttaminen</h2>
              <p className="text-ink-dim leading-relaxed">
                Pidätämme oikeuden päivittää tätä tietosuojaselostetta. Muutoksista ilmoitetaan tällä sivulla.
                Päivämäärä ylhäällä kertoo viimeisimmän päivityksen ajankohdan.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
