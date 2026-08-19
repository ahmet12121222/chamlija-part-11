import { CHAMLIJA_MAPS_URL } from "@/lib/location";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type ChatConversationContext = {
  adults?: number;
  children?: number;
  previousMessages: string[];
  lastTopic?: string;
};

const normalize = (value: string) => {
  // Handle Turkish characters: İ → i, ı → i
  let normalized = value
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .trim();
  
  // Remove combining diacritics
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return normalized;
};

export const chamlijaPricing = {
  entrance: {
    adult: "Yetişkin: ZAR 50",
    child: "Çocuk: ZAR 25",
  },
  picnicAreas: {
    braai: "Braai Area: ZAR 350",
    ottoman: "Ottoman Corner: ZAR 1,500\nGiriş ücreti dahil değildir.",
    grass: "Grass Area: ZAR 5,500\nGiriş ücreti dahildir.",
    grassWithTent: "Grass Area with Tent (9 × 16 m): ZAR 10,000",
    extraItems: [
      "6-Seater Picnic Table / Bench: ZAR 70",
      "Plastic Table: ZAR 60",
      "Plastic Chair: ZAR 20",
    ],
  },
  tents: {
    pangola3x3: "Pangola Tent (3 × 3 m): ZAR 100",
    pangola5x10: "Pangola Tent (5 × 10 m): ZAR 2,500",
    frame6x9: "Frame Tent (6 × 9 m): ZAR 2,500",
    frame5x15: "Frame Tent (5 × 15 m): ZAR 4,000",
    frame9x16: "Frame Tent (9 × 16 m): ZAR 5,500",
  },
  events: {
    whiteSwan: "White Swan & Heart Shaped Pool: ZAR 2,500\nGiriş ücreti dahil değildir.",
    amphitheater: "Amphitheater: ZAR 3,000\nGiriş ücreti dahil değildir.",
    barnHall: "The Barn Hall: ZAR 35,000\nGiriş ücreti dahildir.",
    photoShoot: "Photo Shoot:\nAll day: ZAR 1,200\n0–4 hours: ZAR 600",
    barnHallPayment: "The Barn Hall ödeme koşulu:\nRezervasyon sırasında %10 iade edilmeyen depozito gereklidir.\nTam ödeme, rezervasyon tarihinden 1 ay önce yapılmalıdır.",
  },
  transport: {
    golfCart: "Golf Cart – 4 Seater with Driver: ZAR 2,000",
    oxWagon: "OX Wagon Tour:\nAdult: ZAR 60\nChild: ZAR 50\nUnder 3 years old: FREE",
  },
  animals: {
    animalFeed: "Animal Feed: ZAR 30",
  },
  activities: {
    free: [
      "Bike Riding: FREE",
      "Animal Viewing: FREE",
      "Yellow Wood Play Park: FREE",
      "Cricket: FREE\nKendi ekipmanınızı getirmeniz gerekmektedir.",
      "Basketball: FREE\nKendi ekipmanınızı getirmeniz gerekmektedir.",
      "Beach Volleyball: FREE\nKendi ekipmanınızı getirmeniz gerekmektedir.",
      "Mini Golf: FREE\nKendi ekipmanınızı getirmeniz gerekmektedir.",
      "Jumping Castle: FREE",
    ],
  },
};

