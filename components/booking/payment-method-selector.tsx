"use client";

import type { PaymentMethod } from "@/lib/payments/manual";

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  loading?: boolean;
  disabled?: boolean;
  selectedMethod?: PaymentMethod | null;
}

function PaymentIcon({ kind }: { kind: "bank" | "cash" }) {
  if (kind === "bank") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M4 9.5 12 4l8 5.5v1.5H4v-1.5Zm1.5 2.5h13V18a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-6Zm2.5 1.5h2v3H8v-3Zm6 0h2v3h-2v-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7.5h16v9H4v-9Zm2 2h12M8 20h8M9.5 4.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const paymentOptions: Array<{
  id: PaymentMethod;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  icon: "bank" | "cash";
}> = [
  {
    id: "bank_transfer",
    title: "Bank Transfer / EFT",
    subtitle: "Pay securely by bank transfer before your visit.",
    description: "Your booking reference will be used as the payment reference.",
    badge: "Recommended",
    icon: "bank",
  },
  {
    id: "cash_at_gate",
    title: "Pay at the Gate – Cash",
    subtitle: "Pay the full booking amount in cash when you arrive at Chamlija.",
    description: "Your reservation is received and payment will be made on arrival.",
    icon: "cash",
  },
];

export function PaymentMethodSelector({ onSelect, loading = false, disabled = false, selectedMethod = null }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Checkout</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Choose Your Payment Method</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          2 options
        </span>
      </div>

      <div className="grid gap-4">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethod === option.id;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Select ${option.title}`}
              onClick={() => onSelect(option.id)}
              disabled={loading || disabled}
              className={[
                "group relative w-full rounded-[1.5rem] border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200/80",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-[0_18px_38px_rgba(16,185,129,0.12)]"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                    isSelected
                      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-emerald-200 group-hover:text-emerald-700",
                  ].join(" ")}
                >
                  <PaymentIcon kind={option.icon} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900">{option.title}</span>
                    {option.badge && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-700">{option.subtitle}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                </div>

                <div
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-transparent group-hover:border-emerald-400",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
                      <path d="m5.2 10.2 2.6 2.6 6.9-7.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
