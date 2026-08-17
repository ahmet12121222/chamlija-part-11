/**
 * IMPROVED CHAMLIJA AI SYSTEM
 *
 * Dynamic, intent-based chatbot with playful but practical day planning.
 */

export type ChatResponseType =
  | "text"
  | "section"
  | "pricing"
  | "activities"
  | "family-recommendation"
  | "itinerary"
  | "general-info";

export type ChatResponseSection = {
  emoji?: string;
  title?: string;
  content: string | string[] | { label: string; value: string }[];
  subtitle?: string;
};

export type TimelineItem = {
  time: string;
  title: string;
  description: string;
  price?: string;
  note?: string;
  badge?: string;
};

export type ChatResponse = {
  type: ChatResponseType;
  sections: ChatResponseSection[];
  timeline?: TimelineItem[];
  cta?: { label: string; action: "reservation" | "location" | "instagram" };
};

export type VisitorProfile = {
  groupType: "family" | "couple" | "friends" | "solo" | "group" | "unknown";
  adults?: number;
  children?: number;
  stayHours?: number;
  wantsRelaxing?: boolean;
  wantsActive?: boolean;
  wantsAnimals?: boolean;
  wantsSports?: boolean;
  wantsPicnic?: boolean;
  wantsPaid?: boolean;
  budgetFriendly?: boolean;
  arrivalTime?: "morning" | "afternoon";
  language?: "en" | "tr" | "af" | "zu" | "xh";
};

const normalize = (value: string) => {
  let normalized = value
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .trim();

  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized;
};

const containsAny = (text: string, values: string[]) =>
  values.some((value) => text.includes(value));

const randomFrom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const isTurkishInput = (text: string) => /[çğıöşü]/.test(text) || /aile|çocuk|gün|saat|piknik|rezervasyon|fiyat|merhaba|nasılsın/.test(text);

const parseNumbers = (text: string): number[] => {
  const matches = text.match(/\d+/g) ?? [];
  return matches.map((value) => Number(value));
};

const getLanguage = (text: string): "en" | "tr" | "af" | "zu" | "xh" => {
  const normalized = normalize(text);
  // Detect language from keywords
  if (isTurkishInput(normalized)) return "tr";
  if (normalized.includes("afrikaans") || normalized.includes("hallo") || normalized.includes("goeie")) return "af";
  if (normalized.includes("zulu") || normalized.includes("sawubona") || normalized.includes("ngubani")) return "zu";
  if (normalized.includes("xhosa") || normalized.includes("molo") || normalized.includes("unjani")) return "xh";
  return "en";
};

const getEquipmentNote = (title: string): string | undefined => {
  if (title.toLowerCase().includes("bike")) return "(Bring your own bicycle)";
  if (["basketball", "cricket", "beach volleyball", "mini golf"].some((item) => title.toLowerCase().includes(item))) {
    return "(Bring your own equipment)";
  }
  return undefined;
};

export type UserIntent =
  | "greeting"
  | "how-are-you"
  | "activities"
  | "family-recommendation"
  | "pricing-general"
  | "pricing-specific"
  | "pricing-by-item"
  | "opening-hours"
  | "location"
  | "reservation"
  | "plan-day"
  | "animals"
  | "rules"
  | "unknown";

export function detectIntent(input: string): UserIntent {
  const normalized = normalize(input);

  if (containsAny(normalized, ["merhaba", "selam", "hello", "hi", "hey", "good morning", "iyi gunler", "iyi aksamlar", "good day", "good evening"])) {
    return "greeting";
  }

  if (containsAny(normalized, ["nasilsin", "how are you", "how are things", "nasil gidiyor"])) {
    return "how-are-you";
  }

  if (containsAny(normalized, ["aktivite", "activity", "activities", "ne yapabiliriz", "fun", "what can we do", "neler yapabiliriz", "oyun", "game", "sports"])) {
    return "activities";
  }

  if (containsAny(normalized, ["aile", "family", "cocuk", "children", "kids", "onerisi", "recommendation", "uygun", "suitable", "ailemle", "with kids", "family day"])) {
    return "family-recommendation";
  }

  if (containsAny(normalized, ["acik", "open", "closed", "kapalı", "working hours", "saatleri", "pazartesi", "monday", "saat", "hour", "time"])) {
    return "opening-hours";
  }

  if (containsAny(normalized, ["konum", "location", "nerede", "adres", "harita", "maps", "where"])) {
    return "location";
  }

  if (containsAny(normalized, ["rezerv", "booking", "book", "reserve", "randevu", "ayir", "rezervasyon"])) {
    return "reservation";
  }

  if (containsAny(normalized, ["plan my day", "plan my visit", "itinerary", "gunu plan", "day plan", "gun boyunca", "full day", "programi", "schedule", "my day"])) {
    return "plan-day";
  }

  if (containsAny(normalized, ["fiyat", "price", "ucret", "fee", "maliyet", "cost", "kaç", "how much", "ne kadar", "all prices", "tum fiyatlar"]) && !containsAny(normalized, ["braai", "ottoman", "grass", "tent", "cart", "wagon", "amphitheater", "barn", "table", "chair", "feed", "shoot"])) {
    return "pricing-general";
  }

  if (containsAny(normalized, ["braai", "ottoman", "grass", "tent", "cart", "wagon", "amphitheater", "barn", "table", "chair", "feed", "shoot", "picnic", "fiyat", "price"])) {
    return "pricing-specific";
  }

  if (containsAny(normalized, ["hayvan", "animal", "zoo", "camel", "rabbit", "duck", "llama", "donkey", "gorulecek", "viewing", "besle", "feed"])) {
    return "animals";
  }

  if (containsAny(normalized, ["alkol", "alcohol", "muzik", "music", "rule", "kural", "yasak", "allowed"])) {
    return "rules";
  }

  return "unknown";
}