export const chamlijaKnowledge = {
  entrance: {
    adult: "Adult: ZAR 50 per person.",
    child: "Child: ZAR 25 per person.",
    summary: "Adult: ZAR 50. Child: ZAR 25.",
  },
  rules: {
    alcohol: "Alcohol is not allowed at Chamlija.",
    music: "Music is not allowed at Chamlija.",
  },
  contact: {
    instagram: "Instagram: @buyukchamlija",
    location: `Location: ${CHAMLIJA_MAPS_URL}`,
  },
  animals: {
    summary: "Chamlija has around 50 types of animals, including chicken, camel, rabbit, duck, llama, donkey, dog, sheep, squirrel, goat, pheasant, goose and other animals.",
    examples: [
      "Chicken",
      "Camel",
      "Rabbit",
      "Duck",
      "Llama",
      "Donkey",
      "Dog",
      "Sheep",
      "Squirrel",
      "Goat",
      "Pheasant",
      "Goose",
    ],
  },
  openingHours: {
    monday: "Monday: closed all day.",
    tuesdayFriday: "Tuesday–Friday: 10:00 – 18:00.",
    saturdaySunday: "Saturday–Sunday: 09:00 – 18:00.",
    summary: "Monday is closed. Tuesday–Friday is 10:00–18:00. Saturday–Sunday is 09:00–18:00.",
  },
  picnicAreas: {
    braai: "Braai Area: ZAR 350.",
    ottoman: "Ottoman Corner: ZAR 1,500. Entrance fee excluded.",
    grass: "Grass Area: ZAR 5,500. Entrance fee included.",
    extraItems: [
      "6-Seater Picnic Table / Bench: ZAR 70",
      "Plastic Table: ZAR 60",
      "Plastic Chair: ZAR 20",
    ],
  },
  activities: {
    free: [
      "Bike Riding: FREE / 0 ZAR",
      "Animal Viewing: FREE / 0 ZAR",
      "Yellow Wood Play Park: FREE / 0 ZAR",
      "Jumping Castle: FREE",
      "Cricket: FREE (bring your own equipment)",
      "Basketball: FREE (bring your own equipment)",
      "Beach Volleyball: FREE (bring your own equipment)",
      "Mini Golf: FREE (bring your own equipment)",
    ],
    paid: [
      "Animal Feed: ZAR 30",
      "OX Wagon Tour: Adult ZAR 60, Child ZAR 50, children under 3 FREE",
    ],
    families: [
      "Yellow Wood Play Park: FREE",
      "Animal Viewing: FREE",
      "Bike Riding: FREE",
      "Jumping Castle: FREE",
      "Animal Feed: ZAR 30",
      "OX Wagon Tour: Child ZAR 50, under 3 FREE",
    ],
  },
  events: {
    whiteSwan: "White Swan & Heart Shaped Pool: ZAR 2,500. Entrance fee excluded.",
    ottoman: "Ottoman Corner: ZAR 1,500. Entrance fee excluded.",
    amphitheater: "Amphitheater: ZAR 3,000. Entrance fee excluded.",
    barnHall: "The Barn Hall: ZAR 35,000. Entrance fee included. A 10% non-refundable deposit is required upon booking, and full payment must be made one month before the booked date.",
    photoShoot: "Photo Shoot: All day ZAR 1,200 or 0–4 hours ZAR 600.",
  },
  tents: {
    pangola3x3: "Pangola Tent 3 × 3 m: ZAR 100",
    pangola5x10: "Pangola Tent 5 × 10 m: ZAR 2,500",
    frame6x9: "Frame Tent 6 × 9 m: ZAR 2,500",
    frame5x15: "Frame Tent 5 × 15 m: ZAR 4,000",
    frame9x16: "Frame Tent 9 × 16 m: ZAR 5,500",
    grassWithTent: "Grass Area with Tent: ZAR 10,000",
    grassArea: "Grass Area: ZAR 5,500. Entrance fee included.",
  },
  transport: {
    golfCart: "Golf Cart: 4-seater with driver, ZAR 2,000",
    oxWagon: "OX Wagon Tour: Adult ZAR 60, Child ZAR 50, under 3 FREE",
  },
  fallback: "This topic is not in my verified Chamlija information. I would not want to give you incorrect details. Please contact the Chamlija team for the latest confirmed information.",
};


const containsAny = (text: string, values: string[]) => values.some((value) => text.includes(value));

const isCasualConversation = (text: string) => {
  const normalized = normalize(text);

  return containsAny(normalized, [
    "merhaba",
    "selam",
    "hello",
    "hi",
    "hey",
    "nasılsın",
    "nasilsin",
    "how are you",
    "how are things",
    "thank you",
    "thanks",
    "teşekkür",
    "teşekkürler",
    "rica ederim",
    "görüşürüz",
    "gorusuruz",
    "goodbye",
    "bye",
    "iyi akşamlar",
    "iyi akşamlar",
    "iyi günler",
    "iyi gunler",
    "good evening",
    "good day",
    "sen kimsin",
    "who are you",
    "who is this",
    "yeterli",
  ]);
};

