"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/payments/manual";
import type { BookingPaymentSummary } from "@/lib/payments/manual";

interface BankTransferDisplayProps {
  booking: BookingPaymentSummary;
}

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode: string;
  iban: string;
}

export function BankTransferDisplay({ booking }: BankTransferDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const reservationCode = booking.reservation_code || booking.id;

  useEffect(() => {
    async function fetchBankDetails() {
      try {
        const response = await fetch("/api/payments/bank-details");
        const data = await response.json();
        setBankDetails(data);
      } catch (error) {
        console.error("Failed to fetch bank details:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchBankDetails();
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading || !bankDetails) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-center text-sm text-slate-600">Loading bank details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-sm font-semibold text-emerald-900">Payment Instructions</div>
        <p className="mt-2 text-sm text-emerald-800">
          Please make a bank transfer using the details below. Use your <strong>booking reference</strong> as the payment reference so we can match your payment to your booking.
        </p>
      </div>

      {/* Bank Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bank Account Details</div>

        <div className="mt-4 space-y-3">
          {/* Bank Name */}
          <div>
            <div className="text-xs font-semibold text-slate-600">Bank Name</div>
            <div className="mt-1 font-medium text-slate-900">{bankDetails.bankName}</div>
          </div>

          {/* Account Name */}
          <div>
            <div className="text-xs font-semibold text-slate-600">Account Name</div>
            <div className="mt-1 font-medium text-slate-900">{bankDetails.accountName}</div>
          </div>

          {/* Account Number */}
          <div>
            <div className="text-xs font-semibold text-slate-600">Account Number</div>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="font-mono font-medium text-slate-900">{bankDetails.accountNumber}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(bankDetails.accountNumber, "account")}
                className="ml-2 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {copiedField === "account" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Branch Code */}
          <div>
            <div className="text-xs font-semibold text-slate-600">Branch Code</div>
            <div className="mt-1 font-mono font-medium text-slate-900">{bankDetails.branchCode}</div>
          </div>

          {/* IBAN (if available) */}
          {bankDetails.iban && (
            <div>
              <div className="text-xs font-semibold text-slate-600">IBAN</div>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-mono font-medium text-slate-900">{bankDetails.iban}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                  className="ml-2 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {copiedField === "iban" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {/* SWIFT Code (if available) */}
          {bankDetails.swiftCode && (
            <div>
              <div className="text-xs font-semibold text-slate-600">SWIFT Code</div>
              <div className="mt-1 font-mono font-medium text-slate-900">{bankDetails.swiftCode}</div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Reference Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment Reference</div>

        <div className="mt-4 space-y-3">
          {/* Booking Reference */}
          <div>
            <div className="text-xs font-semibold text-slate-600">Your Booking Reference</div>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="font-mono font-semibold text-emerald-900">{reservationCode}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(reservationCode, "reference")}
                className="ml-2 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {copiedField === "reference" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-600">Use this as the payment reference when making your transfer</p>
          </div>

          {/* Amount */}
          <div>
            <div className="text-xs font-semibold text-slate-600">Amount to Pay</div>
            <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="font-mono text-lg font-bold text-slate-900">{formatCurrency(booking.total_price)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-sm font-semibold text-amber-900">Important</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
          <li>Your booking will be marked as &quot;Awaiting Payment&quot; until we confirm your transfer</li>
          <li>Please include your booking reference in the payment description</li>
          <li>Bank transfers may take 1-2 business days to process</li>
          <li>We will send you a confirmation email once payment is received</li>
        </ul>
      </div>
    </div>
  );
}
