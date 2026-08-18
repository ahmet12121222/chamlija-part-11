import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

function formatStatus(status: string | null | undefined) {
  return (status ?? "pending").replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatMoney(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  return `R${Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00"}`;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ bookingId?: string }>;
}) {
  try {
    await requireAdminAccess();
  } catch {
    redirect("/admin/login");
  }

  const params = searchParams ? await searchParams : {};
  const selectedBookingId = typeof params.bookingId === "string" ? params.bookingId : null;

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("id, reservation_code, customer_name, email, phone_number, booking_date, booking_time, selected_area_id, total_price, booking_status, payment_status, payment_method, selected_equipment_ids, notes")
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true })
    .limit(200);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Error</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Unable to load bookings</h1>
          <p className="mt-3 text-slate-600">{error.message}</p>
        </div>
      </main>
    );
  }

  const items = bookings ?? [];
  const selectedBooking = items.find((booking) => booking.id === selectedBookingId) ?? null;
  const selectedPayment = selectedBooking
    ? (
        await supabaseAdmin
          .from("payments")
          .select("id, amount, refund_amount, status, provider, payment_method, receipt_url, receipt_file_name, review_status, reviewed_at, review_note")
          .eq("booking_id", selectedBooking.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      )?.data ?? null
    : null;
  const refundAmountDue = Number(selectedPayment?.refund_amount ?? selectedPayment?.amount ?? selectedBooking?.total_price ?? 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Booking management</h1>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Reference</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Time</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Area</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No bookings found.
                    </td>
                  </tr>
                )}

                {items.map((booking) => (
                  <tr key={booking.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{booking.reservation_code || booking.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{booking.customer_name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{booking.email || "No email"}</div>
                    </td>
                    <td className="px-4 py-3">{booking.booking_date || "—"}</td>
                    <td className="px-4 py-3">{booking.booking_time || "—"}</td>
                    <td className="px-4 py-3">{booking.selected_area_id || "—"}</td>
                    <td className="px-4 py-3">{formatMoney(booking.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatStatus(booking.booking_status)}
                      </span>
                      <div className="mt-2 text-xs text-slate-500">Payment: {formatStatus(booking.payment_status)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <form action="/admin" method="GET">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <button
                          type="submit"
                          className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Open
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-3 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Booking Details</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{selectedBooking.customer_name || "Customer booking"}</h2>
              </div>
              <form action="/admin" method="GET">
                <button type="submit" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Close</button>
              </form>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reservation Code</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedBooking.reservation_code || selectedBooking.id}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{formatMoney(selectedBooking.total_price)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Date</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedBooking.booking_date || "—"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Time</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedBooking.booking_time || "—"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Area</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedBooking.selected_area_id || "—"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Booking Status</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{formatStatus(selectedBooking.booking_status)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</div>
                <div className="mt-2 text-sm text-slate-900">{selectedBooking.email || "No email"}</div>
                <div className="text-sm text-slate-700">{selectedBooking.phone_number || "No phone number"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes</div>
                <div className="mt-2 text-sm text-slate-900">{selectedBooking.notes || "No extra notes."}</div>
              </div>
            </div>

            {/* Payment Status Section */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">Payment Status</div>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-xs text-slate-600">Method:</span>
                  <span className="ml-2 font-medium text-slate-900">{selectedBooking.payment_method ? formatStatus(selectedBooking.payment_method) : "Not selected"}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-600">Status:</span>
                  <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{formatStatus(selectedBooking.payment_status)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-600">Amount:</span>
                  <span className="ml-2 font-medium text-slate-900">{formatMoney(selectedBooking.total_price)}</span>
                </div>
              </div>
            </div>

            {/* Manual Payment Confirmation */}
            {selectedBooking.payment_method === "cash_at_gate" && !["paid", "confirmed"].includes(selectedBooking.payment_status ?? "") && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-900">Confirm Payment Received</div>
                <p className="mt-2 text-sm text-emerald-800">Did the customer pay cash at the gate? Click below to confirm payment received.</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <form
                    action={`/api/admin/bookings/${selectedBooking.id}/payment/confirm`} method="POST"
                    data-review-form="true"
                    data-review-action="approve"
                    data-booking-id={selectedBooking.id}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      ✓ Confirm Payment Received
                    </button>
                  </form>
                </div>
              </div>
            )}

            {selectedBooking.payment_status === "pending" && selectedBooking.payment_method === "bank_transfer" && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-900">Confirm Payment</div>
                <p className="mt-2 text-sm text-emerald-800">The payment is pending. Verify the bank transfer receipt to confirm and finalize this booking.</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <form
                    action={`/api/admin/bookings/${selectedBooking.id}/payment/review`} method="POST"
                    data-review-form="true"
                    data-review-action="approve"
                    data-booking-id={selectedBooking.id}
                  >
                    <input type="hidden" name="action" value="approve" />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      ✓ Confirm Payment
                    </button>
                  </form>
                </div>
              </div>
            )}

            {selectedBooking.payment_method === "bank_transfer" && (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <div className="text-sm font-semibold text-sky-900">Bank transfer review</div>
                <p className="mt-2 text-sm text-sky-800">Review the proof of payment upload before approving the booking.</p>

                {selectedPayment?.receipt_url ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-sky-200 bg-white p-3 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">Uploaded file</div>
                      <div className="mt-1">{selectedPayment.receipt_file_name || "Bank transfer receipt"}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={selectedPayment.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                      >
                        Open receipt
                      </a>
                      <form
                        action={`/api/admin/bookings/${selectedBooking.id}/payment/review`} method="POST"
                        className="inline-block"
                        data-review-form="true"
                        data-review-action="approve"
                        data-booking-id={selectedBooking.id}
                      >
                        <input type="hidden" name="action" value="approve" />
                        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700">
                          Approve payment
                        </button>
                      </form>
                      <form
                        action={`/api/admin/bookings/${selectedBooking.id}/payment/review`} method="POST"
                        className="inline-block"
                        data-review-form="true"
                        data-review-action="reject"
                        data-booking-id={selectedBooking.id}
                      >
                        <input type="hidden" name="action" value="reject" />
                        <button type="submit" className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
                          Reject receipt
                        </button>
                      </form>
                      <form
                        action={`/api/admin/bookings/${selectedBooking.id}/payment/review`} method="POST"
                        className="inline-block"
                        data-review-form="true"
                        data-review-action="resubmit"
                        data-booking-id={selectedBooking.id}
                      >
                        <input type="hidden" name="action" value="resubmit" />
                        <button type="submit" className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50">
                          Request new receipt
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-sky-200 bg-white p-3 text-sm text-sky-700">
                    No proof of payment uploaded yet.
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-semibold text-amber-900">Cancellation / Refund Policy</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                <li>Unpaid bookings can be cancelled without refund.</li>
                <li>Paid bookings can be cancelled with a full or partial refund request.</li>
                <li>Refund status remains refund pending until the provider confirms the refund.</li>
              </ul>
            </div>

            <form action={`/api/admin/bookings/${selectedBooking.id}/cancel`} method="POST" className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Refund option</label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <input type="radio" name="refundMode" value="full" defaultChecked />
                    <span>Full Refund</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <input type="radio" name="refundMode" value="partial" />
                    <span>Partial Refund</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <input type="radio" name="refundMode" value="none" />
                    <span>No Refund</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="refundAmount" className="text-sm font-medium text-slate-700">Partial refund amount (ZAR)</label>
                <input
                  id="refundAmount"
                  name="refundAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-sm font-semibold text-rose-900">Refund manually in iKhokha Dashboard</div>
                <p className="mt-2 text-sm text-rose-800">
                  Open iKhokha Dashboard → find the transaction → issue the full/partial refund → return here → Mark Refund as Completed.
                </p>
                <div className="mt-3 text-sm font-medium text-rose-900">
                  Exact refund amount to issue: <span id="refundAmountRequired">{formatMoney(Number(selectedBooking.total_price ?? 0))}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Cancel Booking
                </button>
              </div>
            </form>

            {selectedBooking.payment_status === "refund_pending" && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-900">Refund manually in iKhokha Dashboard</div>
                <p className="mt-2 text-sm text-amber-800">
                  Open iKhokha Dashboard → find the transaction → issue the full/partial refund → return here → Mark Refund as Completed.
                </p>
                <div className="mt-3 text-sm font-medium text-amber-900">
                  Exact refund amount to issue: {formatMoney(refundAmountDue)}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <form action={`/api/admin/bookings/${selectedBooking.id}/refund/complete`} method="POST">
                    <input type="hidden" name="refundAction" value="complete" />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Mark Refund as Completed
                    </button>
                  </form>

                  <form action={`/api/admin/bookings/${selectedBooking.id}/refund/complete`} method="POST">
                    <input type="hidden" name="refundAction" value="failed" />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Refund Failed / Not Completed
                    </button>
                  </form>
                </div>
              </div>
            )}

            <script dangerouslySetInnerHTML={{
              __html: `
                (() => {
                  const totalAmount = Number(${Number(selectedBooking.total_price ?? 0)});
                  const refundModeInputs = document.querySelectorAll('input[name="refundMode"]');
                  const refundAmountInput = document.getElementById('refundAmount');
                  const refundAmountRequired = document.getElementById('refundAmountRequired');

                  const updateRefundAmountText = () => {
                    const refundMode = Array.from(refundModeInputs).find((input) => input.checked)?.value ?? 'full';
                    const partialValue = Number(refundAmountInput?.value ?? 0);
                    const amount = refundMode === 'partial' ? partialValue : totalAmount;
                    if (refundAmountRequired) {
                      refundAmountRequired.textContent = 'R' + Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : '0.00';
                    }
                  };

                  refundModeInputs.forEach((input) => input.addEventListener('change', updateRefundAmountText));
                  refundAmountInput?.addEventListener('input', updateRefundAmountText);
                  updateRefundAmountText();
                })();
              `,
            }} />
          </div>
        </div>
      )}
    </main>
  );
}
