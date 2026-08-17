"use client";

import { formatCurrency } from "@/lib/payments/manual";
import type { BookingPaymentSummary } from "@/lib/payments/manual";

interface CashAtGateDisplayProps {
  booking: BookingPaymentSummary;
}

export function CashAtGateDisplay({ booking }: CashAtGateDisplayProps) {
  const reservationCode = booking.reservation_code || booking.id;

  return (
    <div className="space-y-4">
      {/* Confirmation Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-2xl font-black text-emerald-700">✓</div>
        <div className="mt-3 text-lg font-semibold text-emerald-900">Payment Confirmed</div>
        <p className="mt-2 text-sm text-emerald-800">Your booking has been confirmed. You can pay the full amount in cash when you arrive at Chamlija.</p>
      </div>

      {/* Booking Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Booking Summary</div>

        <div className="mt-4 space-y-3">
          {/* Booking Reference */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-sm text-slate-600">Booking Reference:</span>
            <span className="font-mono font-semibold text-slate-900">{reservationCode}</span>
          </div>

          {/* Booking Date */}
          {booking.booking_date && (
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm text-slate-600">Booking Date:</span>
              <span className="font-medium text-slate-900">{booking.booking_date}</span>
            </div>
          )}

          {/* Booking Time */}
          {booking.booking_time && (
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm text-slate-600">Booking Time:</span>
              <span className="font-medium text-slate-900">{booking.booking_time}</span>
            </div>
          )}

          {/* Number of Guests */}
          {(booking.adults || booking.children_3_plus || booking.children_under_3) && (
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm text-slate-600">Guests:</span>
              <span className="font-medium text-slate-900">
                {[
                  booking.adults ? `${booking.adults} Adult${booking.adults > 1 ? "s" : ""}` : "",
                  booking.children_3_plus ? `${booking.children_3_plus} Child${booking.children_3_plus > 1 ? "ren" : ""} 3+` : "",
                  booking.children_under_3 ? `${booking.children_under_3} Under 3` : "",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Amount to Pay */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="font-semibold text-emerald-900">Amount to Pay:</span>
            <span className="font-mono text-lg font-bold text-emerald-700">{formatCurrency(booking.total_price)}</span>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What Happens Next</div>

        <ol className="mt-4 space-y-3">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
            <div>
              <div className="font-medium text-slate-900">Save Your Booking Reference</div>
              <p className="mt-0.5 text-sm text-slate-600">Write down or screenshot your booking reference number ({reservationCode})</p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
            <div>
              <div className="font-medium text-slate-900">Arrive at Chamlija</div>
              <p className="mt-0.5 text-sm text-slate-600">Come to the gate at your scheduled booking time</p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</span>
            <div>
              <div className="font-medium text-slate-900">Pay in Cash</div>
              <p className="mt-0.5 text-sm text-slate-600">Pay {formatCurrency(booking.total_price)} in cash to our staff at the gate</p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">4</span>
            <div>
              <div className="font-medium text-slate-900">Enjoy Your Visit</div>
              <p className="mt-0.5 text-sm text-slate-600">Our team will welcome you and help you get started</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Important Notes */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-sm font-semibold text-amber-900">Important</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
          <li>Please arrive on time for your booking</li>
          <li>We accept cash only for gate payments</li>
          <li>Have your booking reference ready when you arrive</li>
          <li>Your booking is confirmed but payment not yet received</li>
        </ul>
      </div>
    </div>
  );
}
