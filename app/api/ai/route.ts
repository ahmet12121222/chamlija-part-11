import { NextResponse } from "next/server";

import { buildChamlijaAIResponse, type ChatResponse } from "@/lib/chamlija/chamlija-ai-improved";
import { CHAMLIJA_AI_SYSTEM_PROMPT } from "@/lib/chamlija/chamlija-ai-system-prompt";
import { VERIFIED_CHAMLIJA_FACTS } from "@/lib/chamlija/verified-facts";

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

  return sections || "I don't currently have verified information about that at Chamlija.";
};

const buildGeminiSystemPrompt = () => {
  const factSummary = `

Verified Chamlija facts to use only:
- Location: ${VERIFIED_CHAMLIJA_FACTS.location}
- Contact phone: ${VERIFIED_CHAMLIJA_FACTS.contact.phone}
- Contact email: ${VERIFIED_CHAMLIJA_FACTS.contact.email}
- Instagram: ${VERIFIED_CHAMLIJA_FACTS.contact.instagram}
- Opening hours: Monday ${VERIFIED_CHAMLIJA_FACTS.openingHours.monday}; Tuesday-Friday ${VERIFIED_CHAMLIJA_FACTS.openingHours.tuesdayToFriday}; Saturday-Sunday ${VERIFIED_CHAMLIJA_FACTS.openingHours.saturdayToSunday}
- Adult entrance: ZAR ${VERIFIED_CHAMLIJA_FACTS.pricing.adult}; Child 3+: ZAR ${VERIFIED_CHAMLIJA_FACTS.pricing.child3Plus}; Under 3: free
- Free activities: ${VERIFIED_CHAMLIJA_FACTS.freeActivities.join(", ")}
- Paid activities: ${VERIFIED_CHAMLIJA_FACTS.paidActivities.map((item) => `${item.name} ZAR ${typeof item.price === "number" ? item.price : `${item.price.adult}/${item.price.child}`}`).join(", ")}
- Picnic areas: ${VERIFIED_CHAMLIJA_FACTS.picnicAreas.map((area) => `${area.name} ZAR ${area.price}`).join(", ")}
- Rules: ${VERIFIED_CHAMLIJA_FACTS.rules.join(" ")}
- Animals: ${VERIFIED_CHAMLIJA_FACTS.animals.join(", ")}

Ground rules for every answer:
- Answer only about Buyuk Chamlija and only from the verified facts above.
- Never invent prices, offers, availability, activities, animals, capacities, contact details, or discount information.
- If something is not verified, say it is not confirmed and suggest contacting the Chamlija team.
- Respond in the same language as the user when possible.
- Keep responses brief, natural, and customer-focused.
- If the customer is close to booking or reservation, guide them naturally toward the reservation flow.
- Do not reveal technical errors, API details, or provider failures.
`;

  return `${CHAMLIJA_AI_SYSTEM_PROMPT}${factSummary}`;
};

const getGeminiContents = (message: string, incomingMessages: unknown[]) => {
  const history = Array.isArray(incomingMessages) ? incomingMessages.slice(-10) : [];

  const mappedHistory = history
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const candidate = entry as { sender?: string; text?: string; role?: string; parts?: Array<{ text?: string }> };
      const text = typeof candidate.text === "string" ? candidate.text.trim() : "";

      if (!text) {
        return null;
      }

      const role = candidate.sender === "user" ? "user" : candidate.role === "user" ? "user" : "model";
      return { role, parts: [{ text }] };
    })
    .filter(Boolean) as Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;

  const latest = { role: "user" as const, parts: [{ text: message }] };

  return mappedHistory.length > 0 ? [...mappedHistory, latest] : [latest];
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({
        text: "Please ask me something about Chamlija and I’ll help using the verified information available on the site.",
        fallback: true,
        source: "fallback",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      const fallbackResponse = buildChamlijaAIResponse(message);
      return NextResponse.json({
        text: formatFallbackResponse(fallbackResponse),
        fallback: true,
        source: "fallback",
      });
    }

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildGeminiSystemPrompt() }],
          },
          generationConfig: {
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
          contents: getGeminiContents(message, rawMessages),
        }),
      });

      clearTimeout(timeout);

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fallbackResponse = buildChamlijaAIResponse(message);
        return NextResponse.json({
          text: formatFallbackResponse(fallbackResponse),
          fallback: true,
          source: "fallback",
        });
      }

      const generatedText =
        payload?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => (typeof part?.text === "string" ? part.text : ""))
          .join("")
          .trim() ?? "";

      if (!generatedText) {
        const fallbackResponse = buildChamlijaAIResponse(message);
        return NextResponse.json({
          text: formatFallbackResponse(fallbackResponse),
          fallback: true,
          source: "fallback",
        });
      }

      return NextResponse.json({
        text: generatedText,
        fallback: false,
        source: "gemini",
      });
    } catch (error) {
      clearTimeout(timeout);
      const fallbackResponse = buildChamlijaAIResponse(message);
      return NextResponse.json({
        text: formatFallbackResponse(fallbackResponse),
        fallback: true,
        source: "fallback",
      });
    }
  } catch (error) {
    return NextResponse.json({
      text: "I don't currently have verified information about that at Chamlija.",
      fallback: true,
      source: "fallback",
    });
  }
}
