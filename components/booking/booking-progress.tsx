const steps = [
  "Date & Time",
  "Guests",
  "Picnic Area",
  "Details",
  "Payment",
];

interface BookingProgressProps {
  currentStep: number;
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-amber-400 text-slate-900"
                      : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {stepNumber}
              </div>
              <span
                className={[
                  "text-sm font-medium",
                  isCurrent ? "text-slate-900" : "text-slate-500",
                ].join(" ")}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