const getCasualReply = (text: string): string | null => {
  const normalized = normalize(text);

  if (
    containsAny(normalized, ["merhaba nasılsın", "merhaba nasilsin", "hello how are you", "hi how are you", "hey how are you"]) ||
    containsAny(normalized, ["nasılsın", "nasilsin", "how are you", "how are things"]) &&
    containsAny(normalized, ["merhaba", "selam", "hello", "hi", "hey"]) 
  ) {
    return "Merhaba 👋 Gayet iyiyim, teşekkür ederim! Chamlija hakkında size yardımcı olmaya hazırım. Bugün ne hakkında bilgi almak istersiniz? 🌿";
  }

  if (containsAny(normalized, ["iyi günler", "iyi gunler", "good day", "good afternoon"])) {
    return "İyi günler 😊 Chamlija'da keyifli bir gün geçirmenizi dilerim. Size nasıl yardımcı olabilirim?";
  }

  if (containsAny(normalized, ["merhaba", "selam", "hello", "hi", "hey"])) {
    return "Merhaba 👋 Hoş geldiniz! Size nasıl yardımcı olabilirim?";
  }

  if (containsAny(normalized, ["nasılsın", "nasilsin", "how are you", "how are things"])) {
    return "Gayet iyiyim, teşekkür ederim 😊 Sen nasılsın? Chamlija hakkında bir şey merak ediyorsan yardımcı olabilirim.";
  }

  if (containsAny(normalized, ["teşekkür", "teşekkürler", "thanks", "thank you"])) {
    return "Rica ederim 😊 Her zaman yardımcı olmaktan mutluluk duyarım.";
  }

  if (containsAny(normalized, ["sen kimsin", "who are you", "who is this"])) {
    return "Ben Chamlija Support 🌿 Chamlija hakkında bilgi vermek, aktiviteleri ve fiyatları açıklamak ve ziyaretinizi planlamanıza yardımcı olmak için buradayım.";
  }

  if (containsAny(normalized, ["görüşürüz", "gorusuruz", "goodbye", "bye"])) {
    return "Görüşürüz 😊 Chamlija hakkında ihtiyaç duyarsanız yardımcı olmaktan mutluluk duyarız.";
  }

  if (containsAny(normalized, ["iyi akşamlar", "good evening"])) {
    return "İyi akşamlar 😊 Chamlija hakkında size yardımcı olabilirim.";
  }

  return null;
};

const extractCounts = (text: string) => {
  const normalized = normalize(text);
  const adults = normalized.match(/(\d+)\s*(adult|adults|yetişkin|yetişkinler)/)?.[1];
  const children = normalized.match(/(\d+)\s*(child|children|çocuk|çocuklar)/)?.[1];

  return {
    adults: adults ? Number(adults) : undefined,
    children: children ? Number(children) : undefined,
  };
};

const getDayName = (date: Date) => DAY_NAMES[date.getDay()];

const getOpeningStatus = (date: Date) => {
  const day = getDayName(date);

  if (day === "monday") return "Monday is our full-day closing day, so we are closed on Mondays.";
  if (day === "tuesday" || day === "wednesday" || day === "thursday" || day === "friday") return "Yes 😊 We are open on this day from 10:00 to 18:00.";
  if (day === "saturday" || day === "sunday") return "Yes 😊 We are open on this day from 09:00 to 18:00.";
  return chamlijaKnowledge.openingHours.summary;
};

const categoryDefinitions = [
  {
    id: "entrance",
    keywords: [
      "entrance",
      "entry fee",
      "giriş",
      "ücret",
      "adult",
      "child",
      "yetişkin",
      "çocuk",
      "price",
      "fiyat",
      "fee",
    ],
  },
  {
    id: "rules",
    keywords: ["alcohol", "alkol", "music", "müzik", "rule", "kural"],
  },
  {
    id: "location",
    keywords: ["location", "where are you", "konum", "adres", "get there", "how can i get there", "nerede"],
  },
  {
    id: "instagram",
    keywords: ["instagram", "insta", "social media", "sosyal medya"],
  },
  {
    id: "animals",
    keywords: ["animal", "hayvan", "animals", "pet", "zoo", "camel", "rabbit", "duck", "llama", "donkey", "sheep", "goat"],
  },
  {
    id: "openingHours",
    keywords: ["open", "hours", "working", "closed", "monday", "sunday", "tuesday", "friday", "saturday", "açık", "çalışma", "kapalı"],
  },
  {
    id: "activities",
    keywords: [
      "activity",
      "activities",
      "what can we do",
      "fun",
      "families",
      "kids",
      "children",
      "game",
      "aktivite",
      "yapabiliriz",
      "çocuk",
      "aile",
      "doğum günü",
      "birthday",
    ],
  },
  {
    id: "picnic",
    keywords: ["picnic", "braai", "grass area", "ottoman", "table", "chairs", "area", "piknik", "masa", "sandalye", "alan"],
  },
  {
    id: "events",
    keywords: ["event", "wedding", "function", "photography", "photo shoot", "amphitheater", "barn hall", "pool", "etkinlik", "düğün"],
  },
  {
    id: "free",
    keywords: ["free", "ücretsiz", "0 zar", "0 zar", "what is free"],
  },
  {
    id: "transport",
    keywords: ["golf cart", "wagon", "transport", "ride", "cart", "taşıma", "araba"],
  },
  {
    id: "tents",
    keywords: ["tent", "camping", "pavilion", "çadır", "grass area with tent", "pangola", "frame tent"],
  },
  {
    id: "food",
    keywords: ["animal feed", "feed", "food", "besleme", "hayvan besleme"],
  },
];