export function detectVisitorProfile(input: string): VisitorProfile {
  const normalized = normalize(input);
  const numbers = parseNumbers(normalized);

  const adults = numbers[0] ?? undefined;
  const children = numbers[1] ?? undefined;

  const hasFamily = containsAny(normalized, ["family", "aile", "with kids", "cocuk", "children", "kids"]);
  const hasCouple = containsAny(normalized, ["couple", "two people", "lovely day for two", "cift", "iki kisi", "çift"]);
  const hasFriends = containsAny(normalized, ["friends", "friend", "arkadas", "group of friends", "dostlar", "grup"]);
  const hasSolo = containsAny(normalized, ["solo", "just me", "alone", "tek basina", "yalniz", "just me"]);

  const groupType: VisitorProfile["groupType"] =
    hasFamily ? "family" :
    hasCouple ? "couple" :
    hasFriends ? "friends" :
    hasSolo ? "solo" :
    containsAny(normalized, ["group", "event", "party", "grup", "etkinlik"]) ? "group" :
    "unknown";

  const stayHours = (() => {
    const durationWords = [
      ["3 hours", "3 saat", "3hr"],
      ["4 hours", "4 saat"],
      ["5 hours", "5 saat"],
      ["6 hours", "6 saat"],
      ["all day", "whole day", "tum gun", "bütün gün"],
    ];

    for (const [english, turkish] of durationWords) {
      if (containsAny(normalized, english.split(" ")) || containsAny(normalized, turkish.split(" "))) {
        return english.includes("all day") || turkish.includes("gun") ? 8 : Number(english.match(/\d+/)?.[0] ?? 6);
      }
    }

    return undefined;
  })();

  return {
    groupType,
    adults: adults && adults > 0 ? adults : undefined,
    children: children && children >= 0 ? children : undefined,
    stayHours,
    wantsRelaxing: containsAny(normalized, ["relax", "relaxing", "rest", "calm", "dinlenmek", "sessiz", "peaceful"]) || containsAny(normalized, ["love", "comfortable", "slow day"]),
    wantsActive: containsAny(normalized, ["active", "sport", "sports", "energetic", "busy", "aktif", "spor", "oyun"]),
    wantsAnimals: containsAny(normalized, ["animals", "hayvan", "animal viewing", "zoo", "hayvanlar"]),
    wantsSports: containsAny(normalized, ["sports", "basketball", "cricket", "volleyball", "mini golf", "bike", "spor", "basketbol", "kriket", "voleybol"]),
    wantsPicnic: containsAny(normalized, ["picnic", "piknik", "braai", "barbeque", "bbq"]),
    wantsPaid: containsAny(normalized, ["paid", "feed", "animal feeding", "ox wagon", "premium", "odeme", "ucretli", "besleme", "wagon"]),
    budgetFriendly: containsAny(normalized, ["budget", "cheap", "affordable", "low cost", "bütçe", "ucuz", "düşük maliyet"]),
    arrivalTime: containsAny(normalized, ["afternoon", "after lunch", "öğleden sonra", "pm"]) ? "afternoon" : "morning",
    language: getLanguage(input),
  };
}

const languageLabel = (language: string, en: string, tr: string, af?: string, zu?: string, xh?: string): string => {
  if (language === "tr") return tr;
  if (language === "af") return af || en;
  if (language === "zu") return zu || en;
  if (language === "xh") return xh || en;
  return en;
};

