/**
 * Booked Dates Management
 * Store and retrieve dates that are fully booked
 */

export interface BookedDateEntry {
  date: string; // YYYY-MM-DD format
  reason?: string;
  bookingCount?: number;
  updatedAt?: string;
}

// Booked dates array - add dates here as they get booked
// Format: YYYY-MM-DD (e.g., "2026-08-20")
export const BOOKED_DATES: BookedDateEntry[] = [
  // Add booked dates here as they come in
  // Example: { date: "2026-08-20", reason: "School group booking", bookingCount: 1 }
];

/**
 * Check if a specific date is booked
 */
export function isDateBooked(dateStr: string): boolean {
  return BOOKED_DATES.some(entry => entry.date === dateStr);
}

/**
 * Get all booked dates for a month
 */
export function getBookedDatesForMonth(year: number, month: number): string[] {
  const monthStr = String(month).padStart(2, "0");
  return BOOKED_DATES
    .filter(entry => entry.date.startsWith(`${year}-${monthStr}`))
    .map(entry => entry.date);
}

/**
 * Get booking info for a date
 */
export function getBookingInfo(dateStr: string): BookedDateEntry | undefined {
  return BOOKED_DATES.find(entry => entry.date === dateStr);
}

/**
 * Add a booked date (for admin use)
 */
export function addBookedDate(date: string, reason?: string): void {
  if (!isDateBooked(date)) {
    BOOKED_DATES.push({
      date,
      reason,
      bookingCount: 1,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Remove a booked date (for admin use)
 */
export function removeBookedDate(date: string): void {
  const index = BOOKED_DATES.findIndex(entry => entry.date === date);
  if (index > -1) {
    BOOKED_DATES.splice(index, 1);
  }
}

/**
 * Format date for display
 */
export function formatDateDisplay(dateStr: string, language: "tr" | "en" = "en"): string {
  const date = new Date(`${dateStr}T00:00:00`);
  
  if (language === "tr") {
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get next available date
 */
export function getNextAvailableDate(startFromDate?: string): string {
  const start = startFromDate ? new Date(`${startFromDate}T00:00:00`) : new Date();
  const checkDate = new Date(start);
  
  // Check next 90 days
  for (let i = 0; i < 90; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (!isDateBooked(dateStr)) {
      return dateStr;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  return "No availability in next 90 days";
}

/**
 * Get available dates for next N days
 */
export function getAvailableDatesInRange(days: number = 14): string[] {
  const available: string[] = [];
  const checkDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (!isDateBooked(dateStr)) {
      available.push(dateStr);
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  return available;
}
