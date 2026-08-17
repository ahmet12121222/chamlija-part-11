"use client";

import { useState } from "react";
import { isDateBooked, getBookedDatesForMonth, formatDateDisplay } from "@/lib/booking/booked-dates";

export function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const bookedDates = getBookedDatesForMonth(year, month + 1);

  const monthNames = [
    ["January", "Ocak"],
    ["February", "Şubat"],
    ["March", "Mart"],
    ["April", "Nisan"],
    ["May", "Mayıs"],
    ["June", "Haziran"],
    ["July", "Temmuz"],
    ["August", "Ağustos"],
    ["September", "Eylül"],
    ["October", "Ekim"],
    ["November", "Kasım"],
    ["December", "Aralık"],
  ];

  const dayNames = [
    ["Sun", "Paz"],
    ["Mon", "Pzt"],
    ["Tue", "Sal"],
    ["Wed", "Çar"],
    ["Thu", "Per"],
    ["Fri", "Cum"],
    ["Sat", "Cmt"],
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isLanguageTurkish = true; // You can pass this as a prop
  const langIndex = isLanguageTurkish ? 1 : 0;

  return (
    <div className="w-full max-w-md rounded-lg border border-[#d8e6d9] bg-white p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#1e352d]">
          {monthNames[month][langIndex]} {year}
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg border border-[#d8e6d9] bg-[#f0faf4] px-3 py-1.5 text-sm font-medium text-[#1e352d] hover:bg-[#e0f5e6]"
        >
          ← {isLanguageTurkish ? "Önceki" : "Previous"}
        </button>
        <button
          onClick={handleToday}
          className="rounded-lg border border-[#d8e6d9] bg-white px-3 py-1.5 text-xs font-medium text-[#1e352d] hover:bg-[#f0faf4]"
        >
          {isLanguageTurkish ? "Bugün" : "Today"}
        </button>
        <button
          onClick={handleNextMonth}
          className="rounded-lg border border-[#d8e6d9] bg-[#f0faf4] px-3 py-1.5 text-sm font-medium text-[#1e352d] hover:bg-[#e0f5e6]"
        >
          {isLanguageTurkish ? "Sonraki" : "Next"} →
        </button>
      </div>

      {/* Day Headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames[0].map((day, idx) => (
          <div key={`header-${idx}`} className="py-1 text-center text-xs font-semibold text-[#2f453d]">
            {isLanguageTurkish ? dayNames[1][idx] : dayNames[0][idx]}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="mb-4 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isBooked = isDateBooked(dateStr);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <div
              key={`day-${day}`}
              className={`
                flex items-center justify-center rounded-lg py-2 text-xs font-semibold text-center
                transition-colors duration-150
                ${
                  isBooked
                    ? "border border-red-300 bg-red-100 text-red-700 cursor-not-allowed"
                    : "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                }
                ${isToday ? "ring-2 ring-blue-400" : ""}
              `}
              title={isBooked ? (isLanguageTurkish ? "Dolu" : "Booked") : (isLanguageTurkish ? "Boş" : "Available")}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-[#e0e0e0] pt-3">
        <div className="text-xs text-[#2f453d] space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-green-300 bg-green-50" />
            <span>{isLanguageTurkish ? "Boş (Uygun)" : "Available"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-red-300 bg-red-100" />
            <span>{isLanguageTurkish ? "Dolu (Rezerve Edilmiş)" : "Booked"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