const t = {
  intro: {
    en: {
      family: "Perfect! 🌿 Since you’re visiting with children, I’ve built a relaxed family-friendly day with animals, play time and a few easy activities.",
      couple: "Sounds like a lovely day for two ❤️ I’ve mixed some relaxing nature time with a few enjoyable activities.",
      friends: "Great! 👥 I’ve put together a more active day with sports, cycling and a little downtime to keep it balanced.",
      solo: "Perfect! 🧍 I’ve created a personal Chamlija day with a good mix of nature, activity and downtime.",
      group: "Wonderful! 🎉 I’ve designed a bigger, more social day with a mix of shared activities and free time.",
      unknown: "Absolutely! 🌿 I can create a personalized Chamlija day for you."
    },
    tr: {
      family: "Harika! 🌿 Çocuklarla geldiğin için daha sakin, aile dostu bir gün hazırladım; hayvanlar, oyun alanı ve keyifli aktivitelerle.",
      couple: "Kulağa romantik bir gün gibi geliyor ❤️ Doğa keyfi ile birkaç eğlenceli aktiviteyi bir araya getirdim.",
      friends: "Müthiş! 👥 Daha hareketli, spor odaklı ve biraz dinlenme alanı olan bir gün hazırladım.",
      solo: "Harika! 🧍 Kendi ritminize uygun, doğa, aktivite ve dinlenme karışımı bir Chamlija günü hazırladım.",
      group: "Muhteşem! 🎉 Daha sosyal ve enerjik, birlikte yapılan aktivitelerle dolu bir gün planladım.",
      unknown: "Tabii! 🌿 Sana özel bir Chamlija günü hazırlayabilirim."
    },
    af: {
      family: "Perfek! 🌿 Ek het 'n ontspannende dag gemaak vir jou.",
      couple: "Pragtig! ❤️ Ek het iets moois gemaak.",
      friends: "Groot! 👥 Ek het 'n aktiewe dag gemaak.",
      solo: "Perfek! 🧍 Jy gaan dit geniet.",
      group: "Wonderlik! 🎉 'n Groot dag wag op jou.",
      unknown: "Absoluut! 🌿 Ek kan 'n dag vir jou maak."
    },
    zu: {
      family: "Kuphelele! 🌿 Ngwenenze usuku oluthule.",
      couple: "Kuhle! ❤️ Ngwenenze usuku olukhangela.",
      friends: "Inkosikazi! 👥 Ngwenenze usuku olukhuluma.",
      solo: "Kuphelele! 🧍 Uzokuthanda.",
      group: "Kuhle! 🎉 Usuku olukhulu lulindele.",
      unknown: "Impela! 🌿 Ngingakwenza usuku."
    },
    xh: {
      family: "Eyalungile! 🌿 Ndenze usuku olukhululekile.",
      couple: "Kuhle! ❤️ Ndenze usuku elumnandi.",
      friends: "Enkosikazi! 👥 Ndenze usuku elikhuluma.",
      solo: "Eyalungile! 🧍 Uzakukuthanda.",
      group: "Kuhle! 🎉 Usuku olukhulu lulindele.",
      unknown: "Impela! 🌿 Ndingakwenza usuku."
    }
  },
  ask: {
    en: [
      "Absolutely! 🌿 I can create a personalized Chamlija day for you.",
      "Who are you visiting with?",
      "👨‍👩‍👧 Family",
      "❤️ Couple",
      "👥 Friends",
      "🧍 Just me"
    ],
    tr: [
      "Tabii! 🌿 Sana özel bir Chamlija günü hazırlayabilirim.",
      "Kiminle geliyorsun?",
      "👨‍👩‍👧 Aile",
      "❤️ Çift",
      "👥 Arkadaşlar",
      "🧍 Yalnız"
    ]
  }
};