const chooseRelevantCategories = (question: string) => {
  const normalized = normalize(question);

  return categoryDefinitions
    .map((category) => {
      const score = category.keywords.reduce((total, keyword) => {
        const effectiveKeyword = normalize(keyword);
        return total + (normalized.includes(effectiveKeyword) ? 3 : 0);
      }, 0);

      return { ...category, score };
    })
    .filter((category) => category.score > 0)
    .sort((a, b) => b.score - a.score);
};

const buildActivityAnswer = () => {
  return [
    "🌿 Aktiviteler",
    "",
    "🚲 Bisiklet",
    "Ücretsiz",
    "",
    "🐪 Hayvan İzleme",
    "Ücretsiz",
    "",
    "🌳 Yellow Wood Play Park",
    "Ücretsiz",
    "",
    "🏀 Basketball",
    "Ücretsiz",
    "Kendi ekipmanınızı getirmeniz gerekiyor.",
    "",
    "🏏 Cricket",
    "Ücretsiz",
    "Kendi ekipmanınızı getirmeniz gerekiyor.",
    "",
    "🏐 Beach Volleyball",
    "Ücretsiz",
    "Kendi ekipmanınızı getirmeniz gerekiyor.",
    "",
    "⛳ Mini Golf",
    "Ücretsiz",
    "Kendi ekipmanınızı getirmeniz gerekiyor.",
    "",
    "🏰 Jumping Castle",
    "Ücretsiz",
    "",
    "🥕 Animal Feed",
    "ZAR 30",
    "",
    "🚜 OX Wagon Tour",
    "Yetişkin: ZAR 60",
    "Çocuk: ZAR 50",
    "3 yaş altı: Ücretsiz",
  ].join("\n");
};

const buildFamilyAnswer = () => {
  return [
    "👨‍👩‍👧‍👦 Aile İçin Öneriler",
    "",
    "1. 🌳 Yellow Wood Play Park",
    "Çocuklar için ücretsiz.",
    "",
    "2. 🐾 Animal Viewing",
    "Hayvanları görebilirsiniz. Ücretsiz.",
    "",
    "3. 🚲 Bike Riding",
    "Ücretsiz.",
    "",
    "4. 🏰 Jumping Castle",
    "Ücretsiz.",
    "",
    "5. 🥕 Animal Feed",
    "Hayvanları beslemek için ZAR 30.",
    "",
    "6. 🚜 OX Wagon Tour",
    "Yetişkin: ZAR 60",
    "Çocuk: ZAR 50",
    "3 yaş altı: Ücretsiz.",
    "",
    "🧺 Piknik için",
    "",
    "Braai Area",
    "ZAR 350",
    "",
    "Grass Area",
    "ZAR 5,500",
    "Giriş ücreti dahil.",
    "",
    "Ottoman Corner",
    "ZAR 1,500",
    "Giriş ücreti hariç.",
  ].join("\n");
};

const buildPicnicAnswer = () => {
  const picnicDetails = [
    chamlijaKnowledge.picnicAreas.braai,
    chamlijaKnowledge.picnicAreas.ottoman,
    chamlijaKnowledge.picnicAreas.grass,
    ...chamlijaKnowledge.picnicAreas.extraItems,
  ].join(" ");

  return `Yes 😊 picnic options include ${picnicDetails}`;
};

const buildOpeningAnswer = (question: string) => {
  const normalized = normalize(question);

  if (containsAny(normalized, ["monday", "pazartesi"])) {
    return "Pazartesi günü tam gün kapalıyız. Bu yüzden Pazartesi günü ziyaret edemiyoruz.";
  }

  if (containsAny(normalized, ["sunday", "pazar"])) {
    return "Evet 😊 Pazar günleri 09:00 – 18:00 arasında açıkız.";
  }

  if (containsAny(normalized, ["today", "bugün"])) {
    return getOpeningStatus(new Date());
  }

  return chamlijaKnowledge.openingHours.summary;
};

