"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/site/language-provider";
import { CHAMLIJA_MAPS_URL } from "@/lib/location";
import { buildChamlijaAIResponse, detectIntent, type ChatResponse } from "@/lib/chamlija/chamlija-ai-improved";
import { generatePersonalizedPlan, getPlannerActivityOptions, getPlanOpeningHoursSummary, type PlanPreference, type PlannerPlanState } from "@/lib/chamlija/chamlija-plan-my-day-advanced";

const BOOKING_ROUTE = "/book";

type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text?: string;
  response?: ChatResponse;
  action?: { kind: "link" | "route"; href: string; label: string };
};

type PlannerStep = "group" | "people" | "preferences" | "activities" | "arrival" | "summary";

type PlannerState = PlannerPlanState & { step: PlannerStep };

const defaultPlannerState = (): PlannerState => ({
  step: "group",
  groupType: "family",
  adults: 2,
  children: 0,
  childrenAgeRanges: [],
  preferences: ["nature"],
  chosenActivities: [],
  arrivalTime: "09:30",
});

const plannerStepOrder: PlannerStep[] = ["group", "people", "preferences", "activities", "arrival", "summary"];

export function ChamlijaAIChat() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const starterSuggestions = t("ai.quickActions", ["👋 Hello", "💰 Prices", "🌿 Activities", "👨‍👩‍👧 Family", "📍 Location", "📅 Reservation", "✨ Plan My Day"]);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [plannerState, setPlannerState] = useState<PlannerState>(defaultPlannerState());
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [plannerResult, setPlannerResult] = useState<ReturnType<typeof generatePersonalizedPlan> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: t("ai.welcome", "👋 Welcome to Chamlija AI!\nI'm here to help you plan an amazing visit."),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const sendMessage = async (value?: string) => {
    const trimmed = (value ?? input).trim();

    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const intent = detectIntent(trimmed);
    const shouldOpenPlanner = intent === "plan-day" || /plan my day|my day|itinerary|day plan|schedule/i.test(trimmed);

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsTyping(true);

    if (plannerOpen && plannerResult && !shouldOpenPlanner) {
      const followUpHandled = handlePlannerFollowUp(trimmed);
      if (followUpHandled) {
        setMessages((current) => [...current, {
          id: `ai-${Date.now() + 1}`,
          sender: "ai",
          text: language === "tr" ? "Planımı güncelledim. İsterseniz tercihleri de değiştirebiliriz." : "I’ve updated the plan. I can keep refining it for you.",
        }]);
        setIsTyping(false);
        return;
      }
    }

    if (shouldOpenPlanner) {
      setPlannerOpen(true);
      const plannerMessage: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: "ai",
        text: language === "tr" ? "Harika! Gününüzü adım adım planlayalım. Önce kiminle geldiğinizi seçelim." : "Perfect! Let’s build your day step by step. First, tell me who you’re visiting with.",
      };
      setMessages((current) => [...current, plannerMessage]);
      setIsTyping(false);
      return;
    }

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json().catch(() => ({}));
      const text = typeof data?.text === "string" ? data.text : "";

      if (text) {
        const reply: ChatMessage = {
          id: `ai-${Date.now() + 1}`,
          sender: "ai",
          text,
        };

        const fallback = Boolean(data?.fallback);
        const routeAction = !fallback && /reservation|book|reserve|rezervasyon|book a visit|plan my day|plan my visit/i.test(trimmed);

        if (routeAction) {
          reply.action = {
            kind: "route",
            href: BOOKING_ROUTE,
            label: language === "tr" ? "Rezervasyon Yap" : "Reserve Now",
          };
        }

        setMessages((current) => [...current, reply]);
        setIsTyping(false);
        return;
      }
    } catch (error) {
      console.error("AI request failed", error);
    }

    const response = buildChamlijaAIResponse(trimmed);
    const reply: ChatMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: "ai",
      response,
    };

    if (response.planner?.mode === "plan-my-day") {
      setPlannerOpen(true);
    }

    if (response.cta) {
      if (response.cta.action === "reservation") {
        reply.action = {
          kind: "route",
          href: response.cta.href ?? BOOKING_ROUTE,
          label: response.cta.label,
        };
      } else if (response.cta.action === "location") {
        reply.action = { kind: "link", href: response.cta.href ?? CHAMLIJA_MAPS_URL, label: response.cta.label };
      } else if (response.cta.action === "instagram") {
        reply.action = { kind: "link", href: response.cta.href ?? "https://www.instagram.com/buyukchamlija/", label: response.cta.label };
      }
    }

    setMessages((current) => [...current, reply]);
    setIsTyping(false);
  };

  const currentPlannerStepIndex = plannerStepOrder.indexOf(plannerState.step);
  const currentPlannerStep = plannerStepOrder[currentPlannerStepIndex] ?? "group";

  const updatePlannerStep = (nextStep: PlannerStep) => {
    setPlannerState((current) => ({ ...current, step: nextStep }));
  };

  const buildPlanFromCurrentState = () => generatePersonalizedPlan({
    groupType: plannerState.groupType,
    adults: plannerState.adults,
    children: plannerState.children,
    childrenAgeRanges: plannerState.childrenAgeRanges,
    preferences: plannerState.preferences,
    chosenActivities: plannerState.chosenActivities,
    arrivalTime: plannerState.arrivalTime,
  });

  const startPlanWizard = () => {
    setPlannerOpen(true);
    setPlannerState(defaultPlannerState());
    setPlannerResult(null);
  };

  const finalizePlanner = () => {
    const plan = buildPlanFromCurrentState();

    setPlannerResult(plan);
    setPlannerState((current) => ({ ...current, step: "summary" }));

    const aiResponse: ChatMessage = {
      id: `planner-${Date.now()}`,
      sender: "ai",
      response: {
        type: "itinerary",
        sections: [
          { emoji: "✨", title: "Your personalized day plan", content: [plan.summary, plan.reason] },
          { emoji: "💰", title: "Estimated spend", content: [`ZAR ${plan.cost}`] },
        ],
        timeline: plan.slots.map((slot) => ({
          time: slot.time,
          title: slot.title,
          description: slot.description,
          price: slot.price,
          note: slot.note,
          badge: slot.badge,
        })),
        cta: { label: "📅 Reserve Your Visit", action: "reservation" },
      },
    };

    setMessages((current) => [...current, aiResponse]);
  };

  const handlePlannerFollowUp = (value: string) => {
    if (!plannerResult) {
      return false;
    }

    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    let nextPreferences = [...plannerState.preferences] as PlanPreference[];
    let nextChosenActivities = [...plannerState.chosenActivities];

    const toPreferenceList = (values: string[]) => values as PlanPreference[];

    if (lower.includes("relax") || lower.includes("more relaxing")) {
      nextPreferences = toPreferenceList([...new Set([...nextPreferences, "nature", "picnic"])]) as PlanPreference[];
      nextChosenActivities = nextChosenActivities.filter((activity) => activity !== "cycling" && activity !== "basketball");
      setPlannerState((current) => ({ ...current, preferences: nextPreferences, chosenActivities: nextChosenActivities, step: "preferences" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("remove cycling") || lower.includes("no cycling")) {
      nextPreferences = nextPreferences.filter((item) => item !== "cycling");
      nextChosenActivities = nextChosenActivities.filter((item) => item !== "cycling");
      setPlannerState((current) => ({ ...current, preferences: nextPreferences, chosenActivities: nextChosenActivities, step: "preferences" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("add basketball") || lower.includes("basketball")) {
      nextPreferences = toPreferenceList([...new Set([...nextPreferences, "sports"])]) as PlanPreference[];
      nextChosenActivities = [...new Set([...nextChosenActivities, "basketball"])];
      setPlannerState((current) => ({ ...current, preferences: nextPreferences, chosenActivities: nextChosenActivities, step: "activities" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("make it cheaper") || lower.includes("cheaper")) {
      nextPreferences = toPreferenceList([...new Set([...nextPreferences, "nature", "family"])]) as PlanPreference[];
      nextChosenActivities = nextChosenActivities.filter((activity) => activity !== "animal-feeding" && activity !== "ox-wagon-tour");
      setPlannerState((current) => ({ ...current, preferences: nextPreferences, chosenActivities: nextChosenActivities, step: "preferences" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("arriving at") || lower.includes("we are arriving") || lower.includes("at 12") || lower.includes("12:00")) {
      const match = trimmed.match(/(\d{1,2}:\d{2}|\d{1,2})/);
      const time = match ? match[0].includes(":") ? match[0] : `${match[0]}:00` : "12:00";
      setPlannerState((current) => ({ ...current, arrivalTime: time, step: "arrival" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("more animal") || lower.includes("animal activities")) {
      nextPreferences = toPreferenceList([...new Set([...nextPreferences, "animals"])]) as PlanPreference[];
      setPlannerState((current) => ({ ...current, preferences: nextPreferences, step: "preferences" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("romantic")) {
      setPlannerState((current) => ({ ...current, groupType: "couple", preferences: toPreferenceList([...new Set([...current.preferences, "romantic", "nature"])]) as PlanPreference[], step: "preferences" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("wagon") || lower.includes("ox wagon")) {
      nextChosenActivities = [...new Set([...nextChosenActivities, "ox-wagon-tour"])];
      setPlannerState((current) => ({ ...current, chosenActivities: nextChosenActivities, step: "activities" }));
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    if (lower.includes("create another plan") || lower.includes("another plan")) {
      setPlannerResult(buildPlanFromCurrentState());
      return true;
    }

    return false;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  // Sayfa load'da konuşmayı sıfırla
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome-1",
      sender: "ai",
      text: t("ai.welcome", "👋 Welcome to Chamlija AI!\nI'm here to help you plan an amazing visit."),
    };
    setMessages([welcomeMessage]);
    setPlannerState(defaultPlannerState());
    setPlannerResult(null);
    setPlannerOpen(false);
    setInput("");
  }, [t]);

  return (
    <>
      <style>{`
        @keyframes aiSupportFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.06); }
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

      {/* Chat Backdrop - ekranın boş yerine tıklanırsa chat kapanması için */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-3 z-50 w-[min(100vw-1rem,410px)] overflow-hidden rounded-[28px] border border-[#d7e8df]/80 bg-white/75 shadow-[0_24px_60px_rgba(24,42,31,0.14)] backdrop-blur-xl sm:right-6">
          <div className="flex max-h-[min(700px,calc(100vh-40px))] min-h-[420px] flex-col overflow-hidden sm:h-[560px]">
            {/* Header */}
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
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b7d6a]">Online</p>
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

            {/* Messages Area */}
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

                      <div className={`break-words rounded-2xl border px-3.5 py-2.5 text-sm leading-6 shadow-[0_8px_20px_rgba(20,37,29,0.06)] ${
                        message.sender === "user"
                          ? "border-[#dfeef6] bg-gradient-to-br from-[#dff3ff] to-[#edf8ea] text-[#1b2d25]"
                          : "border-[#eef0eb] bg-white/80 text-[#1e2a21]"
                      }`} style={{ whiteSpace: "normal", overflowWrap: "break-word", wordBreak: "break-word", minWidth: 0 }}>
                        {message.text && (
                          <div className="whitespace-pre-wrap">{message.text}</div>
                        )}
                        
                        {message.response && (
                          <div className="space-y-3">
                            {message.response.type === "itinerary" && message.response.timeline && (
                              <div className="space-y-3">
                                {message.response.timeline.map((slot, idx) => (
                                  <div key={`${slot.time}-${idx}`} className="rounded-2xl border border-[#e7efe8] bg-[#f9fbf8] p-3 shadow-sm">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5a705f]">
                                        {slot.time}
                                      </span>
                                      {slot.badge && (
                                        <span className="rounded-full border border-[#dde9df] bg-white px-2 py-0.5 text-[10px] font-medium text-[#365247]">
                                          {slot.badge}
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-sm font-semibold text-[#172822]">{slot.title}</div>
                                    <div className="mt-1 text-xs leading-5 text-[#42574a]">{slot.description}</div>

                                    {slot.price && (
                                      <div className="mt-2 text-[11px] font-medium text-[#1d2a24]">{slot.price}</div>
                                    )}

                                    {slot.note && (
                                      <div className="mt-1 text-[11px] leading-4 text-[#4d665b]">{slot.note}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {message.response.sections.map((section, idx) => (
                              <div key={idx} className="space-y-1">
                                {section.emoji && section.title && (
                                  <div className="font-semibold text-[#14251d]">
                                    {section.emoji} {section.title}
                                  </div>
                                )}

                                {Array.isArray(section.content) ? (
                                  <div className="space-y-1.5 pl-3">
                                    {section.content.map((item, i) => {
                                      if (typeof item === "string") {
                                        return (
                                          <div key={i} className="text-sm leading-5">
                                            {item}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={i} className="flex justify-between gap-2 text-sm">
                                            <span className="font-medium">{item.label}</span>
                                            <span className="font-normal opacity-85">{item.value}</span>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-sm leading-5 pl-3 opacity-90">
                                    {section.content}
                                  </div>
                                )}

                                {section.subtitle && (
                                  <div className="text-xs leading-4 pl-3 opacity-75 pt-1">
                                    {section.subtitle}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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
                            <button
                              type="button"
                              onClick={() => {
                                if (!message.action) return;
                                setIsOpen(false);
                                router.push(message.action.href);
                              }}
                              className="inline-flex items-center justify-center rounded-full border border-[#d8ead9] bg-gradient-to-r from-[#edf8f2] to-[#eaf4ff] px-3 py-2 text-xs font-medium text-[#1d2a24] shadow-sm transition hover:-translate-y-0.5"
                            >
                              {message.action.label}
                            </button>
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

              {plannerOpen && (
                <div className="mt-3 flex max-h-[min(420px,calc(100dvh-480px))] flex-col rounded-2xl border border-[#dfeae0] bg-white/90 shadow-[0_10px_24px_rgba(18,33,28,0.06)]">
                  <div className="shrink-0 border-b border-[#e4efe7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#59715c]">PLAN MY DAY</div>
                        <div className="text-sm font-semibold text-[#1d2a24]">{language === "tr" ? "Adım adım gün planı" : "Step-by-step day planner"}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={startPlanWizard} className="rounded-full border border-[#d8e5d8] bg-[#f3faf4] px-2 py-1 text-[10px] font-medium text-[#2d4638]">Reset</button>
                        <button
                          type="button"
                          onClick={() => setPlannerOpen(false)}
                          aria-label="Close planner"
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8e5d8] bg-[#f3faf4] text-sm font-medium text-[#2d4638] transition-colors hover:bg-[#e8f1e9]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                    {currentPlannerStep === "group" && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {(["family", "couple", "friends", "solo"] as const).map((group) => (
                          <button
                            key={group}
                            type="button"
                            onClick={() => {
                              setPlannerState((current) => ({ ...current, groupType: group, step: "people" }));
                            }}
                            className={`rounded-2xl border p-3 text-left text-sm font-medium transition ${plannerState.groupType === group ? "border-[#80b09a] bg-[#edf9f2] text-[#1d352a]" : "border-[#e4ece6] bg-[#fafcfb] text-[#30473d]"}`}
                          >
                            <div className="text-lg">{group === "family" ? "👨‍👩‍👧" : group === "couple" ? "❤️" : group === "friends" ? "👥" : "🧍"}</div>
                            <div className="mt-1 capitalize">{group}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPlannerStep === "people" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="rounded-xl border border-[#e7ece7] bg-[#f9fbfa] p-2 text-xs text-[#42554a]">
                          <span className="mb-1 block font-medium">Adults</span>
                          <input
                            type="number"
                            min={1}
                            value={plannerState.adults}
                            onChange={(event) => setPlannerState((current) => ({ ...current, adults: Number(event.target.value) || 1 }))}
                            className="w-full rounded-lg border border-[#dfe9e3] bg-white px-2 py-1.5 text-sm text-[#1c2721] outline-none"
                          />
                        </label>
                        <label className="rounded-xl border border-[#e7ece7] bg-[#f9fbfa] p-2 text-xs text-[#42554a]">
                          <span className="mb-1 block font-medium">Children</span>
                          <input
                            type="number"
                            min={0}
                            value={plannerState.children}
                            onChange={(event) => setPlannerState((current) => ({ ...current, children: Number(event.target.value) || 0 }))}
                            className="w-full rounded-lg border border-[#dfe9e3] bg-white px-2 py-1.5 text-sm text-[#1c2721] outline-none"
                          />
                        </label>
                      </div>

                      {plannerState.children > 0 && (
                        <div className="rounded-xl border border-[#e8efe9] bg-[#f8fbf9] p-2">
                          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d675b]">Age ranges</div>
                          <div className="flex flex-wrap gap-2">
                            {['0–3', '4–7', '8–12', '13+'].map((range) => {
                              const isSelected = plannerState.childrenAgeRanges.includes(range);
                              return (
                                <button
                                  key={range}
                                  type="button"
                                  onClick={() => setPlannerState((current) => ({
                                    ...current,
                                    childrenAgeRanges: isSelected
                                      ? current.childrenAgeRanges.filter((item) => item !== range)
                                      : [...current.childrenAgeRanges, range],
                                  }))}
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${isSelected ? 'border-[#81b49e] bg-[#edf9f1] text-[#1d2d28]' : 'border-[#e4ece5] bg-white text-[#42574e]'}`}
                                >
                                  {range}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentPlannerStep === "preferences" && (
                    <div className="flex flex-col">
                      <div className="min-h-0 max-h-[min(280px,calc(100dvh-380px))] overflow-y-auto pr-2 sm:max-h-[min(320px,calc(100dvh-360px))]">
                        <div className="space-y-2">
                          {[
                            ["nature", "🌿 Nature"],
                            ["animals", "🐐 Animals"],
                            ["sports", "🏀 Sports"],
                            ["picnic", "🧺 Picnic"],
                            ["family", "👨‍👩‍👧 Family"],
                            ["adventure", "🚵 Adventure"],
                          ].map(([value, label]) => {
                            const active = plannerState.preferences.includes(value as never);
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setPlannerState((current) => ({
                                  ...current,
                                  preferences: active ? current.preferences.filter((item) => item !== value) : [...current.preferences, value as never],
                                }))}
                                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${active ? "border-[#8bb6a5] bg-[#f0faf4] text-[#1e352d]" : "border-[#e5ece7] bg-[#fbfdfb] text-[#374d45]"}`}
                              >
                                <span>{label}</span>
                                <span>{active ? "✓" : "+"}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="h-2" />
                      </div>
                    </div>
                  )}

                  {currentPlannerStep === "activities" && (
                    <div className="flex flex-col">
                      <div className="min-h-0 max-h-[min(280px,calc(100dvh-380px))] overflow-y-auto pr-2 sm:max-h-[min(320px,calc(100dvh-360px))]">
                        <div className="space-y-2">
                          {getPlannerActivityOptions().map((option) => {
                            const selected = plannerState.chosenActivities.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setPlannerState((current) => ({
                                  ...current,
                                  chosenActivities: selected ? current.chosenActivities.filter((id) => id !== option.id) : [...current.chosenActivities, option.id],
                                }))}
                                className={`flex w-full items-center justify-between rounded-xl border p-2 text-left transition ${selected ? "border-[#87b5a4] bg-[#eefaf3]" : "border-[#e6ece7] bg-[#fcfdfd]"}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{option.emoji}</span>
                                  <span className="text-sm font-medium text-[#1e2d27]">{option.title}</span>
                                </span>
                                <span className="text-[10px] text-[#526a5d]">{option.price ? `ZAR ${option.price}` : "Free"}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="h-2" />
                      </div>
                    </div>
                  )}

                  {currentPlannerStep === "arrival" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["09:30", "Morning"],
                          ["13:30", "Afternoon"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setPlannerState((current) => ({ ...current, arrivalTime: value }))}
                            className={`rounded-xl border px-3 py-2 text-sm font-medium ${plannerState.arrivalTime === value ? "border-[#7db29d] bg-[#effaf3] text-[#18372f]" : "border-[#e5ece6] bg-[#fbfdfb] text-[#364d45]"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="rounded-xl border border-[#e8efe9] bg-[#f8fbf9] p-2 text-xs text-[#486055]">
                        {getPlanOpeningHoursSummary()}
                      </div>
                    </div>
                  )}

                  {currentPlannerStep === "summary" && (
                    <div className="flex flex-col">
                      <div className="min-h-0 max-h-[min(280px,calc(100dvh-420px))] overflow-y-auto pr-2 sm:max-h-[min(320px,calc(100dvh-400px))]">
                        <div className="space-y-3">
                          {plannerResult ? (
                            <>
                              <div className="rounded-xl border border-[#e4efe6] bg-[#f7faf7] p-3 text-sm text-[#21352d]">
                                <div className="mb-1 font-semibold">{plannerResult.summary}</div>
                                <div className="text-xs text-[#496159]">{plannerResult.reason}</div>
                              </div>

                              <div className="space-y-2">
                                {plannerResult.slots.map((slot, index) => (
                                  <div key={`${slot.title}-${index}`} className="rounded-xl border border-[#e5ece7] bg-[#f9fbfa] p-2">
                                    <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-[#51685d]">
                                      <span>{slot.time}</span>
                                      {slot.badge && <span>{slot.badge}</span>}
                                    </div>
                                    <div className="mt-1 font-medium text-[#1c2d27]">{slot.title}</div>
                                    <div className="text-[11px] text-[#4d665b]">{slot.description}</div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-[#2f453d]">Review your choices and create a personalized itinerary.</div>
                          )}
                        </div>
                        <div className="h-2" />
                      </div>
                      {plannerResult && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button type="button" onClick={() => startPlanWizard()} className="rounded-full border border-[#d8e6d9] bg-[#f0faf4] px-3 py-1.5 text-[11px] font-semibold text-[#1e352d]">🔄 Create Another Plan</button>
                          <button type="button" onClick={() => setPlannerState((current) => ({ ...current, step: "preferences" }))} className="rounded-full border border-[#d8e6d9] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1e352d]">✏️ Change Preferences</button>
                        </div>
                      )}
                    </div>
                  )}

                  </div>

                  <div className="shrink-0 border-t border-[#e4efe7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = plannerStepOrder.indexOf(plannerState.step);
                          if (currentIndex > 0) {
                            updatePlannerStep(plannerStepOrder[currentIndex - 1]);
                          }
                        }}
                        className="rounded-full border border-[#d6e6d8] bg-white px-3 py-1.5 text-xs font-medium text-[#263d34] transition-colors hover:bg-[#f5faf6]"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlannerOpen(false)}
                        className="rounded-full border border-[#d6e6d8] bg-white px-3 py-1.5 text-xs font-medium text-[#263d34] transition-colors hover:bg-[#f5faf6]"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (plannerState.step === "summary") {
                            setIsOpen(false);
                            router.push("/book");
                            return;
                          }
                          const currentIndex = plannerStepOrder.indexOf(plannerState.step);
                          if (currentIndex < plannerStepOrder.length - 1) {
                            updatePlannerStep(plannerStepOrder[currentIndex + 1]);
                            if (plannerState.step === "arrival") {
                              finalizePlanner();
                            }
                          } else {
                            finalizePlanner();
                          }
                        }}
                        className="rounded-full bg-gradient-to-r from-[#dff4eb] to-[#e0ebff] px-3 py-1.5 text-xs font-semibold text-[#1a2d26] transition-transform hover:-translate-y-0.5"
                      >
                        {currentPlannerStep === "summary" ? "Create Plan" : "Next →"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="mt-3 shrink-0 rounded-2xl border border-[#e2ebdf] bg-white/80 p-2 shadow-[0_10px_24px_rgba(18,33,28,0.05)]">
                <div className="mb-2 flex flex-wrap gap-2">
                  {starterSuggestions.map((suggestion) => {
                    const isReservationQuickAction = suggestion.toLowerCase().includes("reservation");

                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          if (isReservationQuickAction) {
                            setIsOpen(false);
                            router.push(BOOKING_ROUTE);
                            return;
                          }

                          sendMessage(suggestion.replace(/^[^\w\s]+/u, ""));
                        }}
                        className="rounded-full border border-[#d7e7d8] bg-gradient-to-r from-white to-[#f5faf4] px-2.5 py-1.5 text-[11px] font-medium text-[#2b3f36] transition-transform hover:-translate-y-0.5 hover:border-[#bfd6c4]"
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    type="text"
                    placeholder="Ask about Chamlija..."
                    className="h-12 flex-1 rounded-full border border-[#dfe7e2] bg-[#f7faf7] px-4 text-sm text-[#1d2a24] outline-none transition focus:border-[#bfd1c8] focus:bg-white"
                    aria-label="Message"
                  />

                  <button
                    type="submit"
                    aria-label="Send"
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
