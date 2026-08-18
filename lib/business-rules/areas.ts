/**
 * Central area capacity configuration for Chamlija
 * This is the single source of truth for all area capacities
 * Used by: booking validation, UI display, capacity checks, AI knowledge
 */

export type AreaCapacity = {
  id?: string;
  name: string;
  maxCapacity: number;
  maxAdults?: number;
  maxChildren?: number;
  description?: string;
};

export const AREA_CAPACITIES: Record<string, AreaCapacity> = {
  barn: {
    name: "Barn",
    maxCapacity: 400,
    description: "The Barn Hall",
  },
  grass_area_next_to_barn: {
    name: "Grass area next to Barn",
    maxCapacity: 250,
    description: "Grass area adjacent to Barn",
  },
  ottoman_area: {
    name: "Ottoman Area",
    maxCapacity: 30,
    description: "Ottoman Corner",
  },
  boma: {
    name: "Boma Area",
    maxCapacity: 250, // 100 adults + 150 children combined
    maxAdults: 100,
    maxChildren: 150,
    description: "Boma Area with separate adult and child limits",
  },
  braai_unit_1: {
    name: "Braai Unit 1",
    maxCapacity: 15,
    maxAdults: 15,
    description: "Braai Area Unit 1",
  },
  braai_unit_2: {
    name: "Braai Unit 2",
    maxCapacity: 10,
    maxAdults: 10,
    description: "Braai Area Unit 2",
  },
  braai_unit_3: {
    name: "Braai Unit 3",
    maxCapacity: 15,
    maxAdults: 15,
    description: "Braai Area Unit 3",
  },
  braai_unit_4: {
    name: "Braai Unit 4",
    maxCapacity: 10,
    maxAdults: 10,
    description: "Braai Area Unit 4",
  },
  braai_unit_5: {
    name: "Braai Unit 5",
    maxCapacity: 10,
    maxAdults: 10,
    description: "Braai Area Unit 5",
  },
  braai_unit_6: {
    name: "Braai Unit 6",
    maxCapacity: 10,
    maxAdults: 10,
    description: "Braai Area Unit 6",
  },
  grass_park: {
    name: "Grass Park Areas",
    maxCapacity: 300,
    maxAdults: 300,
    description: "Grass Park for outdoor events",
  },
  theater: {
    name: "Theater Area",
    maxCapacity: 250, // 100 adults + 150 children combined
    maxAdults: 100,
    maxChildren: 150,
    description: "Theater Area with separate adult and child limits",
  },
};

/**
 * Get area capacity information by area name
 * Used by frontend and backend capacity validation
 */
export function getAreaCapacity(areaName: string): AreaCapacity | null {
  const normalized = areaName?.trim().toLowerCase() || "";

  // Direct lookup in predefined areas
  for (const area of Object.values(AREA_CAPACITIES)) {
    if (area.name.toLowerCase() === normalized) {
      return area;
    }
  }

  // Fuzzy match for common variations
  if (normalized.includes("barn")) return AREA_CAPACITIES.barn;
  if (normalized.includes("grass") && normalized.includes("barn")) return AREA_CAPACITIES.grass_area_next_to_barn;
  if (normalized.includes("ottoman")) return AREA_CAPACITIES.ottoman_area;
  if (normalized.includes("boma")) return AREA_CAPACITIES.boma;
  if (normalized.includes("braai")) {
    // Try to extract unit number
    const match = normalized.match(/unit\s*(\d)/i) || normalized.match(/(\d)\s*$/);
    if (match) {
      const unitNum = match[1];
      const key = `braai_unit_${unitNum}` as keyof typeof AREA_CAPACITIES;
      if (key in AREA_CAPACITIES) {
        return AREA_CAPACITIES[key];
      }
    }
    // Default first braai unit
    return AREA_CAPACITIES.braai_unit_1;
  }
  if (normalized.includes("grass") && normalized.includes("park")) return AREA_CAPACITIES.grass_park;
  if (normalized.includes("theater")) return AREA_CAPACITIES.theater;

  return null;
}

/**
 * Validate if a booking fits within area capacity
 */
export function validateAreaCapacity(
  areaName: string,
  adults: number,
  children: number,
  childrenUnder3: number = 0,
): { valid: boolean; message?: string } {
  const area = getAreaCapacity(areaName);

  if (!area) {
    return { valid: true }; // No capacity info found, allow booking
  }

  const totalGuests = adults + children + childrenUnder3;

  // Check areas with separate adult/child limits (Boma, Theater)
  if (area.maxAdults !== undefined && area.maxChildren !== undefined) {
    const totalChildren = children + childrenUnder3;

    if (adults > area.maxAdults) {
      return {
        valid: false,
        message: `This area can accommodate up to ${area.maxAdults} adults. You have ${adults} adults.`,
      };
    }

    if (totalChildren > area.maxChildren) {
      return {
        valid: false,
        message: `This area can accommodate up to ${area.maxChildren} children. You have ${totalChildren} children.`,
      };
    }

    return { valid: true };
  }

  // Check areas with only adult limit (Braai units, Grass Park)
  if (area.maxAdults !== undefined && area.maxAdults > 0) {
    if (adults > area.maxAdults) {
      return {
        valid: false,
        message: `This area can accommodate up to ${area.maxAdults} adults. You have ${adults} adults.`,
      };
    }

    return { valid: true };
  }

  // Check general capacity
  if (totalGuests > area.maxCapacity) {
    return {
      valid: false,
      message: `This area can accommodate up to ${area.maxCapacity} people. You have ${totalGuests} guests.`,
    };
  }

  return { valid: true };
}

/**
 * Get all areas that can accommodate a specific guest count
 */
export function findAreasForGuestCount(
  adults: number,
  children: number,
  childrenUnder3: number = 0,
): AreaCapacity[] {
  const totalGuests = adults + children + childrenUnder3;
  const totalChildren = children + childrenUnder3;

  return Object.values(AREA_CAPACITIES).filter((area) => {
    // For areas with separate adult/child limits
    if (area.maxAdults !== undefined && area.maxChildren !== undefined) {
      return adults <= area.maxAdults && totalChildren <= area.maxChildren;
    }

    // For areas with adult-only limits
    if (area.maxAdults !== undefined && area.maxAdults > 0) {
      return adults <= area.maxAdults;
    }

    // For general capacity
    return totalGuests <= area.maxCapacity;
  });
}

/**
 * Format area capacity for display
 */
export function formatAreaCapacity(area: AreaCapacity): string {
  if (area.maxAdults !== undefined && area.maxChildren !== undefined) {
    return `${area.maxAdults} adults / ${area.maxChildren} children`;
  }

  if (area.maxAdults !== undefined && area.maxAdults > 0) {
    return `${area.maxAdults} adults`;
  }

  return `${area.maxCapacity} people`;
}
