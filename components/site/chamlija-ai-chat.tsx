"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  extractConversationContextFromMessage,
  getChamlijaKnowledgeReply,
  type ChatConversationContext,
} from "@/lib/chamlija/chamlija-knowledge";
import { CHAMLIJA_AI_SYSTEM_PROMPT } from "@/lib/chamlija/chamlija-ai-system-prompt";

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/zf7qVqF4mqL8er928?g_st=ac";
const BOOKING_ROUTE = "/book";

type ChatAction = {
  kind: "link" | "route";
  href: string;
  label: string;
};

type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  action?: ChatAction;
};

const starterSuggestions = [
  "Merhaba",
  "💰 Fiyatlar",
  "🌳 Aktiviteler",
  "👨‍👩‍👧‍👦 Aile için öneri",
  "📍 Konum",
  "📅 Rezervasyon",
];

const buildKnowledgeReply = (
  input: string,
  context: ChatConversationContext,
) => getChamlijaKnowledgeReply(input, context, CHAMLIJA_AI_SYSTEM_PROMPT);

const normalizeMatchText = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9ğüşıöç\s]/gi, " ");

const getSpecialAction = (value: string): ChatAction | undefined => {
  const normalized = normalizeMatchText(value);

  if (/(rezervasyon|reservation|book now|booking|reserve|rezervasyon yap|rezerve)/.test(normalized)) {
    return { kind: "route", href: BOOKING_ROUTE, label: "📅 Rezervasyon Yap" };
  }

  if (/(konum|location|nerede|adres|harita|maps|google maps)/.test(normalized)) {
    return { kind: "link", href: GOOGLE_MAPS_URL, label: "📍 Google Maps'te Konumu Aç" };
  }

  if (/(instagram|insta|social media)/.test(normalized)) {
    return { kind: "link", href: "https://www.instagram.com/buyukchamlija/", label: "📸 Instagram" };
  }

  return undefined;
};