const buildLocationAnswer = () => {
  return [
    "📍 Chamlija Konumu",
    "",
    "Chamlija'ya ulaşmak için aşağıdaki butona tıklayın:",
  ].join("\n");
};

const formatFacts = (facts: string[]) => facts.join(" ");

const getSpecificServicePriceReply = (question: string): string | null => {
  const normalized = normalize(question);

  if (containsAny(normalized, ["basketball", "basketbol"])) {
    return "Basketball: FREE (bring your own equipment).";
  }

  if (containsAny(normalized, ["bike riding", "bisiklet", "bisiklet sürme", "cycling"])) {
    return "Bike Riding: FREE.";
  }

  if (containsAny(normalized, ["animal viewing", "hayvan izleme", "animal", "hayvan"])) {
    return "Animal Viewing: FREE.";
  }

  if (containsAny(normalized, ["yellow wood play park", "yellow wood", "oyun parkı"])) {
    return "Yellow Wood Play Park: FREE.";
  }

  if (containsAny(normalized, ["jumping castle", "jumping castle", "zıplama kalesi", "ziplama kalesi"])) {
    return "Jumping Castle: FREE.";
  }

  if (containsAny(normalized, ["cricket", "kriket"])) {
    return "Cricket: FREE (bring your own equipment).";
  }

  if (containsAny(normalized, ["beach volleyball", "beach voleybol", "voleybol"])) {
    return "Beach Volleyball: FREE (bring your own equipment).";
  }

  if (containsAny(normalized, ["mini golf", "mini golf", "minigolf"])) {
    return "Mini Golf: FREE (bring your own equipment).";
  }

  if (containsAny(normalized, ["braai", "piknik"])) {
    return "Braai Area: ZAR 350.";
  }

  if (containsAny(normalized, ["grass area", "çimen alan"])) {
    return "Grass Area: ZAR 5,500 and entrance is included.";
  }

  if (containsAny(normalized, ["ottoman", "ottoman corner"])) {
    return "Ottoman Corner: ZAR 1,500. Entrance fee excluded.";
  }

  if (containsAny(normalized, ["golf cart", "golf arabası"])) {
    return "Golf Cart – 4 Seater with Driver: ZAR 2,000.";
  }

  if (containsAny(normalized, ["ox wagon", "ox wagon"])) {
    return "OX Wagon Tour: Adult ZAR 60, Child ZAR 50, under 3 FREE.";
  }

  if (containsAny(normalized, ["animal feed", "hayvan yemi"])) {
    return "Animal Feed: ZAR 30.";
  }

  if (containsAny(normalized, ["barn hall", "barn hall"])) {
    return "The Barn Hall: ZAR 35,000. Entrance fee included. A 10% non-refundable deposit is required, and full payment is due one month before the booking date.";
  }

  if (containsAny(normalized, ["white swan", "white swan pool"])) {
    return "White Swan & Heart Shaped Pool: ZAR 2,500. Entrance fee excluded.";
  }

  if (containsAny(normalized, ["amphitheater", "amfitiyatro"])) {
    return "Amphitheater: ZAR 3,000. Entrance fee excluded.";
  }

  if (containsAny(normalized, ["photo shoot", "fotoğraf çekimi", "fotograf cekimi"])) {
    return "Photo Shoot: All day ZAR 1,200 or 0–4 hours ZAR 600.";
  }

  if (containsAny(normalized, ["tent", "çadır", "cadir"])) {
    return "Tent options: Pangola Tent 3 × 3 m: ZAR 100; Pangola Tent 5 × 10 m: ZAR 2,500; Frame Tent 6 × 9 m: ZAR 2,500; Frame Tent 5 × 15 m: ZAR 4,000; Frame Tent 9 × 16 m: ZAR 5,500.";
  }

  if (containsAny(normalized, ["entrance", "giriş", "adult", "yetişkin", "child", "çocuk"])) {
    return "Adult: ZAR 50. Child: ZAR 25.";
  }

  return null;
};

