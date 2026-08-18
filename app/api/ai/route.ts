import { NextResponse } from "next/server";

import { buildChamlijaAIResponse, type ChatResponse } from "@/lib/chamlija/chamlija-ai-improved";

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

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    try {
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      });

      const payload = await geminiResponse.json().catch(() => ({}));

      if (!geminiResponse.ok) {
        const status = geminiResponse.status;
        const googleError = payload?.error ?? payload ?? {};
        const googleMessage = typeof googleError?.message === "string" ? googleError.message : "Gemini request failed";
        const googleStatus = googleError?.status ?? "unknown";
        const googleCode = googleError?.code ?? "unknown";

        return NextResponse.json({
          text: `Gemini HTTP ${status}: ${googleMessage} | status: ${googleStatus} | code: ${googleCode}`,
          fallback: true,
          source: "gemini-error",
        });
      }

      const generatedText =
        payload?.candidates?.[0]?.content?.parts
          ?.map((part: any) => typeof part?.text === "string" ? part.text : "")
          .join("")
          .trim() ?? "";

      if (!generatedText) {
        const fallbackResponse = buildChamlijaAIResponse(message);
        return NextResponse.json({
          text: formatFallbackResponse(fallbackResponse),
          fallback: true,
          source: "fallback",
          debug: { reason: "gemini_empty_response" },
        });
      }

      return NextResponse.json({
        text: generatedText,
        fallback: false,
        source: "gemini",
        debug: { reason: "gemini_ok" },
      });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Gemini request failed";
      console.error("Gemini request failed", {
        status: null,
        message: messageText,
        errorStatus: null,
        code: null,
      });

      const fallbackResponse = buildChamlijaAIResponse(message);
      return NextResponse.json({
        text: formatFallbackResponse(fallbackResponse),
        fallback: true,
        source: "fallback",
        debug: { reason: "gemini_exception", message: messageText },
      });
    }
  } catch (error) {
    const fallbackMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({
      text: "I don't currently have verified information about that at Chamlija.",
      fallback: true,
      source: "fallback",
      debug: { reason: "unknown_error", message: fallbackMessage },
    });
  }
}
