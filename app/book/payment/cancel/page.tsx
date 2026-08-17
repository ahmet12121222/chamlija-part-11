import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="booking-ui min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Payment cancelled</div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Payment was cancelled</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          No charge was made. You can retry the payment or continue editing your reservation.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Return to reservation
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
