export interface VisitorCounts {
  adults: number;
  children3Plus: number;
  under3: number;
}

export interface BookingRecord {
  id: string;
  date: string;
  time: string;
  visitorCount: number;
}

export interface BusinessHours {
  open: string;
  close: string;
}

export interface BookingTimeSlot {
  id: string;
  label: string;
  time: string;
  isAvailable: boolean;
  reason?: string;
}

export interface BookingAvailabilityCheckInput {
  date: string;
  visitors: VisitorCounts;
  selectedTime?: string | null;
  openingHours?: BusinessHours;
  maxDailyCapacity?: number;
  maxTimeSlotCapacity?: number;
  existingBookings?: BookingRecord[];
  blockedDates?: string[];
  blockedTimeSlots?: Array<{ date: string; time: string }>;
}

export interface BookingAvailabilityResult {
  isAvailable: boolean;
  availableTimes: BookingTimeSlot[];
  message?: string;
}

export interface PicnicArea {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  image: string;
  features: string[];
  isSample?: boolean;
}
