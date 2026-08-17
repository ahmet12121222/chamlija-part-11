import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

function formatStatus(value: string | null | undefined) {
  return (value ?? "pending").replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatMoney(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  return `R${Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00"}`;
}

export default async function AdminPaymentsPage() {
  try {
    await requireAdminAccess();
  } catch {
    redirect("/admin/login");
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("id, reservation_code, customer_name, email, phone_number, booking_date, booking_time, total_price, booking_status, payment_status, payment_method")
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true })
    .limit(250);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Error</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Unable to load payment review queue</h1>
          <p className="mt-3 text-slate-600">{error.message}</p>
        </div>
      </main>
    );
  }

  const items = bookings ?? [];
  const filtered = items.filter((booking) => booking.payment_method === "bank_transfer");

  const queue = {
    pending_review: filtered.filter((booking) => booking.payment_status === "under_review" || booking.payment_status === "receipt_uploaded" || booking.payment_status === "pending_payment"),
    under_review: filtered.filter((booking) => booking.payment_status === "under_review"),
    verified: filtered.filter((booking) => booking.payment_status === "verified" || booking.booking_status === "confirmed"),
    rejected: filtered.filter((booking) => booking.payment_status === "rejected"),
    receipt_required: filtered.filter((booking) => booking.payment_status === "receipt_required"),
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Payment verification</h1>
          </div>
          <a href="/admin" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to bookings
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Pending Review", queue.pending_review.length, "bg-sky-50 text-sky-700 border-sky-200"],
            ["Under Review", queue.under_review.length, "bg-amber-50 text-amber-700 border-amber-200"],
            ["Verified", queue.verified.length, "bg-emerald-50 text-emerald-700 border-emerald-200"],
            ["Rejected", queue.rejected.length, "bg-rose-50 text-rose-700 border-rose-200"],
            ["Receipt Required", queue.receipt_required.length, "bg-violet-50 text-violet-700 border-violet-200"],
          ].map(([label, count, className]) => (
            <div key={label} className={`rounded-[1.5rem] border p-4 ${className}`}>
              <div className="text-xs font-semibold uppercase tracking-[0.22em]">{label}</div>
              <div className="mt-3 text-3xl font-black">{String(count)}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-5">
          {[
            ["Pending Review", queue.pending_review],
            ["Under Review", queue.under_review],
            ["Verified", queue.verified],
            ["Rejected", queue.rejected],
            ["Receipt Required", queue.receipt_required],
          ].map(([sectionLabel, entries]) => (
            <section key={sectionLabel as string} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight text-slate-900">{sectionLabel as string}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{entries.length}</span>
              </div>

              {entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No bookings in this queue.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Reference</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Time</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(entries as Array<typeof items[number]>).map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">{booking.reservation_code || booking.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{booking.customer_name || "Unknown"}</div>
                            <div className="text-xs text-slate-500">{booking.email || "No email"}</div>
                          </td>
                          <td className="px-4 py-3">{booking.booking_date || "—"}</td>
                          <td className="px-4 py-3">{booking.booking_time || "—"}</td>
                          <td className="px-4 py-3">{formatMoney(booking.total_price)}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {formatStatus(booking.payment_status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a href={`/admin?bookingId=${booking.id}`} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                              Open record
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
