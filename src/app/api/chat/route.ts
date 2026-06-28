import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Olet Apex Siten asiakaspalveluassistentti. Apex Site on suomalainen web-toimisto joka rakentaa moderneja verkkosivuja, verkkokauppoja, mobiilisovelluksia ja AI-ratkaisuja yrityksille.

Palvelut ja hinnat:
- Verkkosivut: alkaen 3 000 €
- AI-ratkaisut (chatbotit, automaatiot): alkaen 4 000 €
- Verkkokauppa: alkaen 6 000 €
- Mobiilisovellus: alkaen 15 000 €

Pienyrityspaketit:
- Startti: 299 € aloitus + 49 €/kk (jopa 5 sivua, mobiilioptimoidut, yhteydenottolomake)
- Kasvu: 599 € aloitus + 79 €/kk (jopa 10 sivua, SEO, Google Analytics, CMS, blogi)
- Pro: 999 € aloitus + 99 €/kk (rajaton sivumäärä, verkkokauppa tai varaukset)

Ylläpitosopimukset:
- Perus: 150 €/kk
- Standardi: 350 €/kk
- Premium: 750 €/kk

Lisäpalvelut (yksittäiset):
- Livechat-asennus: 150 €
- Google Analytics: 100 €
- Evästebanneri: 150 €
- Yhteydenottolomake: 100 €
- Chatbot-asennus: 300 €
- Logo-suunnittelu: 250 €

Vastaa aina suomeksi, lyhyesti ja ystävällisesti. Jos asiakas haluaa tarjouksen tai lisätietoja, ohjaa hänet ottamaan yhteyttä osoitteessa apexsite.fi/yhteystiedot tai sähköpostilla info@apexsite.fi.`;

export async function POST(req: NextRequest) {
  let messages: { role: string; content: string }[];
  try {
    ({ messages } = await req.json());
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI-virhe" }, { status: 500 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "Pahoittelen, jokin meni pieleen.";

  return NextResponse.json({ reply });
}
