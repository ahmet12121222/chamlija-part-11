"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/lib/payments/manual";

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  loading?: boolean;
}

export function PaymentMethodSelector({ onSelect, loading = false }: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method);
    onSelect(method);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Select Payment Method</div>

      <div className="grid gap-3 sm:grid-cols-1">
        {/* Bank Transfer / EFT */}
        <label className={`relative flex cursor-pointer rounded-2xl border-2 px-4 py-4 transition-all ${selected === "bank_transfer" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="bank_transfer"
            checked={selected === "bank_transfer"}
            onChange={() => handleSelect("bank_transfer")}
            disabled={loading}
            className="mt-1"
          />
          <div className="ml-3 flex-1">
            <div className="font-semibold text-slate-900">Bank Transfer / EFT</div>
            <p className="mt-1 text-sm text-slate-600">Pay securely by making a bank transfer before your visit. Your booking reference will be your payment reference.</p>
          </div>
        </label>

        {/* Pay at Gate - Cash */}
        <label className={`relative flex cursor-pointer rounded-2xl border-2 px-4 py-4 transition-all ${selected === "cash_at_gate" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cash_at_gate"
            checked={selected === "cash_at_gate"}
            onChange={() => handleSelect("cash_at_gate")}
            disabled={loading}
            className="mt-1"
          />
          <div className="ml-3 flex-1">
            <div className="font-semibold text-slate-900">Pay at the Gate – Cash</div>
            <p className="mt-1 text-sm text-slate-600">Pay the booking amount in cash when you arrive at Chamlija. Your booking will be confirmed once payment is received.</p>
          </div>
        </label>
      </div>
    </div>
  );
}