const freeActivities = {
  en: [
    { title: "Animal Viewing", description: "Explore the animals around Chamlija.", price: "FREE" },
    { title: "Yellow Wood Play Park", description: "A great stop for children and active family fun.", price: "FREE" },
    { title: "Bike Riding", description: "Enjoy a ride through the park.", price: "FREE", note: "(Bring your own bicycle)" },
    { title: "Basketball", description: "Open play and a fun active break.", price: "FREE", note: "(Bring your own equipment)" },
    { title: "Cricket", description: "A relaxed sports option for groups.", price: "FREE", note: "(Bring your own equipment)" },
    { title: "Beach Volleyball", description: "A fun outdoor game with a social feel.", price: "FREE", note: "(Bring your own equipment)" },
    { title: "Mini Golf", description: "A casual activity and a nice break from the heat.", price: "FREE", note: "(Bring your own equipment)" },
    { title: "Jumping Castle", description: "Fun for children with energy to burn.", price: "FREE" },
    { title: "Nature & Open Areas", description: "Walk, enjoy the landscape and take it easy.", price: "FREE" }
  ],
  tr: [
    { title: "Hayvan İzleme", description: "Chamlija'daki hayvanları keşfedin.", price: "ÜCRETSİZ" },
    { title: "Yellow Wood Play Park", description: "Çocuklar için harika bir oyun alanı.", price: "ÜCRETSİZ" },
    { title: "Bisiklet Sürme", description: "Park içinde keyifli bir tur atın.", price: "ÜCRETSİZ", note: "(Kendi bisikletinizi getirin)" },
    { title: "Basketbol", description: "Enerjik bir mola için uygun bir seçenek.", price: "ÜCRETSİZ", note: "(Kendi ekipmanınızı getirin)" },
    { title: "Kriket", description: "Grup için sakin, sportif bir aktivite.", price: "ÜCRETSİZ", note: "(Kendi ekipmanınızı getirin)" },
    { title: "Beach Volleyball", description: "Sosyal ve eğlenceli açık hava oyunu.", price: "ÜCRETSİZ", note: "(Kendi ekipmanınızı getirin)" },
    { title: "Mini Golf", description: "Güne hafif ve keyifli bir aktivite ekler.", price: "ÜCRETSİZ", note: "(Kendi ekipmanınızı getirin)" },
    { title: "Jumping Castle", description: "Enerjisi yüksek çocuklar için ideal.", price: "ÜCRETSİZ" },
    { title: "Doğa & Açık Alanlar", description: "Yürüyüş yapın, doğayı izleyin ve sakinleşin.", price: "ÜCRETSİZ" }
  ],
  af: [
    { title: "Dierekyking", description: "Verken die diere rondom Chamlija.", price: "GRATIS" },
    { title: "Yellow Wood Speel Park", description: "'n Groot stop vir kinders en aktiewe gesinsplasier.", price: "GRATIS" },
    { title: "Sitplankry", description: "Geniet 'n rit deur die park.", price: "GRATIS", note: "(Bring jou eie fiets)" },
    { title: "Basketbal", description: "Oop spel en 'n lekker aktiewe pouse.", price: "GRATIS", note: "(Bring jou eie toerusting)" },
    { title: "Krieket", description: "'n Ontspannende sportopsie vir groepe.", price: "GRATIS", note: "(Bring jou eie toerusting)" },
    { title: "Strandvolleybal", description: "'n Lekker buitespel met 'n sosiale gevoel.", price: "GRATIS", note: "(Bring jou eie toerusting)" },
    { title: "Miniature Golf", description: "'n Toevallige aktiwiteit en 'n lekker pouse van die hitte.", price: "GRATIS", note: "(Bring jou eie toerusting)" },
    { title: "Springkasteel", description: "Lekker vir kinders met energie.", price: "GRATIS" },
    { title: "Natuur & Oop Gebiede", description: "Stap, geniet die landskap en ontspan.", price: "GRATIS" }
  ],
  zu: [
    { title: "Ukubheka Izilwane", description: "Hlola izilwane ezinjalo kuChamlija.", price: "MAHHALA" },
    { title: "Yellow Wood Play Park", description: "Isithi esikhulu sezingane nesiselo somndeni.", price: "MAHHALA" },
    { title: "Ukusulela Ibhayisikeli", description: "Jabulani nokuya ku-ithafula eliparkini.", price: "MAHHALA", note: "(Letha ibhayisikeli yakho)" },
    { title: "Ibasekhelo", description: "Ukudlala ngokukhululekile nokuphumula.", price: "MAHHALA", note: "(Letha ukhusi wakho)" },
    { title: "Ikrikhete", description: "Inhlobo yezemidlalo enobuntu bobantu.", price: "MAHHALA", note: "(Letha ukhusi wakho)" },
    { title: "Beach Volleyball", description: "Umdlalo othanda ukwenziwa ngaphandle nomdeni.", price: "MAHHALA", note: "(Letha ukhusi wakho)" },
    { title: "Mini Golf", description: "Umsebenzi osonti futhi omuhle okuphumula.", price: "MAHHALA", note: "(Letha ukhusi wakho)" },
    { title: "Jumping Castle", description: "Okuhle ngezingane ezinesikhathi sokugaleka.", price: "MAHHALA" },
    { title: "Izikhumbuzo Zikamuntu Ne-Area", description: "Zula, ubheke indawo futhi uphumule.", price: "MAHHALA" }
  ],
  xh: [
    { title: "Ukubheka Izilwanyana", description: "Hlola izilwanyana ezinjalo kuChamlija.", price: "SIMAHLA" },
    { title: "Yellow Wood Play Park", description: "Isiqalo esixakabisayo sabantwana nesiselo soxapho.", price: "SIMAHLA" },
    { title: "Ukunyanda Sebhayisikeli", description: "Jabulani nokuya kwigaki.", price: "SIMAHLA", note: "(Letha ibhayisikeli yakho)" },
    { title: "Ibasekhelo", description: "Umdlalo ngokukhululekile nokuphumula.", price: "SIMAHLA", note: "(Letha ukhusi wakho)" },
    { title: "Ikliki", description: "Umdlalo wezindawo esisele abantu.", price: "SIMAHLA", note: "(Letha ukhusi wakho)" },
    { title: "Beach Volleyball", description: "Umdlalo othanda ukwenziwa ngaphandle nesiselo.", price: "SIMAHLA", note: "(Letha ukhusi wakho)" },
    { title: "Mini Golf", description: "Umdlalo wesesikhashana kunye nomphumela.", price: "SIMAHLA", note: "(Letha ukhusi wakho)" },
    { title: "Jumping Castle", description: "Ekuseni yentwana ezinesikhathi sokugaleka.", price: "SIMAHLA" },
    { title: "Izikhumbuzo Zezinye neZindawo", description: "Zula, ubheke inkcazo futhi uphumule.", price: "SIMAHLA" }
  ]
};

const paidActivities = {
  en: [
    { title: "Animal Feeding", description: "A great interactive stop for children and families.", price: "ZAR 30" },
    { title: "OX Wagon Tour", description: "A relaxing guided experience through the area.", price: "ZAR 60 adult / ZAR 50 child" }
  ],
  tr: [
    { title: "Hayvan Besleme", description: "Çocuklar ve aileler için interaktif bir durak.", price: "ZAR 30" },
    { title: "OX Wagon Tour", description: "Bölgeyi keyifle keşfetmenin sakin bir yolu.", price: "ZAR 60 yetişkin / ZAR 50 çocuk" }
  ],
  af: [
    { title: "Dierebesvoeding", description: "Groot interaktiewe stop vir kinders en gesinne.", price: "ZAR 30" },
    { title: "OX Wagon-toer", description: "'n Ontspannende geleide ervaring deur die gebied.", price: "ZAR 60 volwassene / ZAR 50 kind" }
  ],
  zu: [
    { title: "Ukudla Kwezilwane", description: "Isithi esikhulu se-interactive sezingane namafimelelo.", price: "ZAR 30" },
    { title: "Isiqalelo se-OX Wagon", description: "Ulwazi olukhululekile lweendawo.", price: "ZAR 60 umuntu owedlule / ZAR 50 ingane" }
  ],
  xh: [
    { title: "Ukonaka Kwisilwanyana", description: "Isithi esixakabisayo sabantwana nemafimelelo.", price: "ZAR 30" },
    { title: "Iziqalelo zeOX Wagon", description: "Ulwazi olukhululekile lweendawo.", price: "ZAR 60 umuntu owedlule / ZAR 50 ingane" }
  ]
};

