import type { PicnicArea } from "@/lib/booking/types";

interface PicnicAreaSelectorProps {
  areas: PicnicArea[];
  selectedAreaId: string | null;
  totalVisitors: number;
  onSelect: (areaId: string) => void;
}

export function PicnicAreaSelector({
  areas,
  selectedAreaId,
  totalVisitors,
  onSelect,
}: PicnicAreaSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {areas.map((area) => {
        const isEligible = totalVisitors === 0 || area.capacity >= totalVisitors;
        const isSelected = selectedAreaId === area.id;

        return (
          <button
            key={area.id}
            type="button"
            onClick={() => isEligible && onSelect(area.id)}
            disabled={!isEligible}
            className={[
              "rounded-[1.75rem] border p-4 text-left shadow-sm transition-all",
              isSelected
                ? "border-emerald-600 bg-emerald-50 shadow-md"
                : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/60",
              !isEligible && "cursor-not-allowed opacity-45",
            ].join(" ")}
            aria-label={`${area.name}. Capacity ${area.capacity}. ${isEligible ? "Available" : "Unavailable"}`}
          >
            <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-50 to-emerald-200 p-4">
              <div className="text-5xl">🧺</div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-900">{area.name}</h3>
              {!isEligible && (
                <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Full
                </span>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{area.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {area.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <div>
                <p className="text-slate-500">Capacity</p>
                <p className="font-bold text-slate-900">{area.capacity} guests</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Area price</p>
                <p className="font-bold text-slate-900">{new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                  maximumFractionDigits: 0,
                }).format(area.price)}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
