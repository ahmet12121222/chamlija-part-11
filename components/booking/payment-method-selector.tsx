"use client";

import type { PaymentMethod } from "@/lib/payments/manual";

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PaymentMethodSelector({ onSelect, loading = false, disabled = false }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Select Payment Method</div>

      <div className="grid gap-3 sm:grid-cols-1">
        {/* Bank Transfer / EFT */}
        <button
          type="button"
          onClick={() => onSelect("bank_transfer")}
          disabled={loading || disabled}
          className={`relative flex cursor-pointer rounded-2xl border-2 px-4 py-4 text-left transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""} border-slate-200 bg-white hover:border-slate-300 active:scale-[0.98]`}
        >
          <div>
            <div className="font-semibold text-slate-900">Bank Transfer / EFT</div>
            <p className="mt-1 text-sm text-slate-600">Pay securely by making a bank transfer before your visit. Your booking reference will be your payment reference.</p>
          </div>
        </button>

        {/* Pay at Gate - Cash */}
        <button
          type="button"
          onClick={() => onSelect("cash_at_gate")}
          disabled={loading || disabled}
          className={`relative flex cursor-pointer rounded-2xl border-2 px-4 py-4 text-left transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""} border-slate-200 bg-white hover:border-slate-300 active:scale-[0.98]`}
        >
          <div>
            <div className="font-semibold text-slate-900">Pay at the Gate – Cash</div>
            <p className="mt-1 text-sm text-slate-600">Pay the booking amount in cash when you arrive at Chamlija. Your booking will be confirmed once payment is received.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
