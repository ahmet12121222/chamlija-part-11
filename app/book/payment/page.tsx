"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const [state, setState] = useState<{ loading: boolean; error: string | null; redirectUrl: string | null; paymentId: string | null; total: number | null }>({
    loading: Boolean(bookingId),
    error: bookingId ? null : "No booking reference was supplied.",
    redirectUrl: null,
    paymentId: null,
    total: null,
  });

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    let isMounted = true;

    async function startPayment() {
      try {
        const response = await fetch("/api/payments/ikhokha/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || "Unable to start the payment session.");
        }

        const redirectUrl = typeof result.checkoutUrl === "string" && result.checkoutUrl ? result.checkoutUrl : result.redirectUrl || null;

        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: null,
          redirectUrl,
          paymentId: result.paymentId ?? null,
          total: result.totalPrice ?? null,
        });

        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: error instanceof Error ? error.message : "Unable to start the payment session.",
          redirectUrl: null,
          paymentId: null,
          total: null,
        });
      }
    }

    startPayment();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

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
          {state.loading ? "Preparing your payment" : state.error ? "Payment is currently unavailable" : "Continue to secure payment"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {state.loading
            ? "Your secure payment session is being prepared. You will be redirected shortly."
            : state.error
              ? state.error
              : "Your reservation is confirmed and ready for payment. Please continue to the secure iKhokha payment page to complete your booking."}
        </p>

        {state.total !== null && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Total Amount</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">{totalFormatter.format(state.total)}</div>
          </div>
        )}

        {bookingId && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Booking reference: <span className="font-semibold text-slate-900">{bookingId}</span>
            {state.paymentId && (
              <>
                <span className="mx-2 text-slate-400">•</span>
                Payment reference: <span className="font-semibold text-slate-900">{state.paymentId}</span>
              </>
            )}
          </div>
        )}

        {!state.loading && state.redirectUrl && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={state.redirectUrl}
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(4,120,87,0.18)] transition hover:bg-emerald-800"
            >
              Continue to Payment
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>
        )}

        {!state.loading && !state.redirectUrl && !state.error && bookingId && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Return to Reservation
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              <span aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>
        )}

        {!state.loading && state.error && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
              Make Another Reservation
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              <span aria-hidden="true">←</span>
              Back to Home
            </Link>
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