const buildFullPriceList = () => [
  "🎟️ Giriş Ücreti",
  "",
  "Yetişkin: ZAR 50",
  "Çocuk: ZAR 25",
  "",
  "---",
  "",
  "🧺 Piknik & Alanlar",
  "",
  "Braai Area: ZAR 350",
  "",
  "Ottoman Corner: ZAR 1,500",
  "Giriş ücreti dahil değildir.",
  "",
  "Grass Area: ZAR 5,500",
  "Giriş ücreti dahildir.",
  "",
  "Grass Area with Tent (9 × 16 m): ZAR 10,000",
  "",
  "---",
  "",
  "⛺ Çadırlar",
  "",
  "Pangola Tent (3 × 3 m): ZAR 100",
  "",
  "Pangola Tent (5 × 10 m): ZAR 2,500",
  "",
  "Frame Tent (6 × 9 m): ZAR 2,500",
  "",
  "Frame Tent (5 × 15 m): ZAR 4,000",
  "",
  "Frame Tent (9 × 16 m): ZAR 5,500",
  "",
  "---",
  "",
  "🎉 Etkinlik & Fonksiyon Alanları",
  "",
  "White Swan & Heart Shaped Pool: ZAR 2,500",
  "Giriş ücreti dahil değildir.",
  "",
  "Amphitheater: ZAR 3,000",
  "Giriş ücreti dahil değildir.",
  "",
  "The Barn Hall: ZAR 35,000",
  "Giriş ücreti dahildir.",
  "",
  "Photo Shoot:",
  "All day: ZAR 1,200",
  "0–4 hours: ZAR 600",
  "",
  "The Barn Hall ödeme koşulu:",
  "Rezervasyon sırasında %10 iade edilmeyen depozito gereklidir.",
  "Tam ödeme, rezervasyon tarihinden 1 ay önce yapılmalıdır.",
  "",
  "---",
  "",
  "🪑 Ekstra Ürünler",
  "",
  "6-Seater Picnic Table / Bench: ZAR 70",
  "",
  "Plastic Table: ZAR 60",
  "",
  "Plastic Chair: ZAR 20",
  "",
  "---",
  "",
  "🚙 Ulaşım",
  "",
  "Golf Cart – 4 Seater with Driver: ZAR 2,000",
  "",
  "OX Wagon Tour:",
  "Adult: ZAR 60",
  "Child: ZAR 50",
  "Under 3 years old: FREE",
  "",
  "---",
  "",
  "🐾 Hayvanlar",
  "",
  "Animal Feed: ZAR 30",
  "",
  "---",
  "",
  "🏀 Ücretsiz Aktiviteler",
  "",
  "Bike Riding: FREE",
  "",
  "Animal Viewing: FREE",
  "",
  "Yellow Wood Play Park: FREE",
  "",
  "Cricket: FREE",
  "Kendi ekipmanınızı getirmeniz gerekmektedir.",
  "",
  "Basketball: FREE",
  "Kendi ekipmanınızı getirmeniz gerekmektedir.",
  "",
  "Beach Volleyball: FREE",
  "Kendi ekipmanınızı getirmeniz gerekmektedir.",
  "",
  "Mini Golf: FREE",
  "Kendi ekipmanınızı getirmeniz gerekmektedir.",
  "",
  "Jumping Castle: FREE",
].join("\n");

const isSpecificServicePriceQuestion = (normalized: string) => {
  const specificServices = [
    "basketball",
    "basketbol",
    "cricket",
    "kriket",
    "beach volleyball",
    "beach voleybol",
    "mini golf",
    "mini golf",
    "jumping castle",
    "zıplama kalesi",
    "ziplamakalesi",
    "bike riding",
    "bisiklet sürme",
    "bisiklet",
    "animal viewing",
    "hayvan izleme",
    "yellow wood play park",
    "yellow wood",
    "braai",
    "grass area",
    "çimen alan",
    "ottoman",
    "golf cart",
    "golf arabası",
    "ox wagon",
    "ox wagon",
    "animal feed",
    "hayvan yemi",
    "barn hall",
    "white swan",
    "white swan pool",
    "amphitheater",
    "amfitiyatro",
    "photo shoot",
    "fotoğraf çekimi",
    "fotograf cekimi",
    "pangola",
    "frame tent",
    "çatı çadır",
    "cati cadir",
    "tent",
    "çadır",
    "cadir",
    "entrance",
    "giriş",
    "adult",
    "child",
    "çocuk",
    "yetişkin",
    "piknik",
    "activity",
    "aktivite",
  ];

  return containsAny(normalized, specificServices);
};

