import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = {
  title: "Käyttöehdot — Apex Site",
  description: "Apex Siten palveluiden käyttöehdot ja sopimusehdot.",
  alternates: { canonical: "https://apexsite.fi/kayttoehdot" },
};

export default function KayttoehdotPage() {
  return (
    <>
      <PageHero
        eyebrow="Käyttöehdot"
        title="Käyttöehdot"
        description="Päivitetty 25.6.2026. Nämä ehdot koskevat Apex Siten palveluiden käyttöä."
        backgroundVariant="minimal"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="space-y-10">

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">1. Osapuolet ja soveltamisala</h2>
              <p className="text-ink-dim leading-relaxed text-sm">
                Näitä käyttöehtoja sovelletaan Apex Siten (jäljempänä "Toimittaja") ja asiakkaan
                (jäljempänä "Asiakas") väliseen sopimussuhteeseen, joka koskee verkkosivusto-, sovellus-
                ja ohjelmistokehityspalveluita. Palveluita käyttämällä Asiakas hyväksyy nämä ehdot.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">2. Palvelut ja toimitus</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>2.1 Toimittaja sitoutuu toimittamaan sovitut palvelut tarjouksessa määritellyssä laajuudessa ja aikataulussa.</p>
                <p>2.2 Projektin laajuuden muutoksista sovitaan kirjallisesti. Laajuuden kasvu voi vaikuttaa aikatauluun ja hintaan.</p>
                <p>2.3 Toimittajalla on oikeus käyttää alihankkijoita projektin toteutuksessa.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">3. Hinnoittelu ja maksaminen</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>3.1 Palveluiden hinnat on määritelty tarjouksessa tai erillisessä hinnastossa.</p>
                <p>3.2 Laskujen maksuehto on 14 päivää netto ellei toisin sovita.</p>
                <p>3.3 Myöhästyneistä maksuista peritään viivästyskorko korkolain mukaisesti.</p>
                <p>3.4 Toimittajalla on oikeus keskeyttää palvelun toimittaminen, jos laskuja on merkittävästi maksamatta.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">4. Tekijänoikeudet ja omistajuus</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>4.1 Asiakkaalle siirretään täydet tekijänoikeudet projektin tuloksiin (lähdekoodi, design, dokumentaatio) loppumaksun suorittamisen jälkeen.</p>
                <p>4.2 Toimittajalla on oikeus käyttää projektia referenssinä ja portfoliossa ellei toisin sovita.</p>
                <p>4.3 Kolmansien osapuolten lisenssit (kirjastot, fontit, kuvat) pysyvät alkuperäisen lisenssin alaisina.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">5. Asiakkaan velvollisuudet</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>5.1 Asiakas toimittaa tarvittavat materiaalit (tekstit, kuvat, logot) sovitun aikataulun mukaisesti.</p>
                <p>5.2 Asiakas antaa tarvittavat hyväksynnät kohtuullisessa ajassa. Viiveet voivat vaikuttaa projektin aikatauluun.</p>
                <p>5.3 Asiakas vastaa toimittamiensa materiaalien tekijänoikeuksista ja laillisuudesta.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">6. Takuu ja ylläpito</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>6.1 Toimittaja antaa 6 kuukauden takuun julkaisun jälkeen. Takuu kattaa sovituista vaatimuksista poikkeavat virheet.</p>
                <p>6.2 Takuu ei kata muutoksia alkuperäiseen laajuuteen, kolmansien osapuolten muutoksia tai virheellistä käyttöä.</p>
                <p>6.3 Julkaisun jälkeisistä muutostöistä laskutetaan erikseen sovitun tuntihinnan mukaan.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">7. Salassapito</h2>
              <p className="text-ink-dim leading-relaxed text-sm">
                Molemmat osapuolet sitoutuvat pitämään salassa toisen osapuolen luottamukselliset
                liikesalaisuudet ja tiedot. Salassapitovelvollisuus jatkuu myös sopimussuhteen päättymisen
                jälkeen 2 vuoden ajan.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">8. Vastuunrajoitus</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>8.1 Toimittajan kokonaisvastuu on rajoitettu kyseisestä projektista maksettuun summaan.</p>
                <p>8.2 Toimittaja ei vastaa välillisistä vahingoista kuten saamatta jääneestä tulosta tai liiketoiminnan keskeytymisestä.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">9. Sopimuksen irtisanominen</h2>
              <div className="space-y-3 text-ink-dim text-sm leading-relaxed">
                <p>9.1 Kummallakin osapuolella on oikeus irtisanoa sopimus 30 päivän kirjallisella ilmoituksella.</p>
                <p>9.2 Irtisanomistilanteessa Asiakas maksaa tähän mennessä tehdyn työn osuuden kokonaissummasta.</p>
                <p>9.3 Toimittajalla on oikeus purkaa sopimus välittömästi jos Asiakas rikkoo olennaisesti sopimusehtoja.</p>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">10. Sovellettava laki ja riitojenratkaisu</h2>
              <p className="text-ink-dim leading-relaxed text-sm">
                Sopimukseen sovelletaan Suomen lakia. Osapuolet pyrkivät ratkaisemaan riidat ensisijaisesti
                neuvottelemalla. Jos sopimukseen ei päästä, riidat ratkaistaan Helsingin käräjäoikeudessa.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
