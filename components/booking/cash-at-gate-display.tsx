"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/payments/manual";
import type { BookingPaymentSummary } from "@/lib/payments/manual";

interface CashAtGateDisplayProps {
  booking: BookingPaymentSummary;
}

export function CashAtGateDisplay({ booking }: CashAtGateDisplayProps) {
  const reservationCode = booking.reservation_code || booking.id;
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reservationCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-center shadow-[0_18px_34px_rgba(16,185,129,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">✓</div>
        <div className="mt-4 text-2xl font-bold text-emerald-900">Reservation Received</div>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Your reservation has been received successfully. Payment will be made in cash when you arrive at Chamlija.
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Booking Details</div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Booking Reference</div>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                aria-label="Copy booking reference"
              >
                <span aria-hidden="true">⧉</span>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-2 font-mono text-lg font-black tracking-tight text-slate-900">{reservationCode}</div>
          </div>

          {booking.booking_date && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Date</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{booking.booking_date}</div>
            </div>
          )}

          {booking.booking_time && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Time</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{booking.booking_time}</div>
            </div>
          )}

          {(booking.adults || booking.children_3_plus || booking.children_under_3) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Guests</div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {[
                  booking.adults ? `${booking.adults} Adult${booking.adults > 1 ? "s" : ""}` : "",
                  booking.children_3_plus ? `${booking.children_3_plus} Child${booking.children_3_plus > 1 ? "ren" : ""} 3+` : "",
                  booking.children_under_3 ? `${booking.children_under_3} Under 3` : "",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Amount to Pay</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-emerald-900">{formatCurrency(booking.total_price)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What Happens Next</div>

        <ol className="mt-4 space-y-3">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
            <div className="text-sm text-slate-700">Keep your booking reference ready for your arrival.</div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
            <div className="text-sm text-slate-700">Arrive at Chamlija at your scheduled booking time.</div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</span>
            <div className="text-sm text-slate-700">Pay {formatCurrency(booking.total_price)} in cash at the gate.</div>
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={copyReference}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy Booking Reference"}
        </button>
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(16,185,129,0.18)] transition hover:bg-emerald-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
