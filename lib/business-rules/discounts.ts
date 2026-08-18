/**
 * Central discount calculation logic for Chamlija
 * This is the single source of truth for discount rules
 * Used by: booking pricing, admin display, AI knowledge
 */

export type DiscountInfo = {
  discountPercentage: number;
  discountAmount: number;
  totalAfterDiscount: number;
};

/**
 * Discount rules based on advance booking time
 * 30+ days before: 30%
 * 15-29 days before: 25%
 * 8-14 days before: 10%
 * 0-7 days before: 0%
 */
export function calculateDiscountPercentage(
  bookingDate: string | null | undefined,
  creationDate?: string | null | undefined,
): number {
  if (!bookingDate) return 0;

  // Use creation date if provided, otherwise use today
  const created = creationDate ? new Date(creationDate) : new Date();
  const booking = new Date(bookingDate);

  // Normalize to midnight for fair day counting
  created.setUTCHours(0, 0, 0, 0);
  booking.setUTCHours(0, 0, 0, 0);

  // Calculate days between creation and booking date
  const diffMs = booking.getTime() - created.getTime();
  const daysBeforeEvent = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Apply discount rules
  if (daysBeforeEvent >= 30) {
    return 30; // 30% discount
  }

  if (daysBeforeEvent >= 15) {
    return 25; // 25% discount
  }

  if (daysBeforeEvent >= 8) {
    return 10; // 10% discount
  }

  return 0; // No discount
}

/**
 * Calculate discount amount for a given subtotal
 */
export function calculateDiscountAmount(subtotal: number, discountPercentage: number): number {
  const amount = (subtotal * discountPercentage) / 100;
  // Round to 2 decimal places
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate total after discount
 */
export function calculateTotalAfterDiscount(subtotal: number, discountPercentage: number): number {
  const discount = calculateDiscountAmount(subtotal, discountPercentage);
  const total = subtotal - discount;
  // Ensure non-negative and rounded to 2 decimals
  return Math.max(0, Math.round(total * 100) / 100);
}

/**
 * Get full discount information for display and calculations
 */
export function getDiscountInfo(
  subtotal: number,
  bookingDate: string | null | undefined,
  creationDate?: string | null | undefined,
): DiscountInfo {
  const discountPercentage = calculateDiscountPercentage(bookingDate, creationDate);
  const discountAmount = calculateDiscountAmount(subtotal, discountPercentage);
  const totalAfterDiscount = calculateTotalAfterDiscount(subtotal, discountPercentage);

  return {
    discountPercentage,
    discountAmount,
    totalAfterDiscount,
  };
}

/**
 * Get discount description for UI display
 */
export function getDiscountLabel(daysBeforeEvent: number): string {
  if (daysBeforeEvent >= 30) {
    return "Early Booking Discount (30 days+)";
  }

  if (daysBeforeEvent >= 15) {
    return "Early Booking Discount (15-29 days)";
  }

  if (daysBeforeEvent >= 8) {
    return "Early Booking Discount (8-14 days)";
  }

  return "No discount";
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(fromDate: string | Date, toDate: string | Date): number {
  const from = typeof fromDate === "string" ? new Date(fromDate) : fromDate;
  const to = typeof toDate === "string" ? new Date(toDate) : toDate;

  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(0, 0, 0, 0);

  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Validate discount percentage (ensure it's between 0 and 100)
 */
export function validateDiscountPercentage(percentage: number): boolean {
  return Number.isFinite(percentage) && percentage >= 0 && percentage <= 100;
}