// Multilingual response strings
const ML_STRINGS = {
  greeting: {
    en: { title: "Hello!", content: ["Welcome to Chamlija. I'm here to help you have an unforgettable day in our nature reserve. How can I assist?"] },
    tr: { title: "Merhaba!", content: ["Chamlija'ya hoş geldiniz. Chamlija doğa koruma alanında unutulmaz bir gün geçirmenize yardımcı olmaya hazırım. Size nasıl yardımcı olabilirim?"] },
    af: { title: "Hallo!", content: ["Welkom by Chamlija. Ek is hier om jou te help om 'n onvergeetlike dag in ons natuurreservaat deur te bring. Hoe kan ek jou help?"] },
    zu: { title: "Sawubona!", content: ["Wamukelekile kuChamlija. Ngilapha ukukusiza ukulungisa usuku olukhanyayo kulindawo yethu yemvelo. Ngiyakusiza kanjani?"] },
    xh: { title: "Molo!", content: ["Wamkelekile kwiChamlija. Ndilapha ukukunceda ukuba ulungise usuku olumnandi kwindawo yethu yemvelo. Ngandela kuthini?"] }
  },
  howAreYou: {
    en: { title: "I'm doing great, thank you!", content: ["Feel free to ask me about activities, pricing, family recommendations, and more about Chamlija!"] },
    tr: { title: "İyiyim, teşekkür ederim!", content: ["Aktiviteler, fiyatlar, aile önerileri ve Chamlija hakkında daha fazlası için bana sorabilirsiniz."] },
    af: { title: "Ek voel goed, dankie!", content: ["Voel vry om my te vra oor aktiwiteite, pryse, gesinsaanbevelings en meer oor Chamlija!"] },
    zu: { title: "Ngikhona kahle, ngiyabonga!", content: ["Zisulele ukubuza ngokomisebenzi, inanini, izeluleko zomndeni, kanye nokunye mayelana noC hamlija!"] },
    xh: { title: "Ndikhona kakuhle, enkosi!", content: ["Zisulele ukubuza malunga nendlela yokusebenza, imiganeko, iipahla zosapho, kunye nokunye malunga noChamlija!"] }
  },
  planRequest: {
    en: { content: "I can create a personalized Chamlija day for you. Who are you visiting with?" },
    tr: { content: "Sana özel bir Chamlija günü hazırlayabilirim. Kiminle geliyorsun?" },
    af: { content: "Ek kan 'n persoonlike Chamlija-dag vir jou skep. Met wie besoek jy?" },
    zu: { content: "Ngingakwenza usuku lwePersonal Chamlija. Uza kuphi nabantu?" },
    xh: { content: "Ndingakwenza usuku olwenziwe ngokukho kwakho. Uza kuphi nabantu?" }
  }
};

