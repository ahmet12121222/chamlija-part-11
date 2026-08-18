import { NextResponse } from "next/server";

import { buildChamlijaAIResponse, type ChatResponse } from "@/lib/chamlija/chamlija-ai-improved";

const formatSupportResponse = (response: ChatResponse): string => {
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
  const body = await request.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const response = buildChamlijaAIResponse(message);

  return NextResponse.json({
    text: formatSupportResponse(response),
    fallback: false,
    source: "chamlija-support",
  });
}