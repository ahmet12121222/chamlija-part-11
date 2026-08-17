"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BankTransferDisplay } from "@/components/booking/bank-transfer-display";
import { CashAtGateDisplay } from "@/components/booking/cash-at-gate-display";
import { PaymentMethodSelector } from "@/components/booking/payment-method-selector";
import type { BookingPaymentSummary, PaymentMethod } from "@/lib/payments/manual";

function PaymentContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    booking: BookingPaymentSummary | null;
    selectedMethod: PaymentMethod | null;
    reservationConfirmed: boolean;
    confirming: boolean;
  }>({
    loading: Boolean(bookingId),
    error: bookingId ? null : "No booking reference was supplied.",
    booking: null,
    selectedMethod: null,
    reservationConfirmed: false,
    confirming: false,
  });

  // Load booking details on mount
  useEffect(() => {
    if (!bookingId) {
      return;
    }

    let isMounted = true;

    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/details`);

        if (!response.ok) {
          throw new Error("Could not load booking details.");
        }

        const booking = (await response.json()) as BookingPaymentSummary;

        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          booking,
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load booking details.",
        }));
      }
    }

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const handleMethodSelect = (method: PaymentMethod) => {
    // Just select the method locally, don't submit
    setState((prev) => ({
      ...prev,
      selectedMethod: method,
      error: null,
    }));
  };

  const handleConfirmReservation = async () => {
    if (!state.booking || !state.selectedMethod) return;

    setState((prev) => ({
      ...prev,
      confirming: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/payments/manual/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: state.booking.id,
          paymentMethod: state.selectedMethod,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to confirm reservation.";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Response was not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      setState((prev) => ({
        ...prev,
        confirming: false,
        reservationConfirmed: true,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to confirm reservation.",
        confirming: false,
      }));
    }
  };

  const totalFormatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  });

  return (
    <main className="booking-ui min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:translate-y-px"
          >
            <span aria-hidden="true">←</span>
            Back to Home
          </Link>
        </div>

        <p className="text-sm font-semibold tracking-[0.18em] text-emerald-700">PAYMENT</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {state.loading ? "Loading your booking" : state.error && !state.selectedMethod ? "Error" : state.selectedMethod && !state.reservationConfirmed ? "Confirm Your Booking" : "Complete Your Booking"}
        </h1>

        {/* Loading State */}
        {state.loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500 h-8 w-8"></div>
            <p className="mt-4 text-slate-600">Loading your booking details...</p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="font-semibold text-rose-900">{state.error}</p>
            <Link href="/book" className="mt-3 inline-block rounded-full bg-rose-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
              Start New Booking
            </Link>
          </div>
        )}

        {/* Booking Loaded - Show Method Selector or Selected Method */}
        {!state.loading && state.booking && (
          <div className="mt-6 space-y-6">
            {/* Booking Summary */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Booking Summary</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-600">Reference:</div>
                  <div className="font-mono font-semibold text-slate-900">{state.booking.reservation_code || state.booking.id}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Total Amount:</div>
                  <div className="font-semibold text-slate-900">{totalFormatter.format(Number(state.booking.total_price ?? 0))}</div>
                </div>
                {state.booking.booking_date && (
                  <div>
                    <div className="text-xs text-slate-600">Date:</div>
                    <div className="font-medium text-slate-900">{state.booking.booking_date}</div>
                  </div>
                )}
                {state.booking.booking_time && (
                  <div>
                    <div className="text-xs text-slate-600">Time:</div>
                    <div className="font-medium text-slate-900">{state.booking.booking_time}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selection or Confirmation */}
            {!state.selectedMethod || state.error ? (
              // Step 1: Select payment method
              <>
                {state.error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 mb-4">
                    <p className="font-semibold text-rose-900">{state.error}</p>
                  </div>
                )}
                <PaymentMethodSelector onSelect={handleMethodSelect} loading={state.confirming} disabled={state.reservationConfirmed} />
              </>
            ) : !state.reservationConfirmed ? (
              // Step 2: Review and confirm reservation
              <div className="space-y-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-sm font-semibold text-emerald-900">Selected Payment Method</div>
                  <div className="mt-2 text-lg font-semibold text-emerald-700">
                    {state.selectedMethod === "bank_transfer" ? "Bank Transfer / EFT" : "Pay at the Gate – Cash"}
                  </div>
                  <p className="mt-2 text-sm text-emerald-800">
                    {state.selectedMethod === "bank_transfer"
                      ? "You will pay by making a secure bank transfer before your visit."
                      : "You will pay in cash when you arrive at Chamlija."}
                  </p>
                </div>

                {state.error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="font-semibold text-rose-900">{state.error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmReservation}
                    disabled={state.confirming}
                    className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-[0_12px_26px_rgba(16,185,129,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.confirming ? "Confirming..." : "Confirm Reservation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, selectedMethod: null, error: null }))}
                    disabled={state.confirming}
                    className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-center text-base font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change Payment Method
                  </button>
                </div>
              </div>
            ) : state.selectedMethod === "bank_transfer" ? (
              // Step 3: Confirmed - Show bank transfer details
              <BankTransferDisplay booking={state.booking} />
            ) : (
              // Step 3: Confirmed - Show cash at gate details
              <CashAtGateDisplay booking={state.booking} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">Loading payment details...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