const buildItinerary = (profile: VisitorProfile): TimelineItem[] => {
  const language = (profile.language ?? "en") as keyof typeof freeActivities;
  const basePool = [...(freeActivities[language] || freeActivities.en), ...(paidActivities[language] || paidActivities.en)];
  let primaryPool: Array<{ title: string; description: string; price: string; note?: string }> = [...basePool];

  if (profile.groupType === "family") {
    primaryPool = [
      ...freeActivities[language].filter((item) => ["Hayvan İzleme", "Yellow Wood Play Park", "Bisiklet Sürme", "Jumping Castle", "Doğa & Açık Alanlar", "Animal Viewing", "Yellow Wood Play Park", "Bike Riding", "Jumping Castle", "Nature & Open Areas"].includes(item.title)),
      ...paidActivities[language]
    ];
  }

  if (profile.groupType === "couple") {
    primaryPool = freeActivities[language].filter((item) => ["Hayvan İzleme", "Bisiklet Sürme", "Doğa & Açık Alanlar", "Animal Viewing", "Bike Riding", "Nature & Open Areas"].includes(item.title));
    primaryPool.push(...paidActivities[language].slice(1));
  }

  if (profile.groupType === "friends") {
    primaryPool = freeActivities[language].filter((item) => ["Bisiklet Sürme", "Basketbol", "Kriket", "Beach Volleyball", "Mini Golf", "Doğa & Açık Alanlar", "Bike Riding", "Basketball", "Cricket", "Beach Volleyball", "Mini Golf", "Nature & Open Areas"].includes(item.title));
  }

  if (profile.groupType === "solo") {
    primaryPool = freeActivities[language].filter((item) => ["Hayvan İzleme", "Bisiklet Sürme", "Doğa & Açık Alanlar", "Animal Viewing", "Bike Riding", "Nature & Open Areas"].includes(item.title));
  }

  const selected = new Set<string>();
  const itinerary: TimelineItem[] = [];
  const startMinutes = profile.arrivalTime === "afternoon" ? 14 : 9;
  let currentMinute = startMinutes * 60;

  const pushSlot = (entry: { title: string; description: string; price: string; note?: string }, offset: number) => {
    if (selected.has(entry.title)) return;
    selected.add(entry.title);
    const time = new Date(0);
    time.setMinutes(currentMinute + offset);
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");

    itinerary.push({
      time: `${hours}:${minutes}`,
      title: entry.title,
      description: entry.description,
      price: entry.price,
      note: entry.note ?? getEquipmentNote(entry.title),
      badge: entry.price === "FREE" || entry.price === "ÜCRETSİZ" ? "Free" : "Paid"
    });
  };

  const arrival = {
    title: language === "tr" ? "Varış" : "Arrival",
    description: language === "tr" ? "Chamlija'ya hoş geldiniz." : "Welcome to Chamlija.",
    price: "—"
  };

  pushSlot(arrival, 0);

  const chosenActivities = [] as Array<{ title: string; description: string; price: string; note?: string }>;
  const activityCount = profile.stayHours && profile.stayHours <= 3 ? 3 : profile.stayHours && profile.stayHours >= 7 ? 6 : 4;

  for (let i = 0; i < activityCount; i += 1) {
    const candidate = randomFrom(primaryPool);
    if (!candidate) break;
    chosenActivities.push(candidate);
    primaryPool = primaryPool.filter((item) => item.title !== candidate.title);
  }

  const groupedActivities = chosenActivities.length > 0 ? chosenActivities : basePool.slice(0, 4);

  groupedActivities.forEach((entry, index) => {
    const offset = 45 + index * 70;
    pushSlot(entry, offset);
  });

  if (profile.wantsPicnic) {
    const picnic = {
      title: language === "tr" ? "Piknik" : "Picnic",
      description: language === "tr" ? "Güne dinlenerek devam edin ve öğle molası verin." : "Take a break, unwind and enjoy a picnic moment.",
      price: language === "tr" ? "İsteğe bağlı" : "Optional",
      note: language === "tr" ? "If you’d like a picnic area, you can choose from Braai Area, Ottoman Corner or Grass Area." : "If you'd like a picnic area, you can choose from Braai Area, Ottoman Corner or Grass Area."
    };
    pushSlot(picnic, 120);
  }

  const cooldown = {
    title: language === "tr" ? "Doğa keyfi / Dinlenme" : "Nature time / Relax",
    description: language === "tr" ? "Açık alanları sakin bir şekilde keşfedin." : "Take a slow walk and enjoy the natural surroundings.",
    price: "FREE",
  };

  pushSlot(cooldown, 180);

  if (profile.wantsPaid && (paidActivities[language] || paidActivities.en).length > 0) {
    const paid = randomFrom((paidActivities[language] || paidActivities.en));
    if (paid) pushSlot(paid, 240);
  }

  return itinerary.slice(0, 6);
};

const estimateCost = (profile: VisitorProfile, itinerary: TimelineItem[]) => {
  const adultCount = profile.adults ?? 2;
  const childCount = profile.children ?? 0;

  const entry = adultCount * 50 + childCount * 25;
  const paidItems = itinerary.filter((slot) => {
    const price = slot.price ?? "";
    return price.includes("ZAR 30") || price.includes("ZAR 60") || price.includes("ZAR 50");
  }).length;
  const paidFee = paidItems * 30;

  return {
    entry,
    paidFee,
    estimatedTotal: entry + paidFee
  };
};

export function generatePlanMyDayResponse(input: string = "", profileOverride?: VisitorProfile): ChatResponse {
  const profile = profileOverride ?? detectVisitorProfile(input);

  const hasVisitorInfo =
    profile.groupType !== "unknown" ||
    containsAny(normalize(input), ["family", "aile", "couple", "çift", "friends", "arkadaş", "solo", "yalnız", "just me", "2 adults", "3 kids", "2 yetişkin", "çocuk", "all day", "3 hours", "4 hours", "5 hours", "afternoon"]);

  const language = profile.language ?? getLanguage(input ?? "");

  if (!profileOverride && !hasVisitorInfo) {
    return {
      type: "text",
      sections: [
        {
          emoji: "🌿",
          title: languageLabel(language, "Absolutely! 🌿", "Tabii! 🌿"),
          content: [
            languageLabel(language, "I can create a personalized Chamlija day for you.", "Sana özel bir Chamlija günü hazırlayabilirim."),
            languageLabel(language, "Who are you visiting with?", "Kiminle geliyorsun?"),
            "👨‍👩‍👧 Family",
            "❤️ Couple",
            "👥 Friends",
            "🧍 Just me"
          ]
        }
      ]
    };
  }

  const introLang = (language as keyof typeof t.intro) || "en";
  const introGroup = (profile.groupType === "unknown" ? "unknown" : profile.groupType) as keyof typeof t.intro.en;
  const intro = t.intro[introLang]?.[introGroup] || t.intro.en[introGroup];

  const itinerary = buildItinerary({ ...profile, language });
  const cost = estimateCost(profile, itinerary);

  const sections: ChatResponseSection[] = [
    { emoji: "✨", title: language === "tr" ? "Chamlija Gün Planınız" : "Your Chamlija Day", content: [intro] },
    {
      emoji: "🧭",
      title: language === "tr" ? "Plan" : "Plan",
      content: [
        language === "tr" ? "Bu plan, ziyaret tarzınıza göre dinamik olarak oluşturuldu." : "This plan was generated dynamically based on your visit style."
      ]
    }
  ];

  if (cost.estimatedTotal > 0 && (profile.adults || profile.children)) {
    sections.push({
      emoji: "💰",
      title: language === "tr" ? "Tahmini Maliyet" : "Estimated Cost",
      content: [
        `${language === "tr" ? "Giriş" : "Entrance"}: ${profile.adults ?? 2} ${language === "tr" ? "yetişkin" : "adults"} × ZAR 50 = ZAR ${((profile.adults ?? 2) * 50)}${profile.children ? ` | ${profile.children} ${language === "tr" ? "çocuk" : "children"} × ZAR 25 = ZAR ${profile.children * 25}` : ""}`,
        `${language === "tr" ? "Tahmini toplam" : "Estimated total"}: ZAR ${cost.estimatedTotal}`
      ]
    });
  }

  return {
    type: "itinerary",
    sections,
    timeline: itinerary,
    cta: { label: language === "tr" ? "📅 Rezervasyon Yap" : "📅 Reserve Your Visit", action: "reservation" }
  };
}

