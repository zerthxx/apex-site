import { NextRequest, NextResponse } from "next/server";
import { getKnowledge } from "@/lib/chat/knowledge";
import { buildSystemPrompt } from "@/lib/chat/buildSystemPrompt";

export async function POST(req: NextRequest) {
  let messages: { role: string; content: string }[];
  try {
    ({ messages } = await req.json());
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const knowledge = await getKnowledge();
  const systemPrompt = buildSystemPrompt(knowledge);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ],
      max_tokens: 400,
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
