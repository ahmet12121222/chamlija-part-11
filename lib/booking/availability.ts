import type {
  BookingAvailabilityCheckInput,
  BookingAvailabilityResult,
  BookingTimeSlot,
  BusinessHours,
} from "./types";
import { calculateTotalVisitors } from "./pricing";

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  open: "09:00",
  close: "17:00",
};

const SLOT_INTERVAL_MINUTES = 30;

export function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
}

function formatMinutesAsTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isDateInPast(dateValue: string): boolean {
  if (!dateValue) {
    return true;
  }

  const selectedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(selectedDate.getTime())) {
    return true;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return selectedDate < today;
}

function getTodayMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function generateBookingTimeSlots(
  date: string,
  openingHours: BusinessHours = DEFAULT_BUSINESS_HOURS,
): BookingTimeSlot[] {
  if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
    return [];
  }

  const openMinutes = parseTimeToMinutes(openingHours.open);
  const closeMinutes = parseTimeToMinutes(openingHours.close);

  if (Number.isNaN(openMinutes) || Number.isNaN(closeMinutes) || closeMinutes <= openMinutes) {
    return [];
  }

  const slots: BookingTimeSlot[] = [];
  const isPastDate = isDateInPast(date);
  const today = new Date();
  const isToday =
    today.getFullYear() === Number(date.slice(0, 4)) &&
    today.getMonth() === Number(date.slice(5, 7)) - 1 &&
    today.getDate() === Number(date.slice(8, 10));

  for (let current = openMinutes; current < closeMinutes; current += SLOT_INTERVAL_MINUTES) {
    const slotTime = formatMinutesAsTime(current);

    if (isToday && current < getTodayMinutes()) {
      slots.push({
        id: slotTime,
        label: slotTime,
        time: slotTime,
        isAvailable: false,
        reason: "This time has already passed for today.",
      });
      continue;
    }

    if (isPastDate) {
      slots.push({
        id: slotTime,
        label: slotTime,
        time: slotTime,
        isAvailable: false,
        reason: "Booking dates in the past are not allowed.",
      });
      continue;
    }

    slots.push({
      id: slotTime,
      label: slotTime,
      time: slotTime,
      isAvailable: true,
      reason: "Available within business hours.",
    });
  }

  return slots;
}

export function checkBookingAvailability(
  input: BookingAvailabilityCheckInput,
): BookingAvailabilityResult {
  const totalVisitors = calculateTotalVisitors(input.visitors);

  if (totalVisitors <= 0) {
    return {
      isAvailable: false,
      availableTimes: [],
      message: "Please add at least one visitor to continue.",
    };
  }

  if (!input.date || Number.isNaN(new Date(`${input.date}T00:00:00`).getTime())) {
    return {
      isAvailable: false,
      availableTimes: [],
      message: "Please select a valid visit date.",
    };
  }

  if (isDateInPast(input.date)) {
    return {
      isAvailable: false,
      availableTimes: [],
      message: "Booking dates in the past are not allowed.",
    };
  }

  if (input.blockedDates?.includes(input.date)) {
    return {
      isAvailable: false,
      availableTimes: [],
      message: "This date is currently blocked for reservations.",
    };
  }

  const openingHours = input.openingHours ?? DEFAULT_BUSINESS_HOURS;
  const availableTimes = generateBookingTimeSlots(input.date, openingHours);

  if (input.maxDailyCapacity && totalVisitors > input.maxDailyCapacity) {
    return {
      isAvailable: false,
      availableTimes: [],
      message: `This group exceeds the daily capacity limit of ${input.maxDailyCapacity} visitors.`,
    };
  }

  if (input.maxTimeSlotCapacity && totalVisitors > input.maxTimeSlotCapacity) {
    return {
      isAvailable: false,
      availableTimes: [],
      message: `This group exceeds the maximum capacity for a single time slot.`,
    };
  }

  if (input.blockedTimeSlots) {
    const blockedEntries = input.blockedTimeSlots.filter(
      (slot) => slot.date === input.date && input.selectedTime && slot.time === input.selectedTime,
    );

    if (blockedEntries.length > 0) {
      return {
        isAvailable: false,
        availableTimes: availableTimes.map((slot) =>
          slot.time === input.selectedTime
            ? {
                ...slot,
                isAvailable: false,
                reason: "This time slot is blocked for reservations.",
              }
            : slot,
        ),
        message: "The selected time slot is currently unavailable.",
      };
    }
  }

  return {
    isAvailable: true,
    availableTimes,
    message: "Your selected date and guest count are valid.",
  };
}
