"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingProgress } from "@/components/booking/booking-progress";
import { PicnicAreaSelector } from "@/components/booking/picnic-area-selector";
import { checkBookingAvailability, DEFAULT_BUSINESS_HOURS } from "@/lib/booking/availability";
import { samplePicnicAreas } from "@/lib/booking/picnic-areas";
import { PRICING, calculateEntranceTotal, calculateTotalVisitors, formatCurrency } from "@/lib/booking/pricing";
import type { VisitorCounts } from "@/lib/booking/types";

const initialVisitors: VisitorCounts = {
  adults: 0,
  children3Plus: 0,
  under3: 0,
};

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [visitors, setVisitors] = useState<VisitorCounts>(initialVisitors);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalVisitors = useMemo(() => calculateTotalVisitors(visitors), [visitors]);
  const entranceTotal = useMemo(() => calculateEntranceTotal(visitors), [visitors]);

  const timeOptions = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const availability = checkBookingAvailability({
      date: selectedDate,
      visitors,
      selectedTime,
      openingHours: DEFAULT_BUSINESS_HOURS,
      maxDailyCapacity: 200,
      maxTimeSlotCapacity: 60,
      existingBookings: [],
      blockedDates: [],
      blockedTimeSlots: [],
    });

    return availability.availableTimes;
  }, [selectedDate, selectedTime, visitors]);

  function updateVisitorCount(key: keyof VisitorCounts, value: string) {
    const safeValue = Number(value);
    const nextValue = Number.isFinite(safeValue) ? Math.max(0, safeValue) : 0;

    setVisitors((previous) => ({ ...previous, [key]: nextValue }));
    setErrors((previous) => ({ ...previous, guests: "" }));
  }

  function validateStepOne() {
    const nextErrors: Record<string, string> = {};

    if (!selectedDate) {
      nextErrors.date = "Please select your visit date.";
    }

    if (selectedDate && new Date(`${selectedDate}T00:00:00`) < new Date(new Date().toDateString())) {
      nextErrors.date = "Booking dates in the past are not allowed.";
    }

    if (!selectedTime) {
      nextErrors.time = "Please choose an arrival time.";
    }

    if (selectedTime && !timeOptions.some((slot) => slot.time === selectedTime && slot.isAvailable)) {
      nextErrors.time = "The selected time is no longer available. Please choose another option.";
    }

    setErrors((previous) => ({ ...previous, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepTwo() {
    const nextErrors: Record<string, string> = {};

    if (totalVisitors <= 0) {
      nextErrors.guests = "Please add at least one visitor to continue.";
    }

    if (visitors.adults < 0 || visitors.children3Plus < 0 || visitors.under3 < 0) {
      nextErrors.guests = "Visitor counts cannot be negative.";
    }

    if (totalVisitors > 0 && selectedAreaId) {
      const selectedArea = samplePicnicAreas.find((area) => area.id === selectedAreaId);
      if (selectedArea && totalVisitors > selectedArea.capacity) {
        nextErrors.guests = "The selected picnic area cannot accommodate this group size.";
      }
    }

    setErrors((previous) => ({ ...previous, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function goToNextStep() {
    if (currentStep === 1 && validateStepOne()) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2 && validateStepTwo()) {
      setCurrentStep(3);
      return;
    }
  }

  const areaSelectionMessage =
    totalVisitors > 0
      ? `Selected group size: ${totalVisitors} visitors.`
      : "Add visitors to see which picnic areas are available.";

  const totalLabel = `${visitors.adults} Adults × R${PRICING.adult}, ${visitors.children3Plus} Children 3+ × R${PRICING.child3Plus}, ${visitors.under3} Under 3 × R${PRICING.under3}`;

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-emerald-800">
            <span aria-hidden="true">←</span>
            Back to Home
          </Link>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600">
            Reservation Request
          </div>
        </div>

        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Reservation</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Create a reservation</h1>
        </div>

        <BookingProgress currentStep={currentStep} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Adım 1</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Tarih ve saati seçin</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="visit-date" className="mb-2 block text-sm font-semibold text-slate-700">
                      Visit date
                    </label>
                    <input
                      id="visit-date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate}
                      onChange={(event) => {
                        setSelectedDate(event.target.value);
                        setSelectedTime("");
                        setErrors((previous) => ({ ...previous, date: "", time: "" }));
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                    {errors.date && <p className="mt-2 text-sm text-rose-600">{errors.date}</p>}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-slate-700">Arrival time</label>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {DEFAULT_BUSINESS_HOURS.open} - {DEFAULT_BUSINESS_HOURS.close}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedDate ? (
                        timeOptions.length > 0 ? (
                          timeOptions.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                if (!slot.isAvailable) {
                                  return;
                                }
                                setSelectedTime(slot.time);
                                setErrors((previous) => ({ ...previous, time: "" }));
                              }}
                              disabled={!slot.isAvailable}
                              className={[
                                "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                                slot.isAvailable
                                  ? selectedTime === slot.time
                                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                                  : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400",
                              ].join(" ")}
                            >
                              {slot.label}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            No available time slots for this date.
                          </div>
                        )
                      ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          Select a date to view available times.
                        </div>
                      )}
                    </div>
                    {errors.time && <p className="mt-2 text-sm text-rose-600">{errors.time}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Adım 2</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Ziyaretçi sayısı</h2>
                </div>

                <div className="space-y-5">
                  {([
                    ["adults", "Adults"],
                    ["children3Plus", "Children aged 3+"],
                    ["under3", "Children under 3"],
                  ] as Array<[keyof VisitorCounts, string]>).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{label}</p>
                        <p className="text-sm text-slate-500">
                          {key === "adults"
                            ? "R50 each"
                            : key === "children3Plus"
                              ? "R25 each"
                              : "Free"}
                        </p>
                      </div>

                      <input
                        type="number"
                        min={0}
                        value={visitors[key]}
                        onChange={(event) => updateVisitorCount(key, event.target.value)}
                        className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-bold text-slate-900 outline-none focus:border-emerald-400"
                        aria-label={label}
                      />
                    </div>
                  ))}
                </div>

                {errors.guests && <p className="text-sm text-rose-600">{errors.guests}</p>}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Adım 3</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Piknik alanı seçin</h2>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                  {areaSelectionMessage}
                </div>

                <PicnicAreaSelector
                  areas={samplePicnicAreas}
                  selectedAreaId={selectedAreaId}
                  totalVisitors={totalVisitors}
                  onSelect={(areaId) => {
                    setSelectedAreaId(areaId);
                    setErrors((previous) => ({ ...previous, area: "" }));
                  }}
                />

                {errors.area && <p className="text-sm text-rose-600">{errors.area}</p>}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep((previous) => Math.max(1, previous - 1))}
                disabled={currentStep === 1}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Geri
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
              >
                {currentStep === 3 ? "Rezervasyonu İncele" : "Devam Et"}
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Rezervasyon Özeti</p>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tarih</p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "Seçilmedi"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Varış Saati</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{selectedTime || "Seçilmedi"}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ziyaretçiler</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{totalVisitors || 0} toplam</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Fiyatlandırma</p>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <span>Adults × R{PRICING.adult}</span>
                  <span>R{visitors.adults * PRICING.adult}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Children 3+ × R{PRICING.child3Plus}</span>
                  <span>R{visitors.children3Plus * PRICING.child3Plus}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Children under 3 × R{PRICING.under3}</span>
                  <span>R{visitors.under3 * PRICING.under3}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Entrance total</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(entranceTotal)}</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">{totalLabel}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
