import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

function formatStatus(status: string | null | undefined) {
  return (status ?? "pending").replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatMoney(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  return `R ${safeValue.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizePaymentMethod(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase().replace(/[-\s]+/g, "_");
}

function formatPaymentMethod(value: string | null | undefined) {
  const normalized = normalizePaymentMethod(value);
  if (!normalized) {
    return "Not selected";
  }

  if (normalized.includes("ikhokha")) {
    return "iKhokha";
  }

  if (normalized.includes("bank")) {
    return "Bank Transfer";
  }

  if (normalized.includes("manual") || normalized.includes("cash") || normalized.includes("gate")) {
    if (normalized.includes("cash") || normalized.includes("gate")) {
      return "Cash at Gate";
    }
    return "Manual Payment";
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatGuestCount(booking: { adults?: number | null; children_3_plus?: number | null; children_under_3?: number | null }) {
  const adults = Number(booking.adults ?? 0);
  const children3Plus = Number(booking.children_3_plus ?? 0);
  const childrenUnder3 = Number(booking.children_under_3 ?? 0);
  const total = adults + children3Plus + childrenUnder3;

  return `${total} guest${total === 1 ? "" : "s"}`;
}

function formatDisplayStatusLabel(value: string | null | undefined) {
  const normalized = String(value ?? "pending").trim().toLowerCase();

  if (normalized === "pending") return "Pending";
  if (normalized === "paid") return "Paid";
  if (normalized === "partially_paid") return "Partially Paid";
  if (normalized === "outstanding") return "Outstanding";
  if (normalized === "refund_pending") return "Refund Pending";
  if (normalized === "refunded") return "Refunded";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "completed") return "Completed";
  if (normalized === "failed") return "Failed";
  if (normalized === "rejected") return "Rejected";

  return formatStatus(value);
}

function formatBookingStatus(status: string | null | undefined) {
  const normalized = String(status ?? "pending").trim().toLowerCase();
  if (normalized === "confirmed" || normalized === "paid") return "Confirmed";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
  return "Pending";
}

function formatPaymentStatus(status: string | null | undefined) {
  const normalized = String(status ?? "pending").trim().toLowerCase();
  if (normalized === "paid" || normalized === "verified" || normalized === "approved") return "Paid";
  if (normalized === "failed" || normalized === "rejected") return "Failed";
  return "Pending";
}

function isBankTransferMethod(value: string | null | undefined) {
  const normalized = normalizePaymentMethod(value);
  if (!normalized) {
    return false;
  }

  return (
    normalized === "bank_transfer" ||
    normalized === "banktransfer" ||
    normalized === "manual" ||
    normalized === "manual_payment" ||
    normalized === "manual_bank_transfer" ||
    normalized === "manual_bank_payment" ||
    normalized === "bank_transfer_manual" ||
    normalized === "bank_transfer_manual_payment" ||
    normalized === "bank_transfer_payment" ||
    normalized.includes("bank") ||
    (normalized.includes("manual") && normalized.includes("bank"))
  );
}

function isPendingBankTransferBooking(booking: { payment_status?: string | null; payment_method?: string | null }) {
  const paymentStatus = String(booking.payment_status ?? "").trim().toLowerCase();
  if (!paymentStatus) {
    return false;
  }

  const allowedPendingStates = new Set([
    "pending",
    "pending_payment",
    "receipt_required",
    "receipt_uploaded",
    "under_review",
    "manual_review",
    "verification_pending",
  ]);

  if (!allowedPendingStates.has(paymentStatus)) {
    return false;
  }

  return isBankTransferMethod(booking.payment_method);
}

function isIhkokhaMethod(value: string | null | undefined) {
  const normalized = normalizePaymentMethod(value);
  return normalized.includes("ikhokha") || normalized.includes("ikhokha");
}

function formatShortReference(value: string | null | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "—";
  }

  if (raw.length <= 10) {
    return raw;
  }

  return `${raw.slice(0, 6)}...${raw.slice(-4)}`;
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDisplayTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value;
}

function getBookingStatusClasses(status: string | null | undefined) {
  const normalized = String(status ?? "pending").trim().toLowerCase();

  if (normalized === "confirmed" || normalized === "paid") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }

  if (normalized === "completed") {
    return "border border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border border-amber-200 bg-amber-50 text-amber-700";
}

function getPaymentStatusClasses(status: string | null | undefined) {
  const normalized = String(status ?? "pending").trim().toLowerCase();

  if (normalized === "paid" || normalized === "verified" || normalized === "approved") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "refund_pending") {
    return "border border-orange-200 bg-orange-50 text-orange-700";
  }

  if (normalized === "refunded") {
    return "border border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border border-amber-200 bg-amber-50 text-amber-700";
}

function buildAdminUrl({
  bookingId,
  filter = "all",
  search = "",
  date = "",
  bookingStatus = "",
  paymentStatus = "",
  paymentMethod = "",
}: {
  bookingId?: string | null;
  filter?: string;
  search?: string;
  date?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}) {
  const params = new URLSearchParams();

  if (filter && filter !== "all") {
    params.set("filter", filter);
  }

  if (search) {
    params.set("search", search);
  }

  if (date) {
    params.set("date", date);
  }

  if (bookingStatus) {
    params.set("bookingStatus", bookingStatus);
  }

  if (paymentStatus) {
    params.set("paymentStatus", paymentStatus);
  }

  if (paymentMethod) {
    params.set("paymentMethod", paymentMethod);
  }

  if (bookingId) {
    params.set("bookingId", bookingId);
  }

  const queryString = params.toString();
  return queryString ? `/admin?${queryString}` : "/admin";
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{
    bookingId?: string;
    filter?: string;
    search?: string;
    date?: string;
    bookingStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }>;
}) {
  try {
    await requireAdminAccess();
  } catch {
    redirect("/admin/login");
  }

  const params = searchParams ? await searchParams : {};
  const selectedBookingId = typeof params.bookingId === "string" ? params.bookingId : null;
  const activeFilter = typeof params.filter === "string" ? params.filter : "all";
  const searchQuery = typeof params.search === "string" ? params.search.trim().toLowerCase() : "";
  const selectedDate = typeof params.date === "string" ? params.date : "";
  const selectedBookingStatus = typeof params.bookingStatus === "string" ? params.bookingStatus : "";
  const selectedPaymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : "";
  const selectedPaymentMethod = typeof params.paymentMethod === "string" ? params.paymentMethod : "";

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("id, reservation_code, customer_name, email, phone_number, booking_date, booking_time, selected_area_id, total_price, booking_status, payment_status, payment_method, selected_equipment_ids, notes, adults, children_3_plus, children_under_3")
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
  const areaIds = [...new Set(items.map((booking) => booking.selected_area_id).filter((value): value is string => typeof value === "string" && value.trim().length > 0))];
  const allProductIds = [...new Set(
    items.flatMap((booking) => {
      const ids: string[] = [];
      if (typeof booking.selected_area_id === "string" && booking.selected_area_id.trim()) ids.push(booking.selected_area_id);
      if (Array.isArray(booking.selected_equipment_ids)) ids.push(...booking.selected_equipment_ids.filter((value): value is string => typeof value === "string" && value.trim().length > 0));
      return ids;
    })
  )];

  const productLookup: Record<string, string> = allProductIds.length
    ? Object.fromEntries(
        (
          await supabaseAdmin
            .from("products")
            .select("id, name")
            .in("id", allProductIds)
        )?.data?.map((product) => [product.id, product.name]) ?? []
      )
    : {};

  const areaLookup: Record<string, string> = Object.fromEntries(
    Object.entries(productLookup).filter(([id]) => areaIds.includes(id))
  );

  const filteredItems = items.filter((booking) => {
    const normalizedMethod = normalizePaymentMethod(booking.payment_method);
    const normalizedBookingStatus = String(booking.booking_status ?? "").trim().toLowerCase();
    const normalizedPaymentStatus = String(booking.payment_status ?? "").trim().toLowerCase();
    const combinedText = [
      booking.customer_name,
      booking.email,
      booking.reservation_code,
      booking.id,
      booking.selected_area_id,
      formatPaymentMethod(booking.payment_method),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (activeFilter === "bank_transfer") {
      if (!(isBankTransferMethod(booking.payment_method) && !isIhkokhaMethod(booking.payment_method))) {
        return false;
      }
    } else if (activeFilter === "ikhokha") {
      if (!isIhkokhaMethod(booking.payment_method)) {
        return false;
      }
    } else if (activeFilter === "pending_payment") {
      if (!(normalizedPaymentStatus === "pending" || normalizedPaymentStatus === "pending_payment")) {
        return false;
      }
    } else if (activeFilter === "paid") {
      if (!["paid", "verified", "confirmed", "approved"].includes(normalizedPaymentStatus)) {
        return false;
      }
    }

    if (searchQuery && !combinedText.includes(searchQuery)) {
      return false;
    }

    if (selectedDate && booking.booking_date !== selectedDate) {
      return false;
    }

    if (selectedBookingStatus && normalizedBookingStatus !== selectedBookingStatus.toLowerCase()) {
      return false;
    }

    if (selectedPaymentStatus && normalizedPaymentStatus !== selectedPaymentStatus.toLowerCase()) {
      return false;
    }

    if (selectedPaymentMethod && normalizedMethod !== selectedPaymentMethod.toLowerCase()) {
      return false;
    }

    return true;
  });

  const summary = {
    total: items.length,
    pendingPayments: items.filter((booking) => {
      const paymentStatus = String(booking.payment_status ?? "").trim().toLowerCase();
      return paymentStatus === "pending" || paymentStatus === "pending_payment" || paymentStatus === "verification_pending";
    }).length,
    confirmed: items.filter((booking) => ["confirmed", "paid", "approved", "verified"].includes(String(booking.booking_status ?? "").trim().toLowerCase())).length,
    cancelled: items.filter((booking) => ["cancelled", "canceled"].includes(String(booking.booking_status ?? "").trim().toLowerCase())).length,
    refundPending: items.filter((booking) => String(booking.payment_status ?? "").trim().toLowerCase() === "refund_pending").length,
  };

  const selectedBooking = items.find((booking) => booking.id === selectedBookingId) ?? null;
  const pendingBankTransferBooking = selectedBooking ? isPendingBankTransferBooking(selectedBooking) : false;
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
  const paidAmount = Number(selectedPayment?.amount ?? 0);
  const outstandingBalance = selectedBooking && paidAmount > 0 ? Math.max(Number(selectedBooking.total_price ?? 0) - paidAmount, 0) : null;
  const additionalServiceNames = selectedBooking
    ? (Array.isArray(selectedBooking.selected_equipment_ids) ? selectedBooking.selected_equipment_ids : [])
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => productLookup[value] || "Service")
        .filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Booking management</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total Bookings", value: summary.total, tone: "bg-slate-100 text-slate-700 border-slate-200", icon: "◫" },
            { label: "Pending Payments", value: summary.pendingPayments, tone: "bg-amber-50 text-amber-700 border-amber-200", icon: "◔" },
            { label: "Confirmed", value: summary.confirmed, tone: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✓" },
            { label: "Cancelled", value: summary.cancelled, tone: "bg-rose-50 text-rose-700 border-rose-200", icon: "−" },
            { label: "Refund Pending", value: summary.refundPending, tone: "bg-orange-50 text-orange-700 border-orange-200", icon: "↺" },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border bg-white p-4 shadow-sm ${card.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{card.label}</div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-current/20 bg-white/70 text-base font-bold">{card.icon}</span>
              </div>
              <div className="mt-4 text-3xl font-black tracking-tight">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_15px_35px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "bank_transfer", label: "Bank Transfer" },
              { value: "ikhokha", label: "iKhokha" },
              { value: "pending_payment", label: "Pending Payment" },
              { value: "paid", label: "Paid" },
            ].map((filterOption) => {
              const isActive = activeFilter === filterOption.value;
              return (
                <a
                  key={filterOption.value}
                  href={buildAdminUrl({
                    bookingId: selectedBookingId,
                    filter: filterOption.value,
                    search: searchQuery,
                    date: selectedDate,
                    bookingStatus: selectedBookingStatus,
                    paymentStatus: selectedPaymentStatus,
                    paymentMethod: selectedPaymentMethod,
                  })}
                  className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {filterOption.label}
                </a>
              );
            })}
          </div>

          <form method="GET" action="/admin" className="grid gap-3 lg:grid-cols-6">
            <input type="hidden" name="filter" value={activeFilter} />
            {selectedBookingId && <input type="hidden" name="bookingId" value={selectedBookingId} />}

            <label className="lg:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Search</span>
              <input
                type="search"
                name="search"
                defaultValue={searchQuery}
                placeholder="Name, email, reference..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</span>
              <input
                type="date"
                name="date"
                defaultValue={selectedDate}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Booking Status</span>
              <select
                name="bookingStatus"
                defaultValue={selectedBookingStatus}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payment Status</span>
              <select
                name="paymentStatus"
                defaultValue={selectedPaymentStatus}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refund_pending">Refund Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payment Method</span>
              <select
                name="paymentMethod"
                defaultValue={selectedPaymentMethod}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
              >
                <option value="">All</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="ikhokha">iKhokha</option>
                <option value="manual">Manual</option>
                <option value="cash_at_gate">Cash at Gate</option>
              </select>
            </label>

            <div className="flex items-end justify-end gap-2 lg:col-span-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Apply
              </button>
              <a
                href={buildAdminUrl({ bookingId: selectedBookingId, filter: activeFilter })}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </a>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_15px_35px_rgba(15,23,42,0.03)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Booking / Reference</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Date &amp; Time</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Guests</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Area</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Payment Method</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Payment Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Booking Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-lg font-semibold text-slate-900">No bookings found</div>
                        <div className="mt-2 text-sm text-slate-500">Try changing your filters or search.</div>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredItems.map((booking) => {
                  const guestCount = formatGuestCount(booking);
                  const areaName = booking.selected_area_id ? areaLookup[booking.selected_area_id] || "Selected area" : "Not selected";

                  return (
                    <tr key={booking.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{formatShortReference(booking.reservation_code || booking.id)}</div>
                        <div className="mt-1 text-xs text-slate-500">{booking.reservation_code ? "Ref" : "ID"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{booking.customer_name || "Unknown"}</div>
                        <div className="mt-1 text-xs text-slate-500">{booking.email || "No email"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{formatDisplayDate(booking.booking_date)}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatDisplayTime(booking.booking_time)}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{guestCount}</td>
                      <td className="px-4 py-4 text-slate-700">{areaName}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">{formatMoney(booking.total_price)}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{formatPaymentMethod(booking.payment_method)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPaymentStatusClasses(booking.payment_status)}`}>
                          {formatPaymentStatus(booking.payment_status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getBookingStatusClasses(booking.booking_status)}`}>
                          {formatBookingStatus(booking.booking_status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={buildAdminUrl({
                            bookingId: booking.id,
                            filter: activeFilter,
                            search: searchQuery,
                            date: selectedDate,
                            bookingStatus: selectedBookingStatus,
                            paymentStatus: selectedPaymentStatus,
                            paymentMethod: selectedPaymentMethod,
                          })}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-3 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Booking details</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{selectedBooking.customer_name || "Customer booking"}</h2>
              </div>
              <a
                href={buildAdminUrl({ filter: activeFilter, search: searchQuery, date: selectedDate, bookingStatus: selectedBookingStatus, paymentStatus: selectedPaymentStatus, paymentMethod: selectedPaymentMethod })}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </a>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getBookingStatusClasses(selectedBooking.booking_status)}`}>
                    {formatBookingStatus(selectedBooking.booking_status).toUpperCase()}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {formatPaymentMethod(selectedBooking.payment_method)}
                  </span>
                  <span className="ml-auto text-base font-black tracking-tight text-slate-900">{formatMoney(selectedBooking.total_price)}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                  <div><span className="text-slate-500">Booking Status:</span> <span className="font-medium text-slate-900">{formatBookingStatus(selectedBooking.booking_status)}</span></div>
                  <div><span className="text-slate-500">Payment Status:</span> <span className="font-medium text-slate-900">{formatDisplayStatusLabel(selectedBooking.payment_status)}</span></div>
                  <div><span className="text-slate-500">Payment Method:</span> <span className="font-medium text-slate-900">{formatPaymentMethod(selectedBooking.payment_method)}</span></div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Booking Summary</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <div><span className="text-slate-500">Reference:</span> <span className="font-medium text-slate-900">{selectedBooking.reservation_code || formatShortReference(selectedBooking.id)}</span></div>
                    <div><span className="text-slate-500">Customer:</span> <span className="font-medium text-slate-900">{selectedBooking.customer_name || "Unknown"}</span></div>
                    <div><span className="text-slate-500">Date:</span> <span className="font-medium text-slate-900">{formatDisplayDate(selectedBooking.booking_date)}</span></div>
                    <div><span className="text-slate-500">Status:</span> <span className={`ml-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getBookingStatusClasses(selectedBooking.booking_status)}`}>{formatBookingStatus(selectedBooking.booking_status)}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Payment Summary</div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <div><span className="text-slate-500">Total:</span> <span className="font-medium text-slate-900">{formatMoney(selectedBooking.total_price)}</span></div>
                    <div><span className="text-slate-500">Paid:</span> <span className="font-medium text-slate-900">{selectedPayment?.amount ? formatMoney(Number(selectedPayment.amount)) : "Not available"}</span></div>
                    <div><span className="text-slate-500">Outstanding:</span> <span className="font-medium text-slate-900">{outstandingBalance !== null ? formatMoney(outstandingBalance) : "Not available"}</span></div>
                    <div><span className="text-slate-500">Status:</span> <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPaymentStatusClasses(selectedBooking.payment_status)}`}>{formatDisplayStatusLabel(selectedBooking.payment_status)}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Booking Information</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <div><span className="text-slate-500">Area booked:</span> <span className="font-medium text-slate-900">{selectedBooking.selected_area_id ? areaLookup[selectedBooking.selected_area_id] || "Selected area" : "Not specified"}</span></div>
                    <div><span className="text-slate-500">Type of booking / function:</span> <span className="font-medium text-slate-900">Not specified</span></div>
                    <div><span className="text-slate-500">Guests:</span> <span className="font-medium text-slate-900">{formatGuestCount(selectedBooking)}</span></div>
                    <div><span className="text-slate-500">Arrival time:</span> <span className="font-medium text-slate-900">Not specified</span></div>
                    <div><span className="text-slate-500">Departure time:</span> <span className="font-medium text-slate-900">Not specified</span></div>
                    <div><span className="text-slate-500">Special requirements:</span> <span className="font-medium text-slate-900">{selectedBooking.notes || "Not specified"}</span></div>
                    <div><span className="text-slate-500">Additional services required:</span> <span className="font-medium text-slate-900">{additionalServiceNames.length > 0 ? additionalServiceNames.join(", ") : "Not specified"}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Payment Information</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <div><span className="text-slate-500">Total Amount:</span> <span className="font-medium text-slate-900">{formatMoney(selectedBooking.total_price)}</span></div>
                    <div><span className="text-slate-500">Discount Applied:</span> <span className="font-medium text-slate-900">Not available</span></div>
                    <div><span className="text-slate-500">Deposit Paid:</span> <span className="font-medium text-slate-900">Not available</span></div>
                    <div><span className="text-slate-500">Outstanding Balance:</span> <span className="font-medium text-slate-900">{outstandingBalance !== null ? formatMoney(outstandingBalance) : "Not available"}</span></div>
                    <div><span className="text-slate-500">Payment Due Date:</span> <span className="font-medium text-slate-900">Not available</span></div>
                    <div><span className="text-slate-500">Payment Received Date:</span> <span className="font-medium text-slate-900">Not available</span></div>
                    <div><span className="text-slate-500">Payment Method:</span> <span className="font-medium text-slate-900">{formatPaymentMethod(selectedBooking.payment_method)}</span></div>
                    <div><span className="text-slate-500">Payment Status:</span> <span className={`ml-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPaymentStatusClasses(selectedBooking.payment_status)}`}>{formatDisplayStatusLabel(selectedBooking.payment_status)}</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Notes / Special Requirements</div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{selectedBooking.notes || "No extra notes."}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {selectedBooking.payment_method === "cash_at_gate" && !["paid", "confirmed"].includes(selectedBooking.payment_status ?? "") && (
                  <form
                    action={`/api/admin/bookings/${selectedBooking.id}/payment/confirm`} method="POST"
                    data-review-form="true"
                    data-review-action="approve"
                    data-booking-id={selectedBooking.id}
                  >
                    <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                      Confirm Payment
                    </button>
                  </form>
                )}

                {pendingBankTransferBooking && (
                  <button
                    type="button"
                    data-confirm-payment-button="true"
                    data-booking-id={selectedBooking.id}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Confirm Payment
                  </button>
                )}

                <form action={`/api/admin/bookings/${selectedBooking.id}/cancel`} method="POST" className="flex items-center gap-2">
                  <button
                    type="button"
                    data-cancel-booking-button="true"
                    className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Cancel Booking
                  </button>
                </form>

                {selectedPayment?.receipt_url && (
                  <a
                    href={selectedPayment.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View Receipt
                  </a>
                )}
              </div>
            </div>

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

                  document.addEventListener('click', async (event) => {
                    const target = event.target instanceof Element ? event.target.closest('[data-confirm-payment-button="true"]') : null;
                    if (!target || !(target instanceof HTMLElement)) {
                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const bookingId = target.getAttribute('data-booking-id');
                    if (!bookingId) {
                      return;
                    }

                    const paymentNotice = document.getElementById('payment-confirmation-message');
                    const originalText = target.textContent || 'Confirm Payment';

                    target.disabled = true;
                    target.textContent = 'Confirming payment...';

                    if (paymentNotice) {
                      paymentNotice.hidden = true;
                      paymentNotice.textContent = '';
                      paymentNotice.className = 'mt-4 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700';
                    }

                    const requestUrl = '/api/admin/bookings/' + encodeURIComponent(bookingId) + '/payment/review';
                    console.log('Confirm payment request URL:', requestUrl);

                    try {
                      const formData = new FormData();
                      formData.append('action', 'approve');

                      console.log('Confirm payment request method: POST');
                      console.log('Confirm payment request body:', { action: 'approve' });

                      const response = await fetch(requestUrl, {
                        method: 'POST',
                        body: formData,
                      });

                      const responseText = await response.text();
                      let responseJson = {};
                      try {
                        responseJson = responseText ? JSON.parse(responseText) : {};
                      } catch {
                        responseJson = {};
                      }

                      console.log('Confirm payment response status:', response.status);
                      console.log('Confirm payment response JSON:', responseJson);

                      if (!response.ok) {
                        const errorMessage = responseJson?.error || responseJson?.message || 'Payment confirmation failed.';
                        const messageText = 'Payment confirmation failed: ' + errorMessage;

                        if (paymentNotice) {
                          paymentNotice.textContent = messageText;
                          paymentNotice.hidden = false;
                          paymentNotice.className = 'mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700';
                        } else {
                          alert(messageText);
                        }
                        return;
                      }

                      const paymentStatusNode = document.querySelector('[data-payment-status-display]');
                      const bookingStatusNode = document.querySelector('[data-booking-status-display]');
                      if (paymentStatusNode) {
                        paymentStatusNode.textContent = 'Paid';
                      }
                      if (bookingStatusNode) {
                        bookingStatusNode.textContent = 'Confirmed';
                      }

                      const paymentPanel = document.querySelector('[data-confirm-payment-panel]');
                      if (paymentPanel) {
                        paymentPanel.classList.add('border-emerald-300');
                      }

                      if (paymentNotice) {
                        paymentNotice.textContent = 'Payment confirmed successfully.';
                        paymentNotice.hidden = false;
                        paymentNotice.className = 'mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700';
                      }

                      const successText = 'Payment confirmed successfully.';
                      console.log(successText);
                      target.textContent = successText;
                      target.disabled = true;
                    } catch (error) {
                      console.error('Confirm payment failed:', error);
                      const messageText = 'Payment confirmation failed: Network or server error.';

                      if (paymentNotice) {
                        paymentNotice.textContent = messageText;
                        paymentNotice.hidden = false;
                        paymentNotice.className = 'mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700';
                      } else {
                        alert(messageText);
                      }

                      target.textContent = originalText;
                      target.disabled = false;
                    }
                  });

                  document.addEventListener('click', async (event) => {
                    const cancelTarget = event.target instanceof Element ? event.target.closest('[data-cancel-booking-button="true"]') : null;
                    if (!cancelTarget || !(cancelTarget instanceof HTMLElement)) {
                      return;
                    }

                    const cancelForm = cancelTarget.closest('form');
                    if (!cancelForm) {
                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const cancelNotice = document.getElementById('cancel-booking-message');
                    const cancelOriginalText = cancelTarget.textContent || 'Cancel Booking';

                    cancelTarget.disabled = true;
                    cancelTarget.textContent = 'Cancelling booking...';

                    if (cancelNotice) {
                      cancelNotice.hidden = true;
                      cancelNotice.textContent = '';
                      cancelNotice.className = 'mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700';
                    }

                    const requestUrl = cancelForm.action;
                    const formData = new FormData(cancelForm);
                    console.log('Cancel booking request URL:', requestUrl);
                    console.log('Cancel booking request method: POST');
                    console.log('Cancel booking request body:', Object.fromEntries(formData.entries()));

                    try {
                      const response = await fetch(requestUrl, {
                        method: 'POST',
                        body: formData,
                      });

                      const responseText = await response.text();
                      let responseJson = {};
                      try {
                        responseJson = responseText ? JSON.parse(responseText) : {};
                      } catch {
                        responseJson = {};
                      }

                      console.log('Cancel booking response status:', response.status);
                      console.log('Cancel booking response JSON:', responseJson);

                      if (!response.ok) {
                        const errorMessage = responseJson?.error || responseJson?.message || 'Booking cancellation failed.';
                        const messageText = 'Booking cancellation failed: ' + errorMessage;
                        if (cancelNotice) {
                          cancelNotice.textContent = messageText;
                          cancelNotice.hidden = false;
                          cancelNotice.className = 'mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700';
                        } else {
                          alert(messageText);
                        }
                        return;
                      }

                      if (cancelNotice) {
                        cancelNotice.textContent = 'Booking cancelled successfully.';
                        cancelNotice.hidden = false;
                        cancelNotice.className = 'mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700';
                      }

                      cancelTarget.textContent = 'Booking cancelled successfully.';
                      cancelTarget.disabled = true;
                    } catch (error) {
                      console.error('Cancel booking failed:', error);
                      const messageText = 'Booking cancellation failed: Network or server error.';
                      if (cancelNotice) {
                        cancelNotice.textContent = messageText;
                        cancelNotice.hidden = false;
                        cancelNotice.className = 'mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700';
                      } else {
                        alert(messageText);
                      }

                      cancelTarget.textContent = cancelOriginalText;
                      cancelTarget.disabled = false;
                    }
                  });
                })();
              `,
            }} />
          </div>
        </div>
      )}
    </main>
  );
}