export function generateGreetingResponse(input: string = ""): ChatResponse {
  const language = getLanguage(input) as keyof typeof ML_STRINGS.greeting;
  const strings = ML_STRINGS.greeting[language];
  
  return {
    type: "text",
    sections: [
      {
        emoji: "🌿",
        title: strings.title,
        content: strings.content
      }
    ]
  };
}

export function generateHowAreYouResponse(input: string = ""): ChatResponse {
  const language = getLanguage(input) as keyof typeof ML_STRINGS.howAreYou;
  const strings = ML_STRINGS.howAreYou[language];
  
  return {
    type: "text",
    sections: [
      {
        emoji: "😊",
        title: strings.title,
        content: strings.content
      }
    ]
  };
}

export function generateActivitiesResponse(): ChatResponse {
  return {
    type: "activities",
    sections: [
      {
        emoji: "🌿",
        title: "Chamlija Aktiviteleri",
        content: [
          { label: "🐪 Hayvan İzleme", value: "Ücretsiz" },
          { label: "🚲 Bisiklet Sürme", value: "Ücretsiz (Kendi bisikletinizi getirin)" },
          { label: "🌳 Yellow Wood Play Park", value: "Ücretsiz" },
          { label: "🏏 Kriket", value: "Ücretsiz (Kendi ekipmanınızı getirin)" },
          { label: "🏀 Basketbol", value: "Ücretsiz (Kendi ekipmanınızı getirin)" },
          { label: "🏐 Beach Volleyball", value: "Ücretsiz (Kendi ekipmanınızı getirin)" },
          { label: "⛳ Mini Golf", value: "Ücretsiz (Kendi ekipmanınızı getirin)" },
          { label: "🏰 Jumping Castle", value: "Ücretsiz" },
          { label: "🥕 Hayvan Besleme", value: "ZAR 30" },
          { label: "🚜 OX Wagon Tour", value: "ZAR 60 yetişkin / ZAR 50 çocuk" }
        ]
      }
    ]
  };
}

export function generateFamilyRecommendationResponse(): ChatResponse {
  return {
    type: "family-recommendation",
    sections: [
      {
        emoji: "👨‍👩‍👧‍👦",
        title: "Aile İçin Öneriler",
        content: [
          "🐪 Hayvan İzleme — Ücretsiz",
          "🌳 Yellow Wood Play Park — Ücretsiz",
          "🚲 Bisiklet Sürme — Ücretsiz (Kendi bisikletinizi getirin)",
          "🏰 Jumping Castle — Ücretsiz",
          "🥕 Hayvan Besleme — ZAR 30",
          "🚜 OX Wagon Tour — ZAR 60 yetişkin / ZAR 50 çocuk"
        ]
      },
      {
        emoji: "🧺",
        title: "Piknik Alanları",
        content: [
          "💚 Braai Area — ZAR 350",
          "💚 Grass Area — ZAR 5,500 (giriş dahil)",
          "💚 Ottoman Corner — ZAR 1,500 (giriş hariç)"
        ]
      },
      {
        content: "Giriş: 2 yetişkin × ZAR 50 = ZAR 100 | 3 çocuk × ZAR 25 = ZAR 75 | Toplam giriş: ZAR 175"
      }
    ],
    cta: { label: "📅 Rezervasyon Yap", action: "reservation" }
  };
}

