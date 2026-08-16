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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Payment</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {state.loading ? "Preparing your payment" : state.error ? "Payment is not available yet" : "Continue to secure payment"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {state.loading
            ? "We are creating your secure checkout session and will redirect you to the payment page in a moment."
            : state.error
              ? state.error
              : "Your booking is reserved and ready for payment. Please continue to the secure iKhokha checkout to complete your purchase."}
        </p>

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
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Continue to payment
            </a>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Return home
            </Link>
          </div>
        )}

        {!state.loading && !state.redirectUrl && !state.error && bookingId && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Back to booking
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
              Return home
            </Link>
          </div>
        )}

        {!state.loading && state.error && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
              Book again
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Return home
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