export function ChamlijaAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<ChatConversationContext>({
    previousMessages: [],
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Merhaba 👋\nBen Chamlija AI destek asistanıyım. Chamlija hakkında merak ettiğiniz konularda size yardımcı olabilirim.",
    },
    {
      id: "welcome-2",
      sender: "ai",
      text: "Size nasıl yardımcı olabilirim?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const sendMessage = (value?: string) => {
    const trimmed = (value ?? input).trim();

    if (!trimmed) {
      return;
    }

    const specialAction = getSpecialAction(trimmed);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      action: specialAction,
    };

    const nextContext = extractConversationContextFromMessage(trimmed, conversationContext);
    setConversationContext(nextContext);
    setMessages((current) => [...current, userMessage]);
    setInput("");

    if (specialAction?.kind === "route") {
      setIsTyping(false);
      window.setTimeout(() => {
        window.location.assign(specialAction.href);
      }, 150);
      return;
    }

    setIsTyping(true);

    window.setTimeout(() => {
      const replyText = buildKnowledgeReply(trimmed, nextContext);
      const reply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: "ai",
        text: replyText,
        action: specialAction?.kind === "link" ? specialAction : undefined,
      };

      setMessages((current) => [...current, reply]);
      setIsTyping(false);
    }, 800);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <>
      <style>{`
        @keyframes aiSupportFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.06);
          }
        }
      `}</style>

      <button
        type="button"
        aria-label="Chamlija AI Chat"
        onClick={() => setIsOpen((current) => !current)}
        style={{ animation: "aiSupportFloat 2.4s ease-in-out infinite" }}
        className="fixed bottom-5 right-5 z-50 flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[#bfe0de]/80 bg-gradient-to-br from-[#dff6ef] via-[#e0effb] to-[#edf7d4] text-[2rem] shadow-[0_16px_32px_rgba(67,115,100,0.2)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_18px_36px_rgba(67,115,100,0.24)] active:scale-95 sm:bottom-6 sm:right-6"
      >
        <span className="drop-shadow-sm">🌿</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-5 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-[410px] overflow-hidden rounded-[28px] border border-[#d7e8df]/80 bg-white/75 shadow-[0_24px_60px_rgba(24,42,31,0.14)] backdrop-blur-xl sm:right-6">
          <div className="flex max-h-[min(700px,calc(100vh-40px))] min-h-[420px] flex-col overflow-hidden sm:h-[560px]">
            <div className="relative border-b border-[#e4efe7] bg-gradient-to-r from-[#f6fbff] via-[#f9f7f1] to-[#f7f9ee] px-4 py-3 sm:px-5">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-4 h-28 w-28 rounded-full bg-[#dfeefc]/70 blur-3xl" />
                <div className="absolute right-0 top-4 h-24 w-24 rounded-full bg-[#f9ebb0]/30 blur-2xl" />
              </div>

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#dff6ef] to-[#d9ebf9] text-lg shadow-sm">
                    🌿
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#14251d]">Chamlija AI</p>
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#5fbf7e] shadow-[0_0_0_3px_rgba(95,191,126,0.18)]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b7d6a]">ÇEVRİMİÇİ</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d9e2d7] bg-white/70 text-lg text-[#55665a] transition-colors hover:bg-[#f3f7f4]"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_left,rgba(220,240,250,0.9),rgba(255,255,255,0.74)_28%,rgba(248,245,237,0.76)_100%)] px-3 pb-3 pt-4 sm:px-4">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex min-w-0 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="min-w-0 max-w-[85%] sm:max-w-[80%]">
                      {message.sender === "ai" && (
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#677a68]">
                          <span>🌿</span>
                          <span>Chamlija AI</span>
                        </div>
                      )}

                      <div
                        className={`break-words rounded-2xl border px-3.5 py-2.5 text-sm leading-6 shadow-[0_8px_20px_rgba(20,37,29,0.06)] ${
                          message.sender === "user"
                            ? "border-[#dfeef6] bg-gradient-to-br from-[#dff3ff] to-[#edf8ea] text-[#1b2d25]"
                            : "border-[#eef0eb] bg-white/80 text-[#1e2a21]"
                        }`}
                        style={{
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                          minWidth: 0,
                        }}
                      >
                        {message.text}
                      </div>

                      {message.action && (
                        <div className="mt-2 flex justify-start">
                          {message.action.kind === "link" ? (
                            <a
                              href={message.action.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-full border border-[#d8ead9] bg-gradient-to-r from-[#edf8f2] to-[#eaf4ff] px-3 py-2 text-xs font-medium text-[#1d2a24] shadow-sm transition hover:-translate-y-0.5"
                            >
                              {message.action.label}
                            </a>
                          ) : (
                            <Link
                              href={message.action.href}
                              className="inline-flex items-center justify-center rounded-full border border-[#d8ead9] bg-gradient-to-r from-[#edf8f2] to-[#eaf4ff] px-3 py-2 text-xs font-medium text-[#1d2a24] shadow-sm transition hover:-translate-y-0.5"
                            >
                              {message.action.label}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex min-w-0 justify-start">
                    <div className="max-w-[85%] sm:max-w-[80%]">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#677a68]">
                        <span>🌿</span>
                        <span>Chamlija AI</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-[#eef0eb] bg-white/80 px-3.5 py-2.5 shadow-[0_8px_20px_rgba(20,37,29,0.06)]">
                        <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-[#9bb5a3] [animation-delay:0ms]" />
                        <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-[#9bb5a3] [animation-delay:150ms]" />
                        <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-[#9bb5a3] [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="mt-3 shrink-0 rounded-2xl border border-[#e2ebdf] bg-white/80 p-2 shadow-[0_10px_24px_rgba(18,33,28,0.05)]">
                <div className="mb-2 flex flex-wrap gap-2">
                  {starterSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion.replace(/^[^\w\sçğıöşüÇĞİÖŞÜ]+/u, ""))}
                      className="rounded-full border border-[#d7e7d8] bg-gradient-to-r from-white to-[#f5faf4] px-2.5 py-1.5 text-[11px] font-medium text-[#2b3f36] transition-transform hover:-translate-y-0.5 hover:border-[#bfd6c4]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    type="text"
                    placeholder="Chamlija hakkında bir şey sorun..."
                    className="h-12 flex-1 rounded-full border border-[#dfe7e2] bg-[#f7faf7] px-4 text-sm text-[#1d2a24] outline-none transition focus:border-[#bfd1c8] focus:bg-white"
                    aria-label="Mesaj yaz"
                  />

                  <button
                    type="submit"
                    aria-label="Gönder"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#dff4eb] via-[#dfeefb] to-[#f4f2cf] text-lg shadow-[0_12px_26px_rgba(95,136,106,0.18)] transition-transform hover:-translate-y-0.5 hover:scale-[1.02]"
                  >
                    ➤
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