const isGeneralPriceQuestion = (normalized: string) => {
  const priceWords = [
    "price",
    "prices",
    "fiyat",
    "fiyatlar",
    "ücret",
    "ücretler",
    "fee",
    "fees",
    "cost",
    "price list",
    "fiyat listesi",
    "what are your prices",
    "how much does everything cost",
    "how much does it cost",
    "ne kadar",
    "bütün fiyatlar",
    "tum fiyatlar",
    "everything",
    "all prices",
    "fiyat listesi",
  ];

  if (isSpecificServicePriceQuestion(normalized)) {
    return false;
  }

  return containsAny(normalized, priceWords);
};

export function extractConversationContextFromMessage(
  input: string,
  currentContext: ChatConversationContext = { previousMessages: [] },
): ChatConversationContext {
  const previousMessages = [...currentContext.previousMessages, input].slice(-8);
  const extracted = extractCounts(input);

  return {
    adults: extracted.adults ?? currentContext.adults,
    children: extracted.children ?? currentContext.children,
    previousMessages,
    lastTopic: input,
  };
}

export function getChamlijaKnowledgeReply(
  input: string,
  context: ChatConversationContext = { previousMessages: [] },
  _systemPrompt?: string,
): string {
  const question = input.trim();
  const normalized = normalize(question);
  const { adults, children } = context;

  if (!question) {
    return "Hello! I can help with Chamlija entry fees, opening hours, activities, animals, location and other verified Chamlija information.";
  }

  const casualReply = getCasualReply(normalized);
  if (casualReply) {
    return casualReply;
  }

  const specificServiceReply = getSpecificServicePriceReply(question);
  if (specificServiceReply) {
    return specificServiceReply;
  }

  // Check for family-related queries early, before price calculations
  if (containsAny(normalized, ["aile", "family", "ailemle", "çocuk", "child", "children", "kids", "with family", "for family", "aile icin", "aile için", "doğum", "birthday"])) {
    return buildFamilyAnswer();
  }

  // Check for activity queries
  if (containsAny(normalized, ["activity", "activities", "fun", "what can we do", "ne yapabiliriz", "aktivite", "aktiviteler"])) {
    return buildActivityAnswer();
  }

  if (isGeneralPriceQuestion(normalized)) {
    return buildFullPriceList();
  }

  const hasAdultCount = adults !== undefined || containsAny(normalized, ["adult", "adults", "yetişkin", "yetişkinler"]);
  const hasChildCount = children !== undefined || containsAny(normalized, ["child", "children", "çocuk", "çocuklar"]);

  if ((containsAny(normalized, ["giriş", "entry", "entrance", "price", "fiyat", "ücret"]) || containsAny(normalized, ["ne kadar", "how much"])) && (hasAdultCount || hasChildCount || adults !== undefined || children !== undefined)) {
    const adultCount = adults ?? extractCounts(question).adults ?? 0;
    const childCount = children ?? extractCounts(question).children ?? 0;
    const total = adultCount * 50 + childCount * 25;

    return `Giriş ücreti için ${adultCount} yetişkin × ZAR 50 = ZAR ${adultCount * 50} ve ${childCount} çocuk × ZAR 25 = ZAR ${childCount * 25}. Toplam: ZAR ${total}.`;
  }

  if (containsAny(normalized, ["adult", "yetişkin"]) && containsAny(normalized, ["child", "çocuk"])) {
    return "Adult: ZAR 50 per person. Child: ZAR 25 per person.";
  }

  if (containsAny(normalized, ["adult", "yetişkin"]) && containsAny(normalized, ["price", "fiyat", "fee", "ücret"])) {
    return "Adult entry fee is ZAR 50 per person. Child entry fee is ZAR 25 per person.";
  }

  if (containsAny(normalized, ["child", "çocuk"]) && containsAny(normalized, ["price", "fiyat", "fee", "ücret"])) {
    return "Child entry fee is ZAR 25 per person.";
  }

  if (containsAny(normalized, ["alcohol", "alkol"])) {
    return chamlijaKnowledge.rules.alcohol;
  }

  if (containsAny(normalized, ["music", "müzik"])) {
    return chamlijaKnowledge.rules.music;
  }

  if (containsAny(normalized, ["instagram", "insta", "social media", "sosyal medya"])) {
    return "📸 Instagram\n\n@buyukchamlija";
  }

  if (containsAny(normalized, ["location", "where are you", "get there", "how can i get there", "konum", "nerede", "adres"])) {
    return buildLocationAnswer();
  }

  if (containsAny(normalized, ["reserv", "booking", "reserve", "rez", "rezervasyonu", "rezerve", "boka"])) {
    return "Rezervasyon için lütfen 'Rezerv et' butonuna tıklayın ve booking sayfasına yönlendirileceksiniz. 🎫";
  }

  if (containsAny(normalized, ["animal", "hayvan"])) {
    return chamlijaKnowledge.animals.summary;
  }

  if (containsAny(normalized, ["open", "hours", "closed", "açık", "kapalı", "çalışma"])) {
    return buildOpeningAnswer(question);
  }

  if (containsAny(normalized, ["picnic", "piknik", "braai", "grass area", "ottoman", "table"])) {
    return buildPicnicAnswer();
  }

  if (containsAny(normalized, ["free", "ücretsiz", "0 zar"])) {
    return `Free activities at Chamlija include ${chamlijaKnowledge.activities.free.join(", ")}.`;
  }

  if (containsAny(normalized, ["ox wagon", "wagon"])) {
    return "The OX Wagon Tour is Adult ZAR 60, Child ZAR 50, and children under 3 are free.";
  }

  if (containsAny(normalized, ["animal feed", "feed"])) {
    return "Animal Feed is ZAR 30.";
  }

  if (containsAny(normalized, ["budget", "bütçe", "cheap", "affordable"])) {
    return "Tabii 😊 Bütçeyi düşük tutmak isterseniz ücretsiz aktivitelerden yararlanabilirsiniz. Bike Riding, Animal Viewing, Yellow Wood Play Park ve Jumping Castle ücretsiz. Giriş ücreti yetişkinler için ZAR 50, çocuklar için ZAR 25.";
  }



  if (containsAny(normalized, ["compare", "karşılaştır", "braai", "grass area", "grass area with tent"])) {
    return [
      "🧺 Piknik Karşılaştırması",
      "",
      "Braai Area",
      "ZAR 350",
      "",
      "Grass Area",
      "ZAR 5,500",
      "Giriş ücreti dahil.",
      "",
      "Eğer daha uygun fiyatlı bir seçenek isterseniz Braai Area daha ekonomik olur.",
      "Daha geniş ve giriş dahil bir alan arıyorsanız Grass Area daha uygun olur.",
    ].join("\n");
  }

  const relevantCategories = chooseRelevantCategories(question);
  if (relevantCategories.length === 0) {
    return chamlijaKnowledge.fallback;
  }

  const selectedFacts: string[] = [];

  relevantCategories.forEach((category) => {
    if (category.id === "entrance") {
      selectedFacts.push(chamlijaKnowledge.entrance.summary);
    }
    if (category.id === "rules") {
      selectedFacts.push(chamlijaKnowledge.rules.alcohol, chamlijaKnowledge.rules.music);
    }
    if (category.id === "location") {
      selectedFacts.push(chamlijaKnowledge.contact.location);
    }
    if (category.id === "instagram") {
      selectedFacts.push(chamlijaKnowledge.contact.instagram);
    }
    if (category.id === "animals") {
      selectedFacts.push(chamlijaKnowledge.animals.summary);
    }
    if (category.id === "openingHours") {
      selectedFacts.push(chamlijaKnowledge.openingHours.summary);
    }
    if (category.id === "activities") {
      selectedFacts.push(buildActivityAnswer());
    }
    if (category.id === "picnic") {
      selectedFacts.push(buildPicnicAnswer());
    }
    if (category.id === "events") {
      selectedFacts.push(chamlijaKnowledge.events.whiteSwan, chamlijaKnowledge.events.amphitheater, chamlijaKnowledge.events.barnHall);
    }
    if (category.id === "free") {
      selectedFacts.push(`Free activities include ${chamlijaKnowledge.activities.free.join(", ")}.`);
    }
    if (category.id === "transport") {
      selectedFacts.push(chamlijaKnowledge.transport.golfCart, chamlijaKnowledge.transport.oxWagon);
    }
    if (category.id === "tents") {
      selectedFacts.push(
        chamlijaKnowledge.tents.pangola3x3,
        chamlijaKnowledge.tents.pangola5x10,
        chamlijaKnowledge.tents.frame6x9,
        chamlijaKnowledge.tents.frame5x15,
        chamlijaKnowledge.tents.frame9x16,
        chamlijaKnowledge.tents.grassWithTent,
      );
    }
    if (category.id === "food") {
      selectedFacts.push("Animal Feed: ZAR 30.");
    }
  });

  const deduped = [...new Set(selectedFacts)];
  if (deduped.length === 0) return chamlijaKnowledge.fallback;

  return formatFacts(deduped.slice(0, 3));
}
