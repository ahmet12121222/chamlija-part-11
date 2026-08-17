/**
 * ADVANCED PLAN MY DAY SYSTEM
 *
 * Generates truly dynamic, personalized itineraries based on visitor profile.
 * Different activities and patterns for different group types and preferences.
 */

export type ActivityDefinition = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  duration: number; // minutes
  price: number | null; // ZAR, null for free
  pricePerChild?: number;
  requiresEquipment?: string; // equipment note
  tags: string[]; // "free", "family", "sports", "nature", "animals", "paid", etc.
  suitable: {
    families?: boolean;
    couples?: boolean;
    friends?: boolean;
    solo?: boolean;
    children?: boolean;
    ages?: { min?: number; max?: number };
  };
};

const ACTIVITIES: Record<string, ActivityDefinition> = {
  animalViewing: {
    id: "animal-viewing",
    title: "Animal Viewing",
    emoji: "🐐",
    description: "Explore and observe the animals around Chamlija.",
    duration: 45,
    price: null,
    tags: ["free", "family", "nature", "animals"],
    suitable: { families: true, couples: true, friends: true, solo: true, children: true },
  },
  animalFeeding: {
    id: "animal-feeding",
    title: "Animal Feeding",
    emoji: "🥕",
    description: "Interactive experience feeding animals.",
    duration: 30,
    price: 30,
    tags: ["paid", "family", "animals", "interactive"],
    suitable: { families: true, children: true, friends: true },
  },
  cycling: {
    id: "cycling",
    title: "Cycling",
    emoji: "🚲",
    description: "Explore the grounds on two wheels.",
    duration: 60,
    price: null,
    requiresEquipment: "bring your own bicycle",
    tags: ["free", "sports", "active", "nature"],
    suitable: { families: true, couples: true, friends: true, solo: true, children: true },
  },
  yellowWoodPlayPark: {
    id: "yellow-wood-play-park",
    title: "Yellow Wood Play Park",
    emoji: "🌳",
    description: "Fun outdoor playground for children.",
    duration: 45,
    price: null,
    tags: ["free", "family", "kids", "play"],
    suitable: { families: true, children: true },
  },
  basketball: {
    id: "basketball",
    title: "Basketball",
    emoji: "🏀",
    description: "Open court for friendly games.",
    duration: 45,
    price: null,
    requiresEquipment: "bring your own equipment",
    tags: ["free", "sports", "active", "group"],
    suitable: { friends: true, solo: true },
  },
  cricket: {
    id: "cricket",
    title: "Cricket",
    emoji: "🏏",
    description: "Relaxed sports option for groups.",
    duration: 60,
    price: null,
    requiresEquipment: "bring your own equipment",
    tags: ["free", "sports", "active", "group"],
    suitable: { friends: true, solo: true },
  },
  beachVolleyball: {
    id: "beach-volleyball",
    title: "Beach Volleyball",
    emoji: "🏐",
    description: "Fun outdoor game with a social feel.",
    duration: 45,
    price: null,
    requiresEquipment: "bring your own equipment",
    tags: ["free", "sports", "active", "social"],
    suitable: { friends: true, couples: true },
  },
  miniGolf: {
    id: "mini-golf",
    title: "Mini Golf",
    emoji: "⛳",
    description: "Casual activity and a nice break.",
    duration: 45,
    price: null,
    requiresEquipment: "bring your own equipment",
    tags: ["free", "casual", "fun"],
    suitable: { families: true, couples: true, friends: true, solo: true, children: true },
  },
  jumpingCastle: {
    id: "jumping-castle",
    title: "Jumping Castle",
    emoji: "🏰",
    description: "Fun for energetic children.",
    duration: 30,
    price: null,
    tags: ["free", "family", "kids", "play"],
    suitable: { families: true, children: true },
  },
  waterPlayArea: {
    id: "water-play-area",
    title: "Water Play Area",
    emoji: "💧",
    description: "Cool off with outdoor water fun.",
    duration: 45,
    price: null,
    tags: ["free", "family", "kids", "refreshing"],
    suitable: { families: true, children: true, friends: true },
  },
  oxWagonTour: {
    id: "ox-wagon-tour",
    title: "OX Wagon Tour",
    emoji: "🚜",
    description: "Relaxing guided experience through the grounds.",
    duration: 60,
    price: 60,
    pricePerChild: 50,
    tags: ["paid", "family", "experience", "relaxing"],
    suitable: { families: true, couples: true, friends: true, solo: true, children: true },
  },
  nature: {
    id: "nature",
    title: "Nature & Open Areas",
    emoji: "🌿",
    description: "Walk, explore, and enjoy the landscape.",
    duration: 45,
    price: null,
    tags: ["free", "nature", "relaxing", "peaceful"],
    suitable: { families: true, couples: true, friends: true, solo: true, children: true },
  },
  picnicBreak: {
    id: "picnic-break",
    title: "Picnic Break",
    emoji: "🧺",
    description: "Rest and enjoy a meal or snacks.",
    duration: 60,
    price: null,
    tags: ["free", "social", "meal"],
    suitable: { families: true, couples: true, friends: true, solo: true },
  },
};

