import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { buildChamlijaAIResponse, type ChatResponse } from "@/lib/chamlija/chamlija-ai-improved";
import { VERIFIED_CHAMLIJA_FACTS } from "@/lib/chamlija/verified-facts";

const buildVerifiedContext = () => {
  const facts = {
    location: VERIFIED_CHAMLIJA_FACTS.location,
    contact: VERIFIED_CHAMLIJA_FACTS.contact,
    openingHours: VERIFIED_CHAMLIJA_FACTS.openingHours,
    pricing: VERIFIED_CHAMLIJA_FACTS.pricing,
    freeActivities: VERIFIED_CHAMLIJA_FACTS.freeActivities,
    paidActivities: VERIFIED_CHAMLIJA_FACTS.paidActivities,
    picnicAreas: VERIFIED_CHAMLIJA_FACTS.picnicAreas,
    rules: VERIFIED_CHAMLIJA_FACTS.rules,
    animals: VERIFIED_CHAMLIJA_FACTS.animals,
  };

  return `
You are Chamlija AI, a customer support and sales assistant for this venue.

STRICT RULES:
- Use only the verified Chamlija facts below.
- Never invent activities, products, facilities, prices, opening hours, capacity, policies, discounts, availability, or services.
- If a fact is not explicitly present in the verified data, say: "I don't currently have verified information about that at Chamlija."
- Do not claim things that are not present in the verified site data.
- Recommend only from verified activities and services.
- If the user asks about a non-existent offering, politely explain it is not currently part of Chamlija's verified list and suggest genuine options from the verified activities.
- When the user asks for pricing, use the verified pricing data only.
- Use natural, helpful, conversational English or Turkish as the user speaks.
- Keep the reply practical, friendly, and sales-oriented when appropriate.
- Prefer explicit consultation with real items from the verified lists when making recommendations.

VERIFIED CHAMLIJA FACTS:
${JSON.stringify(facts, null, 2)}

IMPORTANT EXAMPLES:
- If the user asks about horse riding or another activity not listed, respond with a clear, polite statement that it is not currently one of the verified activities offered at Chamlija and suggest verified alternatives.
- If the user asks about family-friendly options, recommend only verified activities or areas from the lists above.
- If the user asks about opening hours, use the verified schedule from the facts above.
- If the user asks about booking or reservations, mention that reservations are handled through the site's booking flow and do not invent extra policies.
- If there is no verified answer, do not guess.
`;
};

const formatFallbackResponse = (response: ChatResponse): string => {
  const sections = response.sections
    .map((section) => {
      const title = section.emoji && section.title ? `${section.emoji} ${section.title}` : section.title || "";

      const content = Array.isArray(section.content)
        ? section.content
            .map((item) => (typeof item === "string" ? item : `${item.label}: ${item.value}`))
            .join("\n")
        : String(section.content ?? "");

      return [title, content].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

  if (sections) {
    return sections;
  }

  return "I don't currently have verified information about that at Chamlija.";
};

const getGeminiText = (payload: any): string => {
  const candidateTexts = (payload?.candidates ?? [])
    .map((candidate: any) => candidate?.content?.parts ?? [])
    .flat()
    .map((part: any) => (typeof part?.text === "string" ? part.text.trim() : ""))
    .filter(Boolean);

  if (candidateTexts.length === 0) {
    const directText = typeof payload?.text === "string" ? payload.text.trim() : "";
    return directText;
  }

  const joined = candidateTexts.join("\n");
  const lines = joined
    .split(/\n+/)
    .map((line: string) => line.trim())
    .filter(Boolean);

  return [...new Set(lines)].join("\n");
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({
        text: "Please ask me something about Chamlija and I’ll help using the verified information available on the site.",
        fallback: true,
        source: "fallback",
        debug: { reason: "empty_message" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      const fallbackResponse = buildChamlijaAIResponse(message);
      return NextResponse.json({
        text: formatFallbackResponse(fallbackResponse),
        fallback: true,
        source: "fallback",
        debug: { reason: "missing_api_key" },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `Customer question: ${message}` }],
          },
        ],
        config: {
          systemInstruction: buildVerifiedContext(),
        },
      });

      const generatedText = getGeminiText(response as any);

      if (generatedText) {
        return NextResponse.json({
          text: generatedText,
          fallback: false,
          source: "gemini",
          debug: { reason: "gemini_ok" },
        });
      }

      const fallback = buildChamlijaAIResponse(message);
      return NextResponse.json({
        text: formatFallbackResponse(fallback),
        fallback: true,
        source: "fallback",
        debug: { reason: "gemini_empty_response" },
      });
    } catch (geminiError: any) {
      const status = geminiError?.status ?? geminiError?.response?.status ?? null;
      const code = geminiError?.code ?? geminiError?.error?.code ?? null;
      const errorMessage = geminiError?.message ?? geminiError?.error?.message ?? "Gemini request failed";

      console.error("Gemini request failed", {
        status,
        code,
        message: errorMessage,
      });

      const fallback = buildChamlijaAIResponse(message);
      return NextResponse.json({
        text: formatFallbackResponse(fallback),
        fallback: true,
        source: "fallback",
        debug: {
          reason: "gemini_error",
          status,
          code,
          message: errorMessage,
        },
      });
    }
  } catch (error) {
    const fallbackMessage = typeof (error as Error)?.message === "string" ? (error as Error).message : "";
    const fallbackResponse = buildChamlijaAIResponse((fallbackMessage || "I need help with Chamlija").replace(/^Gemini.*?:\s*/i, ""));

    return NextResponse.json({
      text: formatFallbackResponse(fallbackResponse),
      fallback: true,
      source: "fallback",
      debug: { reason: "unknown_error", message: fallbackMessage },
    });
  }
}
