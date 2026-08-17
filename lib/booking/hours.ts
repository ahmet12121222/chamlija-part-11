// Canonical booking hours shared by the client UI and server-side validation.
export const BOOKING_OPEN_TIME = "09:00";
export const BOOKING_CLOSE_TIME = "17:00";
const SLOT_INTERVAL_MINUTES = 30;

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function toClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export const BOOKING_TIME_SLOTS: string[] = (() => {
  const open = toMinutes(BOOKING_OPEN_TIME);
  const close = toMinutes(BOOKING_CLOSE_TIME);
  const slots: string[] = [];

  for (let minutes = open; minutes <= close; minutes += SLOT_INTERVAL_MINUTES) {
    slots.push(toClock(minutes));
  }

  return slots;
})();

export function isValidBookingTime(value: string): boolean {
  return BOOKING_TIME_SLOTS.includes(value);
}