export type TimelineSlot = {
  time: string;
  title: string;
  emoji: string;
  description: string;
  duration: number;
  price?: string;
  badge?: "Free" | "Paid" | "Break";
  note?: string;
};

export function buildDynamicItinerary(profile: {
  groupType: "family" | "couple" | "friends" | "solo" | "group";
  adults?: number;
  children?: number;
  childrenAges?: number[];
  stayHours?: number;
  wantsRelaxing?: boolean;
  wantsActive?: boolean;
  wantsAnimals?: boolean;
  wantsSports?: boolean;
  wantsPicnic?: boolean;
  wantsPaid?: boolean;
  budgetFriendly?: boolean;
  arrivalTime?: "morning" | "afternoon";
}): TimelineSlot[] {
  const stayHours = profile.stayHours || 6;
  const startHour = profile.arrivalTime === "afternoon" ? 14 : 9;
  const availableMinutes = stayHours * 60;

  // Select activities based on profile
  const selectedActivities = selectActivitiesForProfile(profile);

  // Build itinerary with proper timing
  const slots: TimelineSlot[] = [];
  let currentMinute = startHour * 60;

  // Arrival
  slots.push({
    time: formatTime(currentMinute),
    title: "Arrival & Entry",
    emoji: "👋",
    description: "Welcome to Chamlija",
    duration: 0,
    badge: "Break",
  });

  currentMinute += 15; // 15 min to entry

  // Add activities with varied timing
  let remainingMinutes = availableMinutes - 15;

  // Strategy: longer stays get more activities, shorter stays get concentrated experience
  const activityCount =
    stayHours <= 3 ? 2 : stayHours <= 5 ? 4 : stayHours <= 7 ? 5 : 6;

  // Shuffle but weight distribution
  for (let i = 0; i < Math.min(activityCount, selectedActivities.length); i++) {
    const activity = selectedActivities[i];
    if (currentMinute - startHour * 60 >= availableMinutes) break;

    slots.push({
      time: formatTime(currentMinute),
      title: activity.title,
      emoji: activity.emoji,
      description: activity.description,
      duration: activity.duration,
      price: activity.price ? `ZAR ${activity.price}` : "FREE",
      badge: activity.price ? "Paid" : "Free",
      note: activity.requiresEquipment ? `(${activity.requiresEquipment})` : undefined,
    });

    currentMinute += activity.duration;
  }

  // Add a picnic/meal break if reasonable
  if (
    stayHours >= 4 &&
    remainingMinutes > 90 &&
    profile.wantsPicnic !== false
  ) {
    slots.push({
      time: formatTime(currentMinute),
      title: "Picnic / Meal Break",
      emoji: "🧺",
      description: "Rest and enjoy a meal or snacks",
      duration: 60,
      badge: "Break",
      price: "Optional",
    });
    currentMinute += 60;
  }

  // Add closing relaxation
  if (currentMinute - startHour * 60 < availableMinutes) {
    slots.push({
      time: formatTime(currentMinute),
      title: "Nature & Relaxation",
      emoji: "🌿",
      description: "Unwind and take it easy",
      duration: Math.max(15, availableMinutes - (currentMinute - startHour * 60)),
      badge: "Free",
      price: "FREE",
    });
  }

  return slots;
}