export function generatePricingGeneralResponse(): ChatResponse {
  return {
    type: "pricing",
    sections: [
      {
        emoji: "🎟️",
        title: "Giriş Ücreti",
        content: [
          "🧑 Yetişkin — ZAR 50",
          "👧 Çocuk — ZAR 25"
        ]
      },
      {
        emoji: "🧺",
        title: "Piknik & Alanlar",
        content: [
          "Braai Area — ZAR 350",
          "Ottoman Corner — ZAR 1,500 (giriş hariç)",
          "Grass Area — ZAR 5,500 (giriş dahil)",
          "Grass Area + Çadır (9×16m) — ZAR 10,000"
        ]
      },
      {
        emoji: "⛺",
        title: "Çadırlar",
        content: [
          "Pangola (3×3m) — ZAR 100",
          "Pangola (5×10m) — ZAR 2,500",
          "Frame (6×9m) — ZAR 2,500",
          "Frame (5×15m) — ZAR 4,000",
          "Frame (9×16m) — ZAR 5,500"
        ]
      },
      {
        emoji: "🎉",
        title: "Etkinlik Alanları",
        content: [
          "White Swan & Pool — ZAR 2,500 (giriş hariç)",
          "Amphitheater — ZAR 3,000 (giriş hariç)",
          "The Barn Hall — ZAR 35,000 (giriş dahil)"
        ]
      },
      {
        emoji: "🪑",
        title: "Ekstra Ürünler",
        content: [
          "6-Seater Picnic Table — ZAR 70",
          "Plastic Table — ZAR 60",
          "Plastic Chair — ZAR 20"
        ]
      },
      {
        emoji: "🚙",
        title: "Diğer Hizmetler",
        content: [
          "Golf Cart (4 kişi + şoför) — ZAR 2,000",
          "OX Wagon Tour — ZAR 60 yetişkin / ZAR 50 çocuk",
          "Hayvan Besleme — ZAR 30",
          "Fotoğraf Çekimi — ZAR 1,200 tam gün / ZAR 600 (0–4 saat)"
        ]
      }
    ]
  };
}

export function generateOpeningHoursResponse(): ChatResponse {
  return {
    type: "text",
    sections: [
      {
        emoji: "🕒",
        title: "Çalışma Saatleri",
        content: [
          "Pazartesi — Kapalı",
          "Salı – Cuma — 10:00 – 18:00",
          "Cumartesi – Pazar — 09:00 – 18:00"
        ]
      }
    ]
  };
}

export function generateLocationResponse(): ChatResponse {
  return {
    type: "text",
    sections: [
      {
        emoji: "📍",
        title: "Chamlija Konumu",
        content: "Chamlija Doğa Koruma Alanı, Güney Afrika"
      }
    ],
    cta: { label: "📍 Google Maps'te Aç", action: "location" }
  };
}

export function generateReservationResponse(): ChatResponse {
  return {
    type: "text",
    sections: [
      {
        emoji: "📅",
        title: "Rezervasyon",
        content: "Ziyaretinizi hemen rezervasyon yapabilirsiniz. Aşağıdaki butona tıklayın."
      }
    ],
    cta: { label: "📅 Şimdi Rezervasyon Yap", action: "reservation" }
  };
}

export function generateAnimalsResponse(): ChatResponse {
  return {
    type: "text",
    sections: [
      {
        emoji: "🐾",
        title: "Chamlija'daki Hayvanlar",
        content: "Chamlija'da yaklaşık 50 türde hayvan vardır:",
        subtitle: "🐔 Tavuk, 🐪 Deve, 🐇 Tavşan, 🦆 Ördek, 🦙 Lama, 🫏 Eşek, 🐕 Köpek, 🐑 Koyun, 🐿️ Sincap, 🐐 Keçi, 🦃 Hindi, 🪿 Kaz ve diğerleri."
      },
      {
        emoji: "🥕",
        title: "Hayvan Besleme",
        content: "Hayvanları beslemek isterseniz, hayvan yemi ZAR 30'dir."
      }
    ]
  };
}

export function generateRulesResponse(): ChatResponse {
  return {
    type: "text",
    sections: [
      {
        emoji: "⚠️",
        title: "Chamlija Kuralları",
        content: [
          "❌ Alkol yasaktır",
          "❌ Müzik yasaktır",
          "✅ Doğayı saygıyla kullanın"
        ]
      }
    ]
  };
}

export function generateUnknownResponse(): ChatResponse {
  return {
    type: "text",
    sections: [
      {
        emoji: "🤔",
        title: "Anladığım Konularda Yardımcı Olmaya Hazırım",
        content: [
          "💰 Fiyatlar",
          "🌿 Aktiviteler",
          "👨‍👩‍👧 Aile Önerileri",
          "🕒 Çalışma Saatleri",
          "📍 Konum",
          "📅 Rezervasyon",
          "✨ Gün Planı"
        ]
      },
      {
        content: "Başka konular hakkında bilgi almak için lütfen +27 062 087 3208 numarasını arayın veya buyukchamlija@uict.org.za adresine e-posta gönderin."
      }
    ]
  };
}

export function buildChamlijaAIResponse(input: string): ChatResponse {
  const intent = detectIntent(input);

  switch (intent) {
    case "greeting":
      return generateGreetingResponse();
    case "how-are-you":
      return generateHowAreYouResponse();
    case "activities":
      return generateActivitiesResponse();
    case "family-recommendation":
      return generateFamilyRecommendationResponse();
    case "pricing-general":
      return generatePricingGeneralResponse();
    case "opening-hours":
      return generateOpeningHoursResponse();
    case "location":
      return generateLocationResponse();
    case "reservation":
      return generateReservationResponse();
    case "plan-day":
      return generatePlanMyDayResponse(input);
    case "animals":
      return generateAnimalsResponse();
    case "rules":
      return generateRulesResponse();
    default:
      return generateUnknownResponse();
  }
}
