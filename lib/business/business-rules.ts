/**
 * CENTRAL BUSINESS RULES FOR CHAMLIJA
 *
 * Single source of truth for:
 * - Discount structure (date-based)
 * - Area capacities
 *
 * DO NOT hardcode these values elsewhere.
 * All pricing, booking, AI, and admin features must use these definitions.
 */

/**
 * DISCOUNT RULES - Date-based early booking discounts
 * Calculates discount % based on days between booking creation and event date.
 */

export type DiscountTier = {
  minDays: number; // Minimum days before event (inclusive)
  maxDays: number; // Maximum days before event (inclusive)
  percentage: number; // Discount percentage (0-100)
};

export const DISCOUNT_TIERS: DiscountTier[] = [
  {
    minDays: 30,
    maxDays: 999, // 30+ days before event
    percentage: 30,
  },
  {
    minDays: 15,
    maxDays: 29,
    percentage: 25,
  },
  {
    minDays: 8,
    maxDays: 14,
    percentage: 10,
  },
  {
    minDays: 0,
    maxDays: 7,
    percentage: 0,
  },
];

/**
 * Calculate discount percentage based on days between today and event date
 * @param eventDate - The booking's event date (YYYY-MM-DD)
 * @param bookingDate - The date the booking was created (YYYY-MM-DD). Defaults to today.
 * @returns Discount percentage (0-100)
 */
export function calculateDiscountPercentage(
  eventDate: string,
  bookingDate?: string
): number {
  const eventDateObj = new Date(`${eventDate}T00:00:00Z`);
  const bookingDateObj = new Date(`${bookingDate || new Date().toISOString().split("T")[0]}T00:00:00Z`);

  if (Number.isNaN(eventDateObj.getTime()) || Number.isNaN(bookingDateObj.getTime())) {
    return 0;
  }

  // Calculate days between booking date and event date
  const daysDifference = Math.floor(
    (eventDateObj.getTime() - bookingDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Find the matching tier
  const tier = DISCOUNT_TIERS.find(
    (t) => daysDifference >= t.minDays && daysDifference <= t.maxDays
  );

  return tier?.percentage ?? 0;
}

/**
 * Calculate discount amount and totals
 */
export function calculateDiscountedTotal(
  subtotal: number,
  discountPercentage: number
): { discountAmount: number; totalAfterDiscount: number } {
  const discountAmount = subtotal * (discountPercentage / 100);
  const totalAfterDiscount = subtotal - discountAmount;

  return {
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
    totalAfterDiscount: Math.round(totalAfterDiscount * 100) / 100,
  };
}

/**
 * AREA CAPACITIES - Maximum occupancy for each Chamlija area
 * These are the official capacity limits.
 */

export type AreaCapacityRule = {
  areaName: string; // Official area name from products table
  maxCapacity?: number; // Maximum total people (if no adult/child split)
  maxAdults?: number; // Maximum adults (if split capacity)
  maxChildren?: number; // Maximum children (if split capacity)
  description: string; // Human-readable description
};

export const AREA_CAPACITIES: AreaCapacityRule[] = [
  {
    areaName: "Barn",
    maxCapacity: 400,
    description: "Barn - maximum 400 people",
  },
  {
    areaName: "Grass area next to Barn",
    maxCapacity: 250,
    description: "Grass area next to Barn - maximum 250 people",
  },
  {
    areaName: "Ottoman Area",
    maxCapacity: 30,
    description: "Ottoman Area - maximum 30 people",
  },
  {
    areaName: "Boma Area",
    maxAdults: 100,
    maxChildren: 150,
    description: "Boma Area - maximum 100 adults / 150 children",
  },
  {
    areaName: "Braai Unit 1",
    maxAdults: 15,
    description: "Braai Unit 1 - maximum 15 adults",
  },
  {
    areaName: "Braai Unit 2",
    maxAdults: 10,
    description: "Braai Unit 2 - maximum 10 adults",
  },
  {
    areaName: "Braai Unit 3",
    maxAdults: 15,
    description: "Braai Unit 3 - maximum 15 adults",
  },
  {
    areaName: "Braai Unit 4",
    maxAdults: 10,
    description: "Braai Unit 4 - maximum 10 adults",
  },
  {
    areaName: "Braai Unit 5",
    maxAdults: 10,
    description: "Braai Unit 5 - maximum 10 adults",
  },
  {
    areaName: "Braai Unit 6",
    maxAdults: 10,
    description: "Braai Unit 6 - maximum 10 adults",
  },
  {
    areaName: "Grass Park Areas",
    maxAdults: 300,
    description: "Grass Park Areas - maximum 300 adults",
  },
  {
    areaName: "Theater Area",
    maxAdults: 100,
    maxChildren: 150,
    description: "Theater Area - maximum 100 adults / 150 children",
  },
];

/**
 * Get capacity rule by area name
 */
export function getAreaCapacityRule(areaName: string): AreaCapacityRule | null {
  const exact = AREA_CAPACITIES.find((rule) => rule.areaName.toLowerCase() === areaName.toLowerCase());
  if (exact) return exact;

  // Case-insensitive search
  return (
    AREA_CAPACITIES.find((rule) =>
      rule.areaName.toLowerCase().includes(areaName.toLowerCase())
    ) || null
  );
}

/**
 * Validate if guest count fits area capacity
 */
export function validateAreaCapacity(
  areaName: string,
  adults: number,
  children: number
): { isValid: boolean; errorMessage: string | null } {
  const rule = getAreaCapacityRule(areaName);

  if (!rule) {
    // No capacity rule defined for this area - allow
    return { isValid: true, errorMessage: null };
  }

  // If separate adult/child limits
  if (rule.maxAdults !== undefined || rule.maxChildren !== undefined) {
    if (rule.maxAdults !== undefined && adults > rule.maxAdults) {
      return {
        isValid: false,
        errorMessage: `This area can accommodate up to ${rule.maxAdults} adults.`,
      };
    }

    if (rule.maxChildren !== undefined && children > rule.maxChildren) {
      return {
        isValid: false,
        errorMessage: `This area can accommodate up to ${rule.maxChildren} children.`,
      };
    }

    return { isValid: true, errorMessage: null };
  }

  // If total capacity limit
  if (rule.maxCapacity !== undefined) {
    const totalGuests = adults + children;
    if (totalGuests > rule.maxCapacity) {
      return {
        isValid: false,
        errorMessage: `This area can accommodate up to ${rule.maxCapacity} people.`,
      };
    }
  }

  return { isValid: true, errorMessage: null };
}

/**
 * Get all area names for AI/frontend knowledge
 */
export function getAreaNamesForAI(): string[] {
  return AREA_CAPACITIES.map((rule) => rule.areaName);
}

/**
 * Get area capacity description for customer display
 */
export function getAreaCapacityDescription(areaName: string): string {
  const rule = getAreaCapacityRule(areaName);
  return rule?.description || "Capacity: Not specified";
}