function selectActivitiesForProfile(profile: {
  groupType: "family" | "couple" | "friends" | "solo" | "group";
  wantsRelaxing?: boolean;
  wantsActive?: boolean;
  wantsAnimals?: boolean;
  wantsSports?: boolean;
  wantsPicnic?: boolean;
  wantsPaid?: boolean;
  budgetFriendly?: boolean;
}): ActivityDefinition[] {
  const activities: ActivityDefinition[] = [];

  // Determine suitable activities based on profile
  const activityList = Object.values(ACTIVITIES);

  // Filter by group type
  const groupSuitable = activityList.filter((a) => {
    const suitable = a.suitable[profile.groupType as keyof typeof a.suitable];
    return suitable !== false;
  });

  // Filter by preferences
  let filtered = groupSuitable.filter((a) => {
    if (profile.wantsActive && a.tags.includes("active")) return true;
    if (profile.wantsAnimals && a.tags.includes("animals")) return true;
    if (profile.wantsSports && a.tags.includes("sports")) return true;
    if (profile.wantsRelaxing && a.tags.includes("relaxing")) return true;
    if (profile.budgetFriendly && a.price === null) return true;
    if (!profile.wantsActive && !profile.wantsAnimals && !profile.wantsSports && !profile.wantsRelaxing) {
      return true; // No preference, include all
    }
    return false;
  });

  // Ensure good variety
  if (filtered.length === 0) {
    filtered = groupSuitable; // Fallback to group-suitable activities
  }

  // Prioritize based on type
  if (profile.groupType === "family") {
    const familyActivities = filtered
      .filter((a) => a.suitable.families)
      .sort((a, b) => {
        if (a.tags.includes("kids")) return -1;
        if (b.tags.includes("kids")) return 1;
        return 0;
      });
    return familyActivities.slice(0, 6);
  }

  if (profile.groupType === "couple") {
    const coupleActivities = filtered
      .filter((a) => a.suitable.couples)
      .sort((a, b) => {
        if (a.tags.includes("romantic") || a.tags.includes("relaxing"))
          return -1;
        return 0;
      });
    return coupleActivities.slice(0, 5);
  }

  if (profile.groupType === "friends") {
    const friendsActivities = filtered
      .filter((a) => a.suitable.friends)
      .sort((a, b) => {
        if (a.tags.includes("social") || a.tags.includes("sports"))
          return -1;
        return 0;
      });
    return friendsActivities.slice(0, 6);
  }

  if (profile.groupType === "solo") {
    const soloActivities = filtered.filter((a) => a.suitable.solo);
    return soloActivities.slice(0, 5);
  }

  return filtered.slice(0, 6);
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function estimateTotalCost(profile: {
  adults?: number;
  children?: number;
  activities: ActivityDefinition[];
}): { entry: number; activities: number; total: number } {
  const adults = profile.adults || 0;
  const children = profile.children || 0;

  const entry = adults * 50 + children * 25;
  const activitiesCost = profile.activities.reduce((sum, activity) => {
    if (!activity.price) return sum;
    return sum + activity.price * Math.max(1, adults);
  }, 0);

  return {
    entry,
    activities: activitiesCost,
    total: entry + activitiesCost,
  };
}

export type PlanGroupType = "family" | "couple" | "friends" | "solo";
export type PlanPreference =
  | "nature"
  | "animals"
  | "cycling"
  | "sports"
  | "games"
  | "picnic"
  | "family"
  | "romantic"
  | "photos"
  | "adventure";

export type PlannerPlanState = {
  groupType: PlanGroupType;
  adults: number;
  children: number;
  childrenAgeRanges: string[];
  preferences: PlanPreference[];
  chosenActivities: string[];
  arrivalTime: string;
};

export const PLAN_ACTIVITY_OPTIONS = [
  { id: "animal-viewing", title: "Animal Watching", emoji: "🐐", description: "Animal viewing around Chamlija", price: null, tags: ["animals", "nature", "family"] },
  { id: "animal-feeding", title: "Animal Feeding", emoji: "🥕", description: "Interactive animal feeding", price: 30, tags: ["animals", "family"] },
  { id: "yellow-wood-play-park", title: "Yellow Wood Play Park", emoji: "🌳", description: "Play park for children and families", price: null, tags: ["family", "games"] },
  { id: "cycling", title: "Cycling", emoji: "🚲", description: "Bring your own bicycle", price: null, requiresEquipment: "bring your own bicycle", tags: ["cycling", "adventure", "nature"] },
  { id: "basketball", title: "Basketball", emoji: "🏀", description: "Open court and active play", price: null, requiresEquipment: "bring your own equipment", tags: ["sports", "games", "adventure"] },
  { id: "mini-golf", title: "Mini Golf", emoji: "⛳", description: "Casual and easy-going fun", price: null, requiresEquipment: "bring your own equipment", tags: ["games", "sports"] },
  { id: "cricket", title: "Cricket", emoji: "🏏", description: "Sport option for active groups", price: null, requiresEquipment: "bring your own equipment", tags: ["sports", "games"] },
  { id: "jumping-castle", title: "Jumping Castle", emoji: "🏰", description: "Fun for children and energetic families", price: null, tags: ["games", "family"] },
  { id: "ox-wagon-tour", title: "OX Wagon Tour", emoji: "🚜", description: "Guided sightseeing through the grounds", price: 60, tags: ["nature", "family", "adventure"] },
  { id: "picnic-break", title: "Picnic & Braai", emoji: "🧺", description: "Choose your picnic area or braai spot", price: null, tags: ["picnic", "family", "romantic"] },
  { id: "nature", title: "Nature & Open Areas", emoji: "🌿", description: "Explore the natural surroundings", price: null, tags: ["nature", "relaxing"] },
] as const;

export function getPlannerActivityOptions() {
  return PLAN_ACTIVITY_OPTIONS.map((item) => ({ ...item }));
}

export function getRecommendedPlanActivities(state: PlannerPlanState): string[] {
  const selected = state.preferences.length > 0 ? state.preferences : ["nature"];

  const map: Record<string, string[]> = {
    nature: ["nature", "animal-viewing", "picnic-break"],
    animals: ["animal-viewing", "animal-feeding", "nature"],
    cycling: ["cycling", "nature"],
    sports: ["basketball", "cricket", "mini-golf"],
    games: ["yellow-wood-play-park", "jumping-castle", "mini-golf"],
    picnic: ["picnic-break", "nature"],
    family: ["yellow-wood-play-park", "animal-viewing", "picnic-break", "jumping-castle"],
    romantic: ["nature", "picnic-break", "animal-viewing"],
    photos: ["nature", "animal-viewing", "picnic-break"],
    adventure: ["cycling", "ox-wagon-tour", "basketball", "cricket"],
  };

  const ids = new Set<string>();
  for (const preference of selected) {
    for (const activityId of map[preference] ?? []) {
      ids.add(activityId);
    }
  }

  if (state.groupType === "family") {
    ids.add("yellow-wood-play-park");
    ids.add("animal-viewing");
    ids.add("jumping-castle");
  }

  if (state.groupType === "couple") {
    ids.add("nature");
    ids.add("picnic-break");
    ids.add("animal-viewing");
  }

  if (state.groupType === "friends") {
    ids.add("basketball");
    ids.add("cricket");
    ids.add("nature");
  }

  if (state.groupType === "solo") {
    ids.add("nature");
    ids.add("animal-viewing");
  }

  if (state.children > 0) {
    ids.add("yellow-wood-play-park");
    ids.add("jumping-castle");
  }

  return Array.from(ids);
}

export function getPlanOpeningHoursSummary(): string {
  return "Monday — Closed | Tuesday–Friday — 10:00–18:00 | Saturday–Sunday — 09:00–18:00";
}

export function generatePersonalizedPlan(state: PlannerPlanState): {
  slots: TimelineSlot[];
  cost: number;
  summary: string;
  reason: string;
} {
  const normalized = { ...state, adults: Math.max(1, state.adults), children: Math.max(0, state.children) };
  const arrivalHour = Number.parseInt(normalized.arrivalTime.split(":")[0], 10) || 9;
  const arrivalTime: "morning" | "afternoon" = arrivalHour >= 13 ? "afternoon" : "morning";

  const profile = {
    groupType: normalized.groupType,
    adults: normalized.adults,
    children: normalized.children,
    childrenAges: normalized.childrenAgeRanges.map((value) => Number(value.replace(/[^\d]/g, ""))).filter((value) => !Number.isNaN(value)),
    stayHours: Math.max(3, Math.min(7, Math.max(3, Math.min(7, 18 - arrivalHour)))),
    wantsRelaxing: normalized.preferences.includes("nature") || normalized.preferences.includes("romantic") || normalized.preferences.includes("family"),
    wantsActive: normalized.preferences.includes("cycling") || normalized.preferences.includes("sports") || normalized.preferences.includes("adventure"),
    wantsAnimals: normalized.preferences.includes("animals") || normalized.children > 0,
    wantsSports: normalized.preferences.includes("sports") || normalized.preferences.includes("adventure"),
    wantsPicnic: normalized.preferences.includes("picnic") || normalized.preferences.includes("family"),
    wantsPaid: normalized.preferences.includes("animals") || normalized.preferences.includes("adventure") || normalized.children > 0,
    budgetFriendly: normalized.preferences.includes("nature") || normalized.preferences.includes("family"),
    arrivalTime,
  };

  const preferredIds = getRecommendedPlanActivities(normalized);
  const preferredDefs = preferredIds
    .map((id) => Object.values(ACTIVITIES).find((activity) => activity.id === id))
    .filter((activity): activity is ActivityDefinition => !!activity);

  const slots = buildDynamicItinerary(profile)
    .filter((slot) => slot.title !== "Arrival & Entry")
    .slice(0, 6);

  const customSlots: TimelineSlot[] = slots.length > 0 ? slots.map((slot, index) => ({
    ...slot,
    time: index === 0 ? normalized.arrivalTime : formatTime((arrivalHour * 60) + (Number.parseInt(normalized.arrivalTime.split(":")[1], 10) || 0) + 30 * (index + 1)),
    badge: slot.badge ?? "Free",
  })) : preferredDefs.slice(0, 4).map((activity, index) => ({
    time: formatTime((arrivalHour * 60) + (index * 60) + 30),
    title: activity.title,
    emoji: activity.emoji,
    description: activity.description,
    duration: activity.duration,
    price: activity.price ? `ZAR ${activity.price}` : "FREE",
    badge: (activity.price ? "Paid" : "Free") as "Paid" | "Free",
    note: activity.requiresEquipment ? `(${activity.requiresEquipment})` : undefined,
  }));

  const cost = customSlots.reduce((sum, slot) => {
    if (!slot.price || slot.price === "FREE") return sum;
    const numeric = Number(slot.price.replace(/[^\d]/g, ""));
    return sum + numeric;
  }, 0);

  const ageSummary = normalized.childrenAgeRanges.length > 0 ? `Ages: ${normalized.childrenAgeRanges.join(", ")}` : normalized.children > 0 ? "Children included" : "No children";
  const reason = normalized.groupType === "family"
    ? `Because you're visiting with ${normalized.children} children, I prioritized family-friendly activities and short active sessions.`
    : normalized.groupType === "couple"
      ? "Since you're visiting as a couple, I created a more relaxed nature-focused itinerary with a relaxed picnic and scenic activities."
      : normalized.groupType === "friends"
        ? "You selected a group day, so I balanced social activities with active sports and downtime."
        : "I kept this plan relaxed and personalized for a solo visit with natural exploration and a light pace.";

  return {
    slots: customSlots,
    cost,
    summary: `${normalized.groupType.charAt(0).toUpperCase() + normalized.groupType.slice(1)} · ${normalized.adults + normalized.children} people · Arrival ${normalized.arrivalTime} · ${ageSummary}`,
    reason,
  };
}
